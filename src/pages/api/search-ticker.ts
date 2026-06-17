import type { APIRoute } from 'astro';
import { getCurrentSession } from '../../lib/supabase';

async function searchCoinGecko(ticker: string) {
  try {
    const searchRes = await fetch(
      `https://api.coingecko.com/api/v3/search?query=${encodeURIComponent(ticker)}`
    );
    if (!searchRes.ok) throw new Error('CoinGecko search failed');

    const searchData = await searchRes.json();
    const coin = searchData.coins?.[0];
    if (!coin) return null;

    const priceRes = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${coin.id}&vs_currencies=eur,usd`
    );
    if (!priceRes.ok) throw new Error('CoinGecko price failed');

    const priceData = await priceRes.json();
    const prices = priceData[coin.id];

    return {
      name: coin.name,
      exchange: coin.symbol?.toUpperCase() || ticker.toUpperCase(),
      type: 'crypto',
      currency: prices.usd !== undefined ? 'USD' : 'EUR',
      price: prices.usd || prices.eur,
    };
  } catch (error) {
    console.error('CoinGecko search error:', error);
    return null;
  }
}

async function searchYahooFinance(ticker: string) {
  try {
    const res = await fetch(
      `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(ticker)}?interval=1d`,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
      }
    );
    if (!res.ok) throw new Error('Yahoo Finance request failed');

    const data = await res.json();
    const result = data.chart?.result?.[0];
    if (!result) return null;

    const meta = result.meta || {};
    const quotes = result.indicators?.quote?.[0];
    const price = quotes?.close?.[quotes.close.length - 1];

    if (!price) return null;

    const exchangeMap: Record<string, string> = {
      'NMS': 'NASDAQ',
      'NYQ': 'NYSE',
      'GER': 'XETRA',
      'LSE': 'LSE',
    };

    return {
      name: meta.longName || meta.shortName || ticker.toUpperCase(),
      exchange: exchangeMap[meta.exchangeName] || meta.exchangeName || 'NYSE',
      type: meta.quoteType === 'ETF' ? 'etf' : 'stock',
      currency: meta.currency || 'USD',
      price: price,
    };
  } catch (error) {
    console.error('Yahoo Finance search error:', error);
    return null;
  }
}

export const POST: APIRoute = async ({ request }) => {
  try {
    const session = await getCurrentSession(context.cookies.get('sb-access-token')?.value);
    if (!session) {
      return new Response(
        JSON.stringify({ error: 'No autorizado' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const body = await request.json();
    const { ticker, type } = body;

    if (!ticker || !type) {
      return new Response(
        JSON.stringify({ error: 'Missing ticker or type' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    let result = null;

    if (type === 'crypto') {
      result = await searchCoinGecko(ticker);
    } else if (type === 'stock' || type === 'etf') {
      result = await searchYahooFinance(ticker);
    }

    if (!result) {
      return new Response(
        JSON.stringify({ data: null }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ data: result }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Search error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
