import type { Database } from './database.types';

export type Portfolio = Database['public']['Tables']['portfolios']['Row'];
export type Asset = Database['public']['Tables']['assets']['Row'];
export type Transaction = Database['public']['Tables']['transactions']['Row'];

export interface Holding {
  assetId: string;
  assetName: string;
  ticker: string;
  type: 'stock' | 'etf' | 'crypto' | 'cash';
  currency: string;
  quantity: number;
  averagePrice: number;
  totalCost: number;
  currentPrice: number;
  currentValue: number;
  pnlAbsolute: number;
  pnlPercent: number;
}

export interface PortfolioSummary {
  totalValue: number;
  totalCost: number;
  pnlAbsolute: number;
  pnlPercent: number;
  holdings: Holding[];
  byType: Record<string, { count: number; value: number; percent: number }>;
}

export interface PortfolioDashboard extends PortfolioSummary {
  recentTransactions: Transaction[];
  lastUpdated: Date;
}

export function getHoldings(
  transactions: Transaction[],
  assets: Map<string, Asset>,
  currentPrices: Map<string, number> = new Map()
): Holding[] {
  const holdings: Map<string, Holding> = new Map();

  // Agrupar transacciones por activo
  for (const tx of transactions) {
    const asset = assets.get(tx.asset_id);
    if (!asset) continue;

    const key = tx.asset_id;
    let holding = holdings.get(key);

    if (!holding) {
      holding = {
        assetId: tx.asset_id,
        assetName: asset.name,
        ticker: asset.ticker || '',
        type: asset.type as 'stock' | 'etf' | 'crypto' | 'cash',
        currency: asset.currency,
        quantity: 0,
        averagePrice: 0,
        totalCost: 0,
        currentPrice: currentPrices.get(tx.asset_id) || tx.unit_price,
        currentValue: 0,
        pnlAbsolute: 0,
        pnlPercent: 0,
      };
      holdings.set(key, holding);
    }

    // Procesar según tipo de transacción
    switch (tx.type) {
      case 'buy':
        const buyTotal = tx.quantity * tx.unit_price + (tx.fee || 0);
        holding.totalCost += buyTotal;
        holding.quantity += tx.quantity;
        break;
      case 'sell':
        const sellTotal = tx.quantity * tx.unit_price - (tx.fee || 0);
        const soldCost = (holding.totalCost / holding.quantity) * tx.quantity;
        holding.totalCost = Math.max(0, holding.totalCost - soldCost);
        holding.quantity = Math.max(0, holding.quantity - tx.quantity);
        break;
      case 'dividend':
        // Los dividendos añaden valor en efectivo
        if (holding.type === 'cash') {
          holding.totalCost += tx.unit_price * tx.quantity;
          holding.quantity += tx.quantity;
        }
        break;
      case 'fee':
        holding.totalCost += tx.unit_price;
        break;
    }
  }

  // Calcular precios promedio y P&L
  for (const holding of holdings.values()) {
    if (holding.quantity > 0) {
      holding.averagePrice = holding.totalCost / holding.quantity;
      holding.currentPrice = currentPrices.get(holding.assetId) || holding.averagePrice;
      holding.currentValue = holding.quantity * holding.currentPrice;
      holding.pnlAbsolute = holding.currentValue - holding.totalCost;
      holding.pnlPercent = (holding.pnlAbsolute / holding.totalCost) * 100;
    } else {
      holding.currentValue = 0;
      holding.pnlAbsolute = 0;
      holding.pnlPercent = 0;
    }
  }

  return Array.from(holdings.values()).filter((h) => h.quantity > 0);
}

export function getPortfolioSummary(holdings: Holding[]): PortfolioSummary {
  const summary: PortfolioSummary = {
    totalValue: 0,
    totalCost: 0,
    pnlAbsolute: 0,
    pnlPercent: 0,
    holdings,
    byType: {},
  };

  const typeMap: Map<string, { count: number; value: number; cost: number }> = new Map();

  for (const holding of holdings) {
    summary.totalValue += holding.currentValue;
    summary.totalCost += holding.totalCost;

    const type = holding.type;
    if (!typeMap.has(type)) {
      typeMap.set(type, { count: 0, value: 0, cost: 0 });
    }

    const typeData = typeMap.get(type)!;
    typeData.count += 1;
    typeData.value += holding.currentValue;
    typeData.cost += holding.totalCost;
  }

  summary.pnlAbsolute = summary.totalValue - summary.totalCost;
  summary.pnlPercent = summary.totalCost > 0 ? (summary.pnlAbsolute / summary.totalCost) * 100 : 0;

  // Construir distribución por tipo
  for (const [type, data] of typeMap) {
    summary.byType[type] = {
      count: data.count,
      value: data.value,
      percent: summary.totalValue > 0 ? (data.value / summary.totalValue) * 100 : 0,
    };
  }

  return summary;
}

export function formatCurrency(value: number, currency: string = 'EUR'): string {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatPercent(value: number): string {
  const sign = value > 0 ? '+' : '';
  return `${sign}${value.toFixed(2)}%`;
}

export function getPnLColor(pnl: number): string {
  return pnl >= 0 ? '#22c55e' : '#ef4444';
}

export function getPnLClass(pnl: number): string {
  return pnl >= 0 ? 'pnl-positive' : 'pnl-negative';
}

// Cache para precios (15 minutos)
const priceCache = new Map<string, { value: number; timestamp: number }>();
const CACHE_DURATION = 15 * 60 * 1000; // 15 minutos

async function getCachedPrice(
  key: string,
  fetcher: () => Promise<number>
): Promise<number> {
  const cached = priceCache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.value;
  }

  const value = await fetcher();
  priceCache.set(key, { value, timestamp: Date.now() });
  return value;
}

// Obtener precio de Yahoo Finance (sin API key)
export async function getStockPrice(ticker: string): Promise<number> {
  return getCachedPrice(`stock:${ticker}`, async () => {
    try {
      const response = await fetch(
        `https://query1.finance.yahoo.com/v10/finance/quoteSummary/${ticker}?modules=price`,
        { headers: { 'User-Agent': 'Mozilla/5.0' } }
      );
      const data = await response.json();
      return data.quoteSummary.result[0].price.regularMarketPrice;
    } catch (error) {
      console.error(`Failed to fetch price for ${ticker}:`, error);
      return 0;
    }
  });
}

// Obtener precio de CoinGecko (crypto)
export async function getCryptoPrice(cryptoId: string, vsCurrency: string = 'eur'): Promise<number> {
  return getCachedPrice(`crypto:${cryptoId}:${vsCurrency}`, async () => {
    try {
      const response = await fetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=${cryptoId}&vs_currencies=${vsCurrency}`
      );
      const data = await response.json();
      return data[cryptoId.toLowerCase()]?.[vsCurrency.toLowerCase()] || 0;
    } catch (error) {
      console.error(`Failed to fetch crypto price for ${cryptoId}:`, error);
      return 0;
    }
  });
}

// Obtener tipo de cambio USD -> EUR (Frankfurter)
export async function getExchangeRate(from: string = 'USD', to: string = 'EUR'): Promise<number> {
  return getCachedPrice(`exchange:${from}:${to}`, async () => {
    try {
      const response = await fetch(`https://api.frankfurter.app/latest?from=${from}&to=${to}`);
      const data = await response.json();
      return data.rates[to] || 1;
    } catch (error) {
      console.error(`Failed to fetch exchange rate ${from}->${to}:`, error);
      return 1;
    }
  });
}

export async function getPricesForHoldings(
  holdings: Holding[]
): Promise<Map<string, number>> {
  const prices = new Map<string, number>();

  for (const holding of holdings) {
    try {
      let price = 0;

      if (holding.type === 'crypto') {
        price = await getCryptoPrice(holding.ticker.toLowerCase(), holding.currency.toLowerCase());
      } else if (holding.type !== 'cash') {
        price = await getStockPrice(holding.ticker);

        // Si el precio está en USD y el portafolio está en EUR, convertir
        if (holding.currency !== 'USD') {
          const rate = await getExchangeRate('USD', holding.currency);
          price *= rate;
        }
      } else {
        price = 1; // Cash siempre tiene precio 1
      }

      prices.set(holding.assetId, price);
    } catch (error) {
      console.error(`Error fetching price for ${holding.ticker}:`, error);
      prices.set(holding.assetId, holding.currentPrice);
    }
  }

  return prices;
}

export function clearPriceCache(): void {
  priceCache.clear();
}
