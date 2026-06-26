import type { APIRoute } from 'astro';
import {
  getCurrentSession,
  createTransactionForUser,
  getAssets,
  getPortfolioById,
  createAssetForUser,
} from '../../../lib/supabase';
import type { Asset } from '../../../lib/portfolio';
import { parseCsvContent, type ParsedTransactionRow } from '../../../utils/tradingViewCsv';

function findAssetId(
  row: ParsedTransactionRow,
  assetsByTicker: Map<string, string>,
  assetsBySymbol: Map<string, string>
): string | undefined {
  if (row.exchange) {
    const symbolKey = `${row.exchange}:${row.ticker}`;
    const bySymbol = assetsBySymbol.get(symbolKey);
    if (bySymbol) return bySymbol;
  }

  return assetsByTicker.get(row.ticker);
}

function buildAssetMaps(assets: Asset[]) {
  const assetsByTicker = new Map<string, string>();
  const assetsBySymbol = new Map<string, string>();

  for (const asset of assets) {
    const ticker = asset.ticker?.toUpperCase();
    if (!ticker) continue;

    if (!assetsByTicker.has(ticker)) {
      assetsByTicker.set(ticker, asset.id);
    }

    if (asset.exchange) {
      assetsBySymbol.set(`${asset.exchange.toUpperCase()}:${ticker}`, asset.id);
    }
  }

  return { assetsByTicker, assetsBySymbol };
}

export const POST: APIRoute = async ({ request }) => {
  try {
    const session = await getCurrentSession(
      request.headers.get('cookie')?.match(/sb-access-token=([^;]+)/)?.[1]
    );
    if (!session) {
      return new Response(JSON.stringify({ error: 'No autorizado' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const portfolioId = formData.get('portfolioId') as string;

    if (!file) {
      return new Response(JSON.stringify({ error: 'Archivo requerido' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (!portfolioId) {
      return new Response(JSON.stringify({ error: 'Portfolio ID requerido' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const portfolio = await getPortfolioById(portfolioId);
    if (!portfolio) {
      return new Response(JSON.stringify({ error: 'Portfolio no encontrado' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const content = await file.text();
    const { format, rows } = parseCsvContent(content);

    if (rows.length === 0) {
      return new Response(JSON.stringify({ error: 'El archivo CSV no contiene transacciones válidas' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const allAssets = await getAssets();
    let { assetsByTicker, assetsBySymbol } = buildAssetMaps(allAssets);

    let importedCount = 0;
    const errors: string[] = [];
    const warnings: string[] = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];

      try {
        let assetId = findAssetId(row, assetsByTicker, assetsBySymbol);

        if (!assetId && format === 'tradingview') {
          const createdAsset = await createAssetForUser(
            session.user.id,
            row.ticker,
            'stock',
            portfolio.base_currency || 'USD',
            row.ticker,
            row.exchange || undefined
          );

          assetId = createdAsset.id;
          assetsByTicker.set(row.ticker, assetId);
          if (row.exchange) {
            assetsBySymbol.set(`${row.exchange}:${row.ticker}`, assetId);
          }
          warnings.push(`Fila ${i + 2}: activo ${row.exchange ? `${row.exchange}:${row.ticker}` : row.ticker} creado automáticamente`);
        }

        if (!assetId) {
          errors.push(`Fila ${i + 2}: activo con ticker "${row.ticker}" no encontrado`);
          continue;
        }

        await createTransactionForUser(
          session.user.id,
          portfolioId,
          assetId,
          row.type,
          row.quantity,
          row.unitPrice,
          row.date,
          row.fee,
          row.notes
        );

        importedCount++;
      } catch (error) {
        errors.push(`Fila ${i + 2}: ${error instanceof Error ? error.message : 'Error desconocido'}`);
      }
    }

    if (importedCount === 0) {
      return new Response(
        JSON.stringify({ error: `No se importaron transacciones: ${errors.join('\n')}` }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const response: { count: number; format: string; warnings?: string[] } = {
      count: importedCount,
      format,
    };

    if (warnings.length > 0 || errors.length > 0) {
      response.warnings = [...warnings, ...errors];
    }

    return new Response(JSON.stringify(response), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error importing CSV:', error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Error al procesar el archivo CSV',
      }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
