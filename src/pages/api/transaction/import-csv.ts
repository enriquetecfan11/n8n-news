import type { APIRoute } from 'astro';
import { getCurrentSession, createTransactionForUser, getAssets, getPortfolioById } from '../../../lib/supabase';

interface CSVRow {
  date: string;
  type: string;
  ticker: string;
  quantity: string;
  unitPrice: string;
  fee?: string;
  notes?: string;
}

const parseCSV = (content: string): CSVRow[] => {
  const lines = content.trim().split('\n');
  if (lines.length < 2) {
    throw new Error('El archivo CSV debe tener encabezados y al menos una fila');
  }

  const headers = lines[0].split(',').map((h) => h.trim().toLowerCase());
  const requiredHeaders = ['date', 'type', 'ticker', 'quantity', 'unitprice'];

  // Validate headers
  const missingHeaders = requiredHeaders.filter((h) => !headers.includes(h));
  if (missingHeaders.length > 0) {
    throw new Error(`Encabezados faltantes: ${missingHeaders.join(', ')}`);
  }

  const rows: CSVRow[] = [];
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map((v) => v.trim());
    if (values.every((v) => !v)) continue; // Skip empty rows

    const row: any = {};
    headers.forEach((header, idx) => {
      row[header] = values[idx] || '';
    });

    rows.push({
      date: row.date,
      type: row.type?.toLowerCase(),
      ticker: row.ticker?.toUpperCase(),
      quantity: row.quantity,
      unitPrice: row.unitprice,
      fee: row.fee,
      notes: row.notes,
    });
  }

  return rows;
};

const validateRow = (row: CSVRow, rowNumber: number): string | null => {
  if (!row.date || !/^\d{4}-\d{2}-\d{2}$/.test(row.date)) {
    return `Fila ${rowNumber}: fecha inválida (formato: YYYY-MM-DD)`;
  }

  const validTypes = ['buy', 'sell', 'dividend', 'fee'];
  if (!row.type || !validTypes.includes(row.type)) {
    return `Fila ${rowNumber}: tipo debe ser buy, sell, dividend o fee`;
  }

  if (!row.ticker) {
    return `Fila ${rowNumber}: ticker es requerido`;
  }

  const quantity = parseFloat(row.quantity);
  if (isNaN(quantity) || quantity <= 0) {
    return `Fila ${rowNumber}: cantidad debe ser un número positivo`;
  }

  const unitPrice = parseFloat(row.unitPrice);
  if (isNaN(unitPrice) || unitPrice < 0) {
    return `Fila ${rowNumber}: precio unitario debe ser un número válido`;
  }

  if (row.fee) {
    const fee = parseFloat(row.fee);
    if (isNaN(fee) || fee < 0) {
      return `Fila ${rowNumber}: comisión debe ser un número válido`;
    }
  }

  return null;
};

export const POST: APIRoute = async ({ request }) => {
  try {
    const session = await getCurrentSession();
    if (!session) {
      return new Response(
        JSON.stringify({ error: 'No autorizado' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const portfolioId = formData.get('portfolioId') as string;

    if (!file) {
      return new Response(
        JSON.stringify({ error: 'Archivo requerido' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (!portfolioId) {
      return new Response(
        JSON.stringify({ error: 'Portfolio ID requerido' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Verify portfolio exists
    const portfolio = await getPortfolioById(portfolioId);
    if (!portfolio) {
      return new Response(
        JSON.stringify({ error: 'Portfolio no encontrado' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Read and parse CSV
    const content = await file.text();
    const rows = parseCSV(content);

    if (rows.length === 0) {
      return new Response(
        JSON.stringify({ error: 'El archivo CSV no contiene transacciones válidas' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Get all assets for ticker lookup
    const allAssets = await getAssets();
    const assetsByTicker = new Map(
      allAssets.map((a: any) => [a.ticker?.toUpperCase(), a.id])
    );

    // Validate all rows first
    const validationErrors: string[] = [];
    for (let i = 0; i < rows.length; i++) {
      const error = validateRow(rows[i], i + 2);
      if (error) {
        validationErrors.push(error);
      }
    }

    if (validationErrors.length > 0) {
      return new Response(
        JSON.stringify({ error: validationErrors.join('\n') }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Import transactions
    let importedCount = 0;
    const errors: string[] = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];

      try {
        // Find asset by ticker
        const assetId = assetsByTicker.get(row.ticker);
        if (!assetId) {
          errors.push(`Fila ${i + 2}: Activo con ticker "${row.ticker}" no encontrado`);
          continue;
        }

        await createTransactionForUser(
          session.user.id,
          portfolioId,
          assetId,
          row.type,
          parseFloat(row.quantity),
          parseFloat(row.unitPrice),
          row.date,
          row.fee ? parseFloat(row.fee) : null,
          row.notes || null
        );

        importedCount++;
      } catch (error) {
        errors.push(
          `Fila ${i + 2}: ${error instanceof Error ? error.message : 'Error desconocido'}`
        );
      }
    }

    if (importedCount === 0) {
      return new Response(
        JSON.stringify({ error: `No se importaron transacciones: ${errors.join('\n')}` }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const response: any = { count: importedCount };
    if (errors.length > 0) {
      response.warnings = errors;
    }

    return new Response(JSON.stringify(response), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error importing CSV:', error);
    return new Response(
      JSON.stringify({ error: 'Error al procesar el archivo CSV' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
