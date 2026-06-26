import type { APIRoute } from 'astro';
import {
  getCurrentSession,
  getPortfolioById,
  getTransactionsByPortfolio,
  getAssets,
} from '../../../lib/supabase';
import type { Asset } from '../../../lib/portfolio';
import { toNativeCsv, toTradingViewCsv } from '../../../utils/tradingViewCsv';

export const GET: APIRoute = async ({ request, url }) => {
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

    const portfolioId = url.searchParams.get('portfolioId');
    const format = url.searchParams.get('format') || 'tradingview';

    if (!portfolioId) {
      return new Response(JSON.stringify({ error: 'Portfolio ID requerido' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (format !== 'tradingview' && format !== 'native') {
      return new Response(JSON.stringify({ error: 'Formato inválido. Usa tradingview o native' }), {
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

    const [transactions, allAssets] = await Promise.all([
      getTransactionsByPortfolio(portfolioId),
      getAssets(),
    ]);

    const assets = new Map(allAssets.map((asset: Asset) => [asset.id, asset]));
    const csv =
      format === 'tradingview'
        ? toTradingViewCsv(transactions, assets)
        : toNativeCsv(transactions, assets);

    const safeName = portfolio.name.replace(/[^a-zA-Z0-9-_ ]/g, '').trim() || 'portfolio';
    const dateLabel = new Date().toISOString().slice(0, 10);
    const suffix = format === 'tradingview' ? 'tradingview' : 'transacciones';
    const filename = `${safeName}-${suffix}-${dateLabel}.csv`;

    return new Response(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error('Error exporting CSV:', error);
    return new Response(JSON.stringify({ error: 'Error al exportar el archivo CSV' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
