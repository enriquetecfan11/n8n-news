import type { Asset, Transaction } from '../lib/portfolio';

export type CsvFormat = 'native' | 'tradingview';

export interface ParsedTransactionRow {
  date: string;
  type: 'buy' | 'sell' | 'dividend' | 'fee';
  ticker: string;
  exchange: string | null;
  quantity: number;
  unitPrice: number;
  fee: number | null;
  notes: string | null;
}

const TRADINGVIEW_HEADERS = ['symbol', 'side', 'qty', 'fill price', 'commission', 'closing time'];
const NATIVE_HEADERS = ['date', 'type', 'ticker', 'quantity', 'unitprice'];

export function parseCsvLine(line: string): string[] {
  const values: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const next = line[i + 1];

    if (char === '"' && inQuotes && next === '"') {
      current += '"';
      i++;
      continue;
    }

    if (char === '"') {
      inQuotes = !inQuotes;
      continue;
    }

    if (char === ',' && !inQuotes) {
      values.push(current.trim());
      current = '';
      continue;
    }

    current += char;
  }

  values.push(current.trim());
  return values;
}

export function parseCsvContent(content: string): { format: CsvFormat; rows: ParsedTransactionRow[] } {
  const lines = content
    .replace(/^\uFEFF/, '')
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length < 2) {
    throw new Error('El archivo CSV debe tener encabezados y al menos una fila');
  }

  const headers = parseCsvLine(lines[0]).map((h) => h.trim().toLowerCase());
  const format = detectCsvFormat(headers);

  const rows: ParsedTransactionRow[] = [];
  for (let i = 1; i < lines.length; i++) {
    const values = parseCsvLine(lines[i]);
    if (values.every((value) => !value)) continue;

    const row: Record<string, string> = {};
    headers.forEach((header, index) => {
      row[header] = values[index] ?? '';
    });

    rows.push(format === 'tradingview' ? parseTradingViewRow(row, i + 1) : parseNativeRow(row, i + 1));
  }

  return { format, rows };
}

export function detectCsvFormat(headers: string[]): CsvFormat {
  const normalized = headers.map((h) => h.trim().toLowerCase());
  const hasTradingView = TRADINGVIEW_HEADERS.every((header) => normalized.includes(header));
  if (hasTradingView) return 'tradingview';

  const missingNative = NATIVE_HEADERS.filter((header) => !normalized.includes(header));
  if (missingNative.length === 0) return 'native';

  throw new Error(
    'Formato CSV no reconocido. Usa el formato nativo (date,type,ticker,...) o el de TradingView (Symbol,Side,Qty,...)'
  );
}

function parseTradingViewRow(row: Record<string, string>, rowNumber: number): ParsedTransactionRow {
  const symbol = row.symbol?.trim();
  const side = row.side?.trim().toLowerCase();
  const qty = row.qty?.trim();
  const fillPrice = row['fill price']?.trim();
  const commission = row.commission?.trim();
  const closingTime = row['closing time']?.trim();

  if (!symbol) throw new Error(`Fila ${rowNumber}: Symbol es requerido`);
  if (!side || !['buy', 'sell'].includes(side)) {
    throw new Error(`Fila ${rowNumber}: Side debe ser Buy o Sell`);
  }

  const quantity = parseNumber(qty, `Fila ${rowNumber}: Qty inválida`);
  const unitPrice = parseNumber(fillPrice, `Fila ${rowNumber}: Fill Price inválido`);
  const fee = commission ? parseNumber(commission, `Fila ${rowNumber}: Commission inválida`) : 0;

  if (quantity <= 0) throw new Error(`Fila ${rowNumber}: Qty debe ser mayor que 0`);
  if (unitPrice < 0) throw new Error(`Fila ${rowNumber}: Fill Price no puede ser negativo`);
  if (fee < 0) throw new Error(`Fila ${rowNumber}: Commission no puede ser negativa`);

  const { exchange, ticker } = parseTradingViewSymbol(symbol);
  const date = parseClosingTime(closingTime, rowNumber);

  return {
    date,
    type: side as 'buy' | 'sell',
    ticker,
    exchange,
    quantity,
    unitPrice,
    fee,
    notes: null,
  };
}

function parseNativeRow(row: Record<string, string>, rowNumber: number): ParsedTransactionRow {
  const date = row.date?.trim();
  const type = row.type?.trim().toLowerCase();
  const ticker = row.ticker?.trim().toUpperCase();
  const quantity = row.quantity?.trim();
  const unitPrice = row.unitprice?.trim();
  const fee = row.fee?.trim();
  const notes = row.notes?.trim();

  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    throw new Error(`Fila ${rowNumber}: fecha inválida (formato: YYYY-MM-DD)`);
  }

  const validTypes = ['buy', 'sell', 'dividend', 'fee'];
  if (!type || !validTypes.includes(type)) {
    throw new Error(`Fila ${rowNumber}: tipo debe ser buy, sell, dividend o fee`);
  }

  if (!ticker) throw new Error(`Fila ${rowNumber}: ticker es requerido`);

  const parsedQuantity = parseNumber(quantity, `Fila ${rowNumber}: cantidad inválida`);
  const parsedUnitPrice = parseNumber(unitPrice, `Fila ${rowNumber}: precio unitario inválido`);

  if (parsedQuantity <= 0) throw new Error(`Fila ${rowNumber}: cantidad debe ser mayor que 0`);
  if (parsedUnitPrice < 0) throw new Error(`Fila ${rowNumber}: precio unitario no puede ser negativo`);

  let parsedFee: number | null = null;
  if (fee) {
    parsedFee = parseNumber(fee, `Fila ${rowNumber}: comisión inválida`);
    if (parsedFee < 0) throw new Error(`Fila ${rowNumber}: comisión no puede ser negativa`);
  }

  return {
    date,
    type: type as ParsedTransactionRow['type'],
    ticker,
    exchange: null,
    quantity: parsedQuantity,
    unitPrice: parsedUnitPrice,
    fee: parsedFee,
    notes: notes || null,
  };
}

function parseNumber(value: string | undefined, errorMessage: string): number {
  const parsed = parseFloat(value || '');
  if (Number.isNaN(parsed)) throw new Error(errorMessage);
  return parsed;
}

export function parseTradingViewSymbol(symbol: string): { exchange: string | null; ticker: string } {
  const trimmed = symbol.trim();
  const colonIndex = trimmed.lastIndexOf(':');

  if (colonIndex > 0) {
    return {
      exchange: trimmed.slice(0, colonIndex).toUpperCase(),
      ticker: trimmed.slice(colonIndex + 1).toUpperCase(),
    };
  }

  return {
    exchange: null,
    ticker: trimmed.toUpperCase(),
  };
}

export function formatTradingViewSymbol(exchange: string | null | undefined, ticker: string): string {
  const cleanTicker = ticker.trim().toUpperCase();
  if (!cleanTicker) return '';

  const cleanExchange = exchange?.trim().toUpperCase();
  return cleanExchange ? `${cleanExchange}:${cleanTicker}` : cleanTicker;
}

function parseClosingTime(value: string | undefined, rowNumber: number): string {
  if (!value) throw new Error(`Fila ${rowNumber}: Closing Time es requerido`);

  const dateTimeMatch = value.match(/^(\d{4}-\d{2}-\d{2})(?:[ T](\d{2}:\d{2}(?::\d{2})?))?$/);
  if (!dateTimeMatch) {
    throw new Error(`Fila ${rowNumber}: Closing Time inválido (esperado: YYYY-MM-DD HH:MM:SS)`);
  }

  return dateTimeMatch[1];
}

function formatClosingTime(date: string): string {
  const dateOnly = date.slice(0, 10);
  return `${dateOnly} 13:30:00`;
}

function escapeCsvValue(value: string | number): string {
  const stringValue = String(value);
  if (/[",\n]/.test(stringValue)) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }
  return stringValue;
}

export function toTradingViewCsv(
  transactions: Transaction[],
  assets: Map<string, Asset>
): string {
  const header = 'Symbol,Side,Qty,Fill Price,Commission,Closing Time';
  const lines = [header];

  const exportable = transactions
    .filter((tx) => tx.type === 'buy' || tx.type === 'sell')
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  for (const tx of exportable) {
    const asset = assets.get(tx.asset_id);
    const symbol = formatTradingViewSymbol(asset?.exchange, asset?.ticker || '');
    const side = tx.type === 'buy' ? 'Buy' : 'Sell';

    lines.push(
      [
        escapeCsvValue(symbol),
        side,
        tx.quantity,
        tx.unit_price,
        tx.fee ?? 0,
        formatClosingTime(tx.date),
      ].join(',')
    );
  }

  return `${lines.join('\n')}\n`;
}

export function toNativeCsv(
  transactions: Transaction[],
  assets: Map<string, Asset>
): string {
  const header = 'date,type,ticker,quantity,unitPrice,fee,notes';
  const lines = [header];

  const sorted = [...transactions].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  for (const tx of sorted) {
    const asset = assets.get(tx.asset_id);
    lines.push(
      [
        tx.date.slice(0, 10),
        tx.type,
        asset?.ticker || '',
        tx.quantity,
        tx.unit_price,
        tx.fee ?? '',
        escapeCsvValue(tx.notes || ''),
      ].join(',')
    );
  }

  return `${lines.join('\n')}\n`;
}
