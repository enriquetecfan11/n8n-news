import React, { useCallback, useEffect, useState } from 'react';
import TradingViewAdvancedChart from './TradingViewAdvancedChart';

const TABS = [
  { id: 'chart', label: 'Gráfico' },
  { id: 'heatmap', label: 'Mapa de calor' },
  { id: 'market', label: 'Mercado' },
  { id: 'news', label: 'Noticias' },
];

const TICKER_SYMBOLS = [
  { proName: 'COINBASE:BTCUSD', title: 'Bitcoin' },
  { proName: 'COINBASE:ETHUSD', title: 'Ethereum' },
  { proName: 'FX:EURUSD', title: 'EUR/USD' },
  { proName: 'TVC:GOLD', title: 'Gold' },
  { proName: 'NASDAQ:META', title: 'Meta' },
  { proName: 'NASDAQ:NVDA', title: 'NVIDIA' },
  { proName: 'NASDAQ:AAPL', title: 'Apple' },
];

const MARKET_REFRESH_MS = 45_000;

const STOCK_GRADIENTS = [
  'from-sky-500/25 to-blue-600/10 text-sky-300 ring-sky-500/25',
  'from-violet-500/25 to-purple-600/10 text-violet-300 ring-violet-500/25',
  'from-emerald-500/25 to-teal-600/10 text-emerald-300 ring-emerald-500/25',
  'from-amber-500/25 to-orange-600/10 text-amber-300 ring-amber-500/25',
];

const CRYPTO_GRADIENTS = [
  'from-orange-500/25 to-amber-600/10 text-orange-300 ring-orange-500/25',
  'from-indigo-500/25 to-blue-600/10 text-indigo-300 ring-indigo-500/25',
  'from-cyan-500/25 to-sky-600/10 text-cyan-300 ring-cyan-500/25',
  'from-rose-500/25 to-pink-600/10 text-rose-300 ring-rose-500/25',
];

function getTheme() {
  return 'dark';
}

function loadTradingViewWidget(containerId, scriptSrc, config) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = '';
  const script = document.createElement('script');
  script.type = 'text/javascript';
  script.async = true;
  script.src = scriptSrc;
  script.innerHTML = JSON.stringify(config);
  container.appendChild(script);
}

function formatPrice(price, currency = 'USD') {
  if (price == null) return '—';
  const fractionDigits = price < 1 ? 4 : price < 100 ? 2 : 2;
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency,
    maximumFractionDigits: fractionDigits,
  }).format(price);
}

function formatChange(change) {
  if (change == null) return '—';
  const sign = change > 0 ? '+' : '';
  return `${sign}${change.toFixed(2)}%`;
}

function formatSyncTime(value) {
  if (!value) return '—';
  return new Date(value).toLocaleString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
}

function countMovers(rows) {
  const withChange = rows.filter((row) => row.change24h != null);
  const gainers = withChange.filter((row) => row.change24h > 0).length;
  const losers = withChange.filter((row) => row.change24h < 0).length;
  return { gainers, losers, flat: withChange.length - gainers - losers };
}

function MarketStat({ label, value, tone = 'neutral' }) {
  const toneClass =
    tone === 'up'
      ? 'text-emerald-400'
      : tone === 'down'
        ? 'text-rose-400'
        : 'text-white';

  return (
    <div className="rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3">
      <p className="text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-gray-500">{label}</p>
      <p className={`mt-1 text-2xl font-semibold tabular-nums ${toneClass}`}>{value}</p>
    </div>
  );
}

function AssetRow({ row, gradientClass, loading }) {
  const isPositive = row.change24h != null && row.change24h >= 0;
  const changeTone = row.change24h == null ? 'neutral' : isPositive ? 'up' : 'down';

  return (
    <div
      className={[
        'grid grid-cols-[auto_1fr_auto] items-center gap-3 rounded-xl border border-white/5 px-3 py-3 transition-all duration-200',
        loading ? 'animate-pulse bg-white/[0.02]' : 'bg-white/[0.02] hover:border-white/12 hover:bg-white/[0.04]',
      ].join(' ')}
    >
      <div
        className={[
          'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-[0.7rem] font-bold ring-1',
          gradientClass,
        ].join(' ')}
      >
        {row.symbol?.slice(0, 3) || '—'}
      </div>

      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-mono text-sm font-semibold text-white">{row.symbol || '—'}</span>
          {row.exchange && (
            <span className="rounded-md bg-white/5 px-1.5 py-0.5 text-[0.62rem] font-medium uppercase tracking-wide text-gray-500">
              {row.exchange}
            </span>
          )}
        </div>
        <p className="truncate text-sm text-gray-400">{row.name || '—'}</p>
      </div>

      <div className="text-right">
        <p className="font-mono text-sm font-semibold tabular-nums text-white">
          {loading ? '···' : formatPrice(row.price, row.currency)}
        </p>
        <span
          className={[
            'mt-1 inline-flex rounded-full px-2 py-0.5 text-xs font-semibold tabular-nums',
            changeTone === 'up' && 'bg-emerald-500/15 text-emerald-400',
            changeTone === 'down' && 'bg-rose-500/15 text-rose-400',
            changeTone === 'neutral' && 'bg-white/5 text-gray-500',
          ]
            .filter(Boolean)
            .join(' ')}
        >
          {loading ? '···' : formatChange(row.change24h)}
        </span>
      </div>
    </div>
  );
}

function AssetPanel({ title, subtitle, rows, gradients, loading, emptyMessage }) {
  return (
    <section className="overflow-hidden rounded-2xl border border-white/10 bg-[#11141b]/90 shadow-[0_20px_60px_rgba(0,0,0,0.35)] backdrop-blur-sm">
      <header className="flex items-start justify-between gap-3 border-b border-white/8 px-4 py-4 sm:px-5">
        <div>
          <h3 className="text-base font-semibold text-white">{title}</h3>
          <p className="mt-0.5 text-sm text-gray-500">{subtitle}</p>
        </div>
        <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs font-medium text-gray-400">
          {loading ? '···' : `${rows.length} activos`}
        </span>
      </header>

      <div className="space-y-2 p-3 sm:p-4">
        {loading && rows.length === 0
          ? Array.from({ length: 6 }).map((_, index) => (
              <AssetRow
                key={`skeleton-${index}`}
                row={{ symbol: '···', name: 'Cargando datos en vivo', change24h: null }}
                gradientClass={gradients[index % gradients.length]}
                loading
              />
            ))
          : rows.map((row, index) => (
              <AssetRow
                key={row.symbol}
                row={row}
                gradientClass={gradients[index % gradients.length]}
                loading={false}
              />
            ))}

        {!loading && rows.length === 0 && (
          <p className="rounded-xl border border-dashed border-white/10 px-4 py-8 text-center text-sm text-gray-500">
            {emptyMessage}
          </p>
        )}
      </div>
    </section>
  );
}

const TradingDashboard = ({ news = [] }) => {
  const [activeTab, setActiveTab] = useState('chart');
  const [theme, setTheme] = useState(getTheme);
  const [marketTables, setMarketTables] = useState({
    stocks: [],
    cryptos: [],
    updatedAt: null,
    loading: true,
    error: null,
  });

  const loadMarketTables = useCallback(async (options = { silent: false }) => {
    if (!options.silent) {
      setMarketTables((current) => ({ ...current, loading: true, error: null }));
    }

    try {
      const response = await fetch('/api/markets', { cache: 'no-store' });
      if (!response.ok) throw new Error(`Markets API failed: ${response.status}`);

      const data = await response.json();
      setMarketTables({
        stocks: data.stocks || [],
        cryptos: data.cryptos || [],
        updatedAt: data.updatedAt || null,
        loading: false,
        error: null,
      });
    } catch {
      setMarketTables((current) => ({
        ...current,
        loading: false,
        error: options.silent
          ? current.error || 'No se pudieron actualizar los datos.'
          : 'No se pudieron cargar los datos gratuitos del mercado.',
      }));
    }
  }, []);

  useEffect(() => {
    setTheme('dark');
  }, []);

  useEffect(() => {
    if (activeTab !== 'market') return undefined;

    loadMarketTables();

    const interval = window.setInterval(() => {
      loadMarketTables({ silent: true });
    }, MARKET_REFRESH_MS);

    return () => window.clearInterval(interval);
  }, [activeTab, loadMarketTables]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadTradingViewWidget('tv-ticker-tape', 'https://s3.tradingview.com/external-embedding/embed-widget-ticker-tape.js', {
        symbols: TICKER_SYMBOLS,
        showSymbolLogo: true,
        isTransparent: false,
        displayMode: 'adaptive',
        colorTheme: 'dark',
        locale: 'es',
      });
    }, 25);
    return () => clearTimeout(timer);
  }, [theme]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (activeTab === 'heatmap') {
        loadTradingViewWidget('tv-heatmap', 'https://s3.tradingview.com/external-embedding/embed-widget-stock-heatmap.js', {
          colorTheme: theme,
          dateRange: '1D',
          exchange: 'US',
          showChart: true,
          locale: 'es',
          largeChartUrl: '',
          isTransparent: true,
          plotLineColorGrowing: 'rgba(34, 197, 94, 1)',
          plotLineColorFalling: 'rgba(239, 68, 68, 1)',
          gridLineColor: theme === 'dark' ? 'rgba(42, 46, 57, 1)' : 'rgba(226, 232, 240, 1)',
          scaleFontColor: theme === 'dark' ? 'rgba(148, 163, 184, 1)' : 'rgba(71, 85, 105, 1)',
          belowLineFillColorGrowing: 'rgba(59, 130, 246, 0.12)',
          belowLineFillColorFalling: 'rgba(59, 130, 246, 0.12)',
          belowLineFillColorGrowingBottom: 'rgba(59, 130, 246, 0)',
          belowLineFillColorFallingBottom: 'rgba(59, 130, 246, 0)',
          symbolActiveColor: 'rgba(59, 130, 246, 0.12)',
          showToolbar: true,
          width: '100%',
          height: '790',
          blockSize: 'market_cap_basic',
          dataSource: 'SPX500',
          symbols: [{ s: 'NASDAQ:NVDA' }, { s: 'NASDAQ:AAPL' }, { s: 'NASDAQ:MSFT' }, { s: 'NASDAQ:AMZN' }, { s: 'NASDAQ:META' }],
        });
      }
    }, 25);

    return () => clearTimeout(timer);
  }, [activeTab, theme]);

  const allRows = [...marketTables.stocks, ...marketTables.cryptos];
  const movers = countMovers(allRows);
  const syncLabel = formatSyncTime(marketTables.updatedAt);

  return (
    <section className={`market-shell ${theme === 'dark' ? 'theme-dark' : 'theme-light'}`}>
      <div className="market-tape" aria-label="Ticker tape de TradingView">
        <div id="tv-ticker-tape" className="widget-slot widget-slot-tape" />
      </div>

      <nav
        className="mb-4 flex items-center gap-1 overflow-x-auto rounded-xl border border-white/10 bg-[#0f1219] p-1.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        role="tablist"
        aria-label="Secciones del mercado"
      >
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => setActiveTab(tab.id)}
              className={[
                'rounded-lg px-4 py-2.5 text-sm font-semibold whitespace-nowrap transition-all duration-200',
                'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500',
                isActive
                  ? 'bg-blue-500 text-white shadow-md shadow-blue-500/20'
                  : 'text-gray-400 hover:bg-white/5 hover:text-gray-200',
              ].join(' ')}
            >
              {tab.label}
            </button>
          );
        })}
      </nav>

      <div className="tab-stage">
        {activeTab === 'chart' && (
          <section className="full-bleed-panel">
            <TradingViewAdvancedChart symbol="BLACKBULL:BRENT" height={700} />
          </section>
        )}

        {activeTab === 'heatmap' && (
          <section className="full-bleed-panel">
            <div id="tv-heatmap" className="widget-slot widget-slot-heatmap" style={{ height: '790px' }} />
          </section>
        )}

        {activeTab === 'market' && (
          <div className="space-y-4">
            <header className="overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-[#12151d] via-[#11141b] to-[#0d1017] p-4 shadow-[0_24px_80px_rgba(0,0,0,0.45)] sm:p-5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-start gap-3">
                  <span className="relative mt-1 flex h-3 w-3 shrink-0" aria-hidden="true">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-40" />
                    <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.8)]" />
                  </span>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-400/90">En vivo</p>
                    <h2 className="mt-1 text-xl font-semibold text-white sm:text-2xl">Mercado en tiempo real</h2>
                    <p className="mt-1 max-w-2xl text-sm text-gray-400">
                      Acciones vía Yahoo Finance y cripto vía CoinGecko. Se actualiza cada 45 segundos.
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <div className="rounded-full border border-white/10 bg-black/20 px-3 py-1.5 text-xs text-gray-400">
                    Sincronizado: <span className="font-medium text-gray-200">{syncLabel}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => loadMarketTables()}
                    disabled={marketTables.loading}
                    className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-2 text-sm font-semibold text-blue-300 transition hover:border-blue-400/50 hover:bg-blue-500/20 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <span className={marketTables.loading ? 'inline-block animate-spin' : ''}>↻</span>
                    Actualizar
                  </button>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
                <MarketStat label="Activos" value={allRows.length} />
                <MarketStat label="Al alza" value={movers.gainers} tone="up" />
                <MarketStat label="A la baja" value={movers.losers} tone="down" />
                <MarketStat label="Noticias" value={news.length} />
              </div>
            </header>

            {marketTables.error && (
              <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
                {marketTables.error}
              </div>
            )}

            <div className="grid gap-4 xl:grid-cols-2">
              <AssetPanel
                title="Acciones"
                subtitle="Mega caps tecnológicas de EE. UU."
                rows={marketTables.stocks}
                gradients={STOCK_GRADIENTS}
                loading={marketTables.loading && marketTables.stocks.length === 0}
                emptyMessage="No hay cotizaciones de acciones disponibles en este momento."
              />
              <AssetPanel
                title="Criptomonedas"
                subtitle="Principales activos por capitalización"
                rows={marketTables.cryptos}
                gradients={CRYPTO_GRADIENTS}
                loading={marketTables.loading && marketTables.cryptos.length === 0}
                emptyMessage="No hay cotizaciones de cripto disponibles en este momento."
              />
            </div>
          </div>
        )}

        {activeTab === 'news' && (
          <section className="panel panel-news">
            <div className="news-list-modern">
              {news.map((item) => (
                <a key={item.url} href={item.url} className="news-item" target="_blank" rel="noreferrer">
                  <div className="news-item__top">
                    <span className="news-source">{item.source}</span>
                    <span className="news-date">{item.date}</span>
                  </div>
                  <h4>{item.title}</h4>
                </a>
              ))}
            </div>
          </section>
        )}
      </div>
    </section>
  );
};

export default TradingDashboard;
