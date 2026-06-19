import type { APIRoute } from 'astro';

type MarketRow = {
  symbol: string;
  name: string;
  price: number | null;
  change24h: number | null;
  currency: string;
  marketCap?: number | null;
  source: string;
  exchange?: string | null;
};

const STOCK_SYMBOLS = ['AAPL', 'MSFT', 'NVDA', 'AMZN', 'META', 'TSLA', 'GOOGL', 'AMD'];
const CRYPTO_IDS = ['bitcoin', 'ethereum', 'solana', 'ripple', 'dogecoin', 'cardano', 'binancecoin', 'avalanche-2'];

const YAHOO_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
};

async function fetchSingleStock(symbol: string): Promise<MarketRow | null> {
  try {
    const response = await fetch(
      `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1d&range=2d`,
      { headers: YAHOO_HEADERS }
    );

    if (!response.ok) return null;

    const data = await response.json();
    const result = data.chart?.result?.[0];
    if (!result) return null;

    const meta = result.meta || {};
    const closes = (result.indicators?.quote?.[0]?.close || []).filter(
      (value: unknown): value is number => typeof value === 'number'
    );

    const price =
      typeof meta.regularMarketPrice === 'number'
        ? meta.regularMarketPrice
        : closes.at(-1) ?? null;

    const previousClose =
      typeof meta.chartPreviousClose === 'number'
        ? meta.chartPreviousClose
        : closes.at(-2) ?? null;

    const change24h =
      typeof meta.regularMarketChangePercent === 'number'
        ? meta.regularMarketChangePercent
        : price !== null && previousClose
          ? ((price - previousClose) / previousClose) * 100
          : null;

    return {
      symbol,
      name: meta.longName || meta.shortName || symbol,
      price,
      change24h,
      currency: meta.currency || 'USD',
      exchange: meta.exchangeName || null,
      source: 'Yahoo Finance',
    };
  } catch (error) {
    console.error(`Failed to fetch stock market row for ${symbol}:`, error);
    return null;
  }
}

async function fetchStockRows(): Promise<MarketRow[]> {
  const rows = await Promise.all(STOCK_SYMBOLS.map(fetchSingleStock));
  return rows.filter((row): row is MarketRow => row !== null);
}

async function fetchCryptoRows(): Promise<MarketRow[]> {
  try {
    const response = await fetch(
      `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${CRYPTO_IDS.join(',')}&price_change_percentage=24h&order=market_cap_desc`
    );

    if (!response.ok) return [];

    const data = await response.json();
    return data.map((coin: {
      symbol?: string;
      name?: string;
      current_price?: number;
      price_change_percentage_24h?: number;
      market_cap?: number;
    }) => ({
      symbol: String(coin.symbol || '').toUpperCase(),
      name: coin.name,
      price: typeof coin.current_price === 'number' ? coin.current_price : null,
      change24h:
        typeof coin.price_change_percentage_24h === 'number'
          ? coin.price_change_percentage_24h
          : null,
      marketCap: typeof coin.market_cap === 'number' ? coin.market_cap : null,
      currency: 'USD',
      source: 'CoinGecko',
    }));
  } catch (error) {
    console.error('Failed to fetch crypto market rows:', error);
    return [];
  }
}

export const GET: APIRoute = async () => {
  const [stocks, cryptos] = await Promise.all([fetchStockRows(), fetchCryptoRows()]);

  return new Response(
    JSON.stringify({
      updatedAt: new Date().toISOString(),
      stocks,
      cryptos,
    }),
    {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store',
      },
    }
  );
};
