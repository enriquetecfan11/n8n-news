import React, { useEffect, useMemo, useState } from 'react';
import TradingViewAdvancedChart from './TradingViewAdvancedChart';

const WATCHLIST = [
  { label: 'SP500', symbol: 'FOREXCOM:SPXUSD' },
  { label: 'NASDAQ', symbol: 'NASDAQ:NDX' },
  { label: 'DOW', symbol: 'TVC:DJI' },
  { label: 'DAX', symbol: 'TVC:DAX' },
  { label: 'IBEX35', symbol: 'BME:IBEX' },
  { label: 'BTC', symbol: 'COINBASE:BTCUSD' },
  { label: 'ETH', symbol: 'COINBASE:ETHUSD' },
  { label: 'Oro', symbol: 'TVC:GOLD' },
  { label: 'EUR/USD', symbol: 'FX:EURUSD' },
];

const TABS = [
  { id: 'chart', label: '📈 Gráfico' },
  { id: 'heatmap', label: '🔥 Mapa de calor' },
  { id: 'market', label: '📊 Mercado' },
  { id: 'news', label: '📰 Noticias' },
];

const TICKER_SYMBOLS = [
  { proName: 'FOREXCOM:SPXUSD', title: 'S&P 500' },
  { proName: 'NASDAQ:NDX', title: 'Nasdaq 100' },
  { proName: 'TVC:DJI', title: 'Dow Jones' },
  { proName: 'TVC:DAX', title: 'DAX' },
  { proName: 'BME:IBEX', title: 'IBEX 35' },
  { proName: 'COINBASE:BTCUSD', title: 'Bitcoin' },
  { proName: 'COINBASE:ETHUSD', title: 'Ethereum' },
  { proName: 'FX:EURUSD', title: 'EUR/USD' },
  { proName: 'TVC:GOLD', title: 'Gold' },
  { proName: 'NASDAQ:META', title: 'Meta' },
  { proName: 'NASDAQ:NVDA', title: 'NVIDIA' },
  { proName: 'NASDAQ:AAPL', title: 'Apple' },
];

const chartSymbols = [
  { label: 'S&P 500', symbol: 'FOREXCOM:SPXUSD' },
  { label: 'Nasdaq', symbol: 'NASDAQ:NDX' },
  { label: 'DAX', symbol: 'TVC:DAX' },
  { label: 'IBEX', symbol: 'BME:IBEX' },
  { label: 'BTC', symbol: 'COINBASE:BTCUSD' },
];

function getTheme() {
  if (typeof document === 'undefined') return 'dark';
  return document.body.classList.contains('dark-theme') || document.documentElement.classList.contains('dark-theme') ? 'dark' : 'light';
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

const TradingDashboard = ({ news = [] }) => {
  const [activeSymbol, setActiveSymbol] = useState(chartSymbols[0].symbol);
  const [activeTab, setActiveTab] = useState('chart');
  const [theme, setTheme] = useState(getTheme);

  const topGainers = useMemo(
    () => [
      { name: 'NVIDIA', price: '$135.22', change: '+4.12%', sector: 'Semiconductores' },
      { name: 'Microsoft', price: '$481.91', change: '+2.34%', sector: 'Software' },
      { name: 'Amazon', price: '$228.54', change: '+1.88%', sector: 'Consumo' },
      { name: 'Apple', price: '$214.10', change: '+1.22%', sector: 'Tecnología' },
      { name: 'Tesla', price: '$358.77', change: '+0.91%', sector: 'Automoción' },
    ],
    []
  );

  const topLosers = useMemo(
    () => [
      { name: 'Intel', price: '$19.84', change: '-5.22%', sector: 'Semiconductores' },
      { name: 'Boeing', price: '$188.11', change: '-3.90%', sector: 'Industria' },
      { name: 'Nike', price: '$89.77', change: '-2.41%', sector: 'Consumo' },
      { name: 'Disney', price: '$118.03', change: '-1.84%', sector: 'Media' },
      { name: 'Meta', price: '$542.10', change: '-1.08%', sector: 'Tecnología' },
    ],
    []
  );

  const sectorRows = useMemo(
    () => [
      { name: 'Tecnología', trend: '+2.4%', note: 'Lidera el impulso del mercado' },
      { name: 'Finanzas', trend: '+1.1%', note: 'Mejora del sentimiento' },
      { name: 'Energía', trend: '-0.6%', note: 'Presión por materias primas' },
      { name: 'Salud', trend: '+0.8%', note: 'Rotación defensiva' },
      { name: 'Consumo', trend: '+0.3%', note: 'Sesgo mixto' },
    ],
    []
  );

  useEffect(() => {
    const syncTheme = () => setTheme(getTheme());
    syncTheme();

    const observer = new MutationObserver(syncTheme);
    observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadTradingViewWidget('tv-ticker-tape', 'https://s3.tradingview.com/external-embedding/embed-widget-ticker-tape.js', {
        symbols: TICKER_SYMBOLS,
        showSymbolLogo: true,
        isTransparent: true,
        displayMode: 'adaptive',
        colorTheme: theme,
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
          height: '100%',
          blockSize: 'market_cap_basic',
          dataSource: 'SPX500',
          symbols: [{ s: 'NASDAQ:NVDA' }, { s: 'NASDAQ:AAPL' }, { s: 'NASDAQ:MSFT' }, { s: 'NASDAQ:AMZN' }, { s: 'NASDAQ:META' }],
        });
      }

      if (activeTab === 'market') {
        loadTradingViewWidget('tv-market-overview', 'https://s3.tradingview.com/external-embedding/embed-widget-market-overview.js', {
          colorTheme: theme,
          dateRange: '12M',
          showChart: true,
          locale: 'es',
          largeChartUrl: '',
          isTransparent: true,
          showSymbolLogo: true,
          showFloatingTooltip: false,
          width: '100%',
          height: '660',
          tabs: [
            { title: 'Índices', symbols: [{ s: 'FOREXCOM:SPXUSD', d: 'S&P 500 Index' }], originalTitle: 'Indices' },
            { title: 'Forex', symbols: [{ s: 'FX_IDC:EURUSD', d: 'EUR to USD' }], originalTitle: 'Forex' },
            { title: 'Crypto', symbols: [{ s: 'BITSTAMP:BTCUSD', d: 'Bitcoin' }, { s: 'BITSTAMP:ETHUSD', d: 'Ethereum' }] },
            { title: 'Tech', symbols: [{ s: 'NASDAQ:META', d: 'Meta' }, { s: 'NASDAQ:GOOGL', d: 'Google' }, { s: 'NASDAQ:NVDA', d: 'NVIDIA' }, { s: 'NASDAQ:AAPL', d: 'Apple' }, { s: 'NASDAQ:TSLA', d: 'Tesla' }, { s: 'NASDAQ:MSFT', d: 'Microsoft' }] },
          ],
        });
      }
    }, 25);

    return () => clearTimeout(timer);
  }, [activeTab, theme]);

  return (
    <section className={`market-shell ${theme === 'dark' ? 'theme-dark' : 'theme-light'}`}>
      <div className="market-tape" aria-label="Ticker tape de TradingView">
        <div id="tv-ticker-tape" className="widget-slot widget-slot-tape" />
      </div>

      <header className="market-hero">
        <div className="market-hero__copy">
          <p className="eyebrow">Mercados en tiempo real</p>
          <h1>Panel de mercado limpio, escalable y centrado en TradingView</h1>
          <p className="hero-text">La información secundaria queda agrupada en pestañas para dejar al gráfico como punto focal y reducir ruido visual.</p>
        </div>

        <div className="market-symbols" role="tablist" aria-label="Seleccionar símbolo principal">
          {WATCHLIST.map((item) => (
            <button
              key={item.symbol}
              type="button"
              className={`symbol-pill ${activeSymbol === item.symbol ? 'is-active' : ''}`}
              onClick={() => setActiveSymbol(item.symbol)}
            >
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      </header>

      <div className="main-chart-card">
        <div className="chart-card__header">
          <div>
            <p className="card-kicker">📈 Gráfico principal</p>
            <h2>{chartSymbols.find((item) => item.symbol === activeSymbol)?.label ?? 'Activo'}</h2>
          </div>
          <div className="chart-status">
            <span className="status-dot" />
            <span>TradingView avanzado</span>
          </div>
        </div>

        <div className="chart-card__body">
          <TradingViewAdvancedChart symbol={activeSymbol} />
        </div>
      </div>

      <nav className="market-tabs" aria-label="Secciones del mercado">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={`market-tab ${activeTab === tab.id ? 'is-active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      <div className="tab-stage">
        {activeTab === 'chart' && (
          <div className="chart-tab-grid">
            <aside className="info-stack">
              <section className="info-card">
                <p className="info-card__title">Resumen rápido</p>
                <div className="mini-stat"><span>Sesión</span><strong>Abierta</strong></div>
                <div className="mini-stat"><span>Sesgo</span><strong>Moderadamente alcista</strong></div>
                <div className="mini-stat"><span>Volatilidad</span><strong>Media</strong></div>
              </section>

              <section className="info-card">
                <p className="info-card__title">Activos destacados</p>
                {chartSymbols.map((item) => (
                  <button key={item.symbol} type="button" className={`asset-row ${activeSymbol === item.symbol ? 'is-active' : ''}`} onClick={() => setActiveSymbol(item.symbol)}>
                    <span>{item.label}</span>
                    <span>Ver</span>
                  </button>
                ))}
              </section>
            </aside>

            <section className="focus-panel">
              <p className="section-caption">Mantén aquí la vigilancia mínima necesaria mientras operas.</p>
              <div className="focus-metrics">
                <div className="metric-card"><span>Rango</span><strong>Intradía</strong></div>
                <div className="metric-card"><span>Noticias</span><strong>{news.length}</strong></div>
                <div className="metric-card"><span>Relevancia</span><strong>Alta</strong></div>
              </div>
            </section>
          </div>
        )}

        {activeTab === 'heatmap' && (
          <section className="panel panel-wide">
            <div className="panel-heading">
              <div>
                <p className="card-kicker">🔥 Mapa de calor</p>
                <h3>Visión sectorial y por capitalización</h3>
              </div>
            </div>
            <div id="tv-heatmap" className="widget-slot widget-slot-heatmap" />
          </section>
        )}

        {activeTab === 'market' && (
          <div className="market-grid">
            <section className="panel panel-wide panel-overview">
              <div className="panel-heading">
                <div>
                  <p className="card-kicker">📊 Resúmenes de mercado</p>
                  <h3>Visión general desde TradingView</h3>
                </div>
              </div>
              <div id="tv-market-overview" className="widget-slot widget-slot-overview" />
            </section>

            <section className="panel panel-list">
              <h3>Más alcistas</h3>
              {topGainers.map((item) => (
                <article key={item.name} className="market-row">
                  <div>
                    <strong>{item.name}</strong>
                    <span>{item.sector}</span>
                  </div>
                  <div>
                    <strong className="positive">{item.change}</strong>
                    <span>{item.price}</span>
                  </div>
                </article>
              ))}
            </section>

            <section className="panel panel-list">
              <h3>Más bajistas</h3>
              {topLosers.map((item) => (
                <article key={item.name} className="market-row">
                  <div>
                    <strong>{item.name}</strong>
                    <span>{item.sector}</span>
                  </div>
                  <div>
                    <strong className="negative">{item.change}</strong>
                    <span>{item.price}</span>
                  </div>
                </article>
              ))}
            </section>

            <section className="panel panel-list panel-sectors">
              <h3>Sectores</h3>
              {sectorRows.map((item) => (
                <article key={item.name} className="market-row sector-row">
                  <div>
                    <strong>{item.name}</strong>
                    <span>{item.note}</span>
                  </div>
                  <div>
                    <strong className={item.trend.startsWith('+') ? 'positive' : 'negative'}>{item.trend}</strong>
                  </div>
                </article>
              ))}
            </section>
          </div>
        )}

        {activeTab === 'news' && (
          <section className="panel panel-news">
            <div className="panel-heading">
              <div>
                <p className="card-kicker">📰 Noticias</p>
                <h3>Todas las noticias relacionadas</h3>
              </div>
            </div>

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
