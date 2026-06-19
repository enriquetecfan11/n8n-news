import React, { useEffect, useState } from 'react';
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

function normalizeText(value) {
  return String(value || '').trim();
}

const TradingDashboard = ({ news = [] }) => {
  const [activeTab, setActiveTab] = useState('chart');
  const [theme, setTheme] = useState(getTheme);
  const [marketSnapshotAt, setMarketSnapshotAt] = useState(new Date());

  const marketTime = marketSnapshotAt.toLocaleString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });

  useEffect(() => {
    setTheme('dark');
    setMarketSnapshotAt(new Date());
  }, []);

  const refreshMarketSnapshot = () => {
    setMarketSnapshotAt(new Date());
  };

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

      if (activeTab === 'market') {
        loadTradingViewWidget('tv-market-overview', 'https://s3.tradingview.com/external-embedding/embed-widget-market-overview.js', {
          colorTheme: 'dark',
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
            {
              title: 'Índices',
              symbols: [{ s: 'FOREXCOM:SPXUSD', d: 'S&P 500 Index' }],
              originalTitle: 'Indices',
            },
            {
              title: 'Forex',
              symbols: [{ s: 'FX_IDC:EURUSD', d: 'EUR to USD' }],
              originalTitle: 'Forex',
            },
            {
              title: 'Crypto',
              symbols: [
                { s: 'BITSTAMP:BTCUSD', d: 'Bitcoin' },
                { s: 'BITSTAMP:ETHUSD', d: 'Ethereum' },
              ],
            },
            {
              title: 'Tech',
              symbols: [
                { s: 'NASDAQ:META', d: 'Meta' },
                { s: 'NASDAQ:GOOGL', d: 'Google' },
                { s: 'NASDAQ:NVDA', d: 'NVIDIA' },
                { s: 'NASDAQ:AAPL', d: 'Apple' },
                { s: 'NASDAQ:TSLA', d: 'Tesla' },
                { s: 'NASDAQ:MSFT', d: 'Microsoft' },
                { s: 'NASDAQ:INTC', d: 'Intel' },
              ],
            },
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

      <nav className="market-tabs" aria-label="Secciones del mercado">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={`market-tab ${activeTab === tab.id ? 'is-active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
            role="tab"
            aria-selected={activeTab === tab.id}
          >
            <span>{tab.label}</span>
          </button>
        ))}
      </nav>

      <div className="tab-stage">
        {activeTab === 'chart' && (
          <section className="full-bleed-panel">
            <TradingViewAdvancedChart symbol="BLACKBULL:BRENT" height={790} />
          </section>
        )}

        {activeTab === 'heatmap' && (
          <section className="full-bleed-panel">
            <div id="tv-heatmap" className="widget-slot widget-slot-heatmap" style={{ height: '790px' }} />
          </section>
        )}

        {activeTab === 'market' && (
          <div className="market-view">
            <header className="market-header panel">
              <div className="market-header__status">
                <span className="market-status-dot" aria-hidden="true" />
                <div>
                  <strong>Mercado en vivo</strong>
                  <span>Widgets de TradingView y noticias publicadas</span>
                </div>
              </div>

              <div className="market-header__meta">
                <div>
                  <span>Última actualización</span>
                  <strong>{marketTime}</strong>
                </div>
                <div>
                  <span>Noticias publicadas</span>
                  <strong>{news.length}</strong>
                </div>
              </div>

              <button type="button" className="market-refresh" onClick={refreshMarketSnapshot} aria-label="Actualizar datos del mercado">
                ↻ Actualizar vista
              </button>
            </header>

            <section className="panel panel-overview">
              <div className="panel-title-row">
                <h3>Vista general de mercado</h3>
                <span className="panel-subtitle">Datos del proveedor externo</span>
              </div>
              <div className="widget-slot widget-slot-overview" id="tv-market-overview" />
            </section>
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
