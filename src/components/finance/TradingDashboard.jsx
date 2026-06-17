import React, { useEffect, useMemo, useState } from 'react';
import TradingViewAdvancedChart from './TradingViewAdvancedChart';

const TABS = [
  { id: 'chart', label: 'Gráfico' },
  { id: 'heatmap', label: 'Mapa de calor' },
  { id: 'market', label: 'Mercado' },
  { id: 'news', label: 'Noticias' },
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

const TradingDashboard = ({ news = [] }) => {
  const [activeTab, setActiveTab] = useState('chart');
  const [theme, setTheme] = useState(getTheme);
  const [marketSnapshotAt, setMarketSnapshotAt] = useState(new Date());

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
      { name: 'Tecnología', trend: '+2.4%', note: 'Lidera el impulso del mercado', tone: 'strong' },
      { name: 'Finanzas', trend: '+1.1%', note: 'Mejora del sentimiento', tone: 'positive' },
      { name: 'Energía', trend: '-0.6%', note: 'Presión por materias primas', tone: 'weak' },
      { name: 'Salud', trend: '+0.8%', note: 'Rotación defensiva', tone: 'positive' },
      { name: 'Consumo', trend: '+0.3%', note: 'Sesgo mixto', tone: 'positive' },
      { name: 'Industria', trend: '-1.4%', note: 'Afectada por ciclo económico', tone: 'weak' },
    ],
    []
  );

  const marketSummary = useMemo(() => {
    const positives = topGainers.length;
    const negatives = topLosers.length;
    const netStrength = positives - negatives;
    return {
      state: netStrength > 1 ? 'Alcista' : netStrength < 0 ? 'Bajista' : 'Neutral',
      positives,
      negatives,
      bestSector: 'Tecnología',
      worstSector: 'Energía',
      volatility: 'Media',
      volume: 'Alto',
    };
  }, [topGainers, topLosers]);

  const highlightedMoves = useMemo(
    () => [
      { label: 'NVIDIA', change: '+4.12%', detail: 'Máximo del día en semiconductores' },
      { label: 'Intel', change: '-5.22%', detail: 'Presión por ventas en chipmakers' },
      { label: 'Apple', change: '+1.22%', detail: 'Recupera tono tras apertura débil' },
      { label: 'Tesla', change: '+0.91%', detail: 'Rebote en automoción' },
    ],
    []
  );

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
          height: '980',
          blockSize: 'market_cap_basic',
          dataSource: 'SPX500',
          symbols: [{ s: 'NASDAQ:NVDA' }, { s: 'NASDAQ:AAPL' }, { s: 'NASDAQ:MSFT' }, { s: 'NASDAQ:AMZN' }, { s: 'NASDAQ:META' }],
        });
      }

      if (activeTab === 'market') {
        const container = document.getElementById('tv-market-overview');
        if (container) container.innerHTML = '';
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
            <TradingViewAdvancedChart symbol="FOREXCOM:SPXUSD" height={980} />
          </section>
        )}

        {activeTab === 'heatmap' && (
          <section className="full-bleed-panel">
            <div id="tv-heatmap" className="widget-slot widget-slot-heatmap" />
          </section>
        )}

        {activeTab === 'market' && (
          <div className="market-view">
            <header className="market-header panel">
              <div className="market-header__status">
                <span className="market-status-dot" aria-hidden="true" />
                <div>
                  <strong>🟢 Alcista</strong>
                  <span>Datos en tiempo real</span>
                </div>
              </div>

              <div className="market-header__meta">
                <div>
                  <span>Última actualización</span>
                  <strong>{marketTime}</strong>
                </div>
                <div>
                  <span>Retraso</span>
                  <strong>0 min</strong>
                </div>
              </div>

              <button type="button" className="market-refresh" onClick={refreshMarketSnapshot} aria-label="Actualizar datos del mercado">
                ↻ Actualizar
              </button>
            </header>

            <section className="panel market-summary-title">
              <h3>Resumen del mercado</h3>
            </section>

            <section className="market-summary-strip panel">
              <div className="summary-chip summary-state">
                <span className="summary-label">Estado</span>
                <strong>{marketSummary.state}</strong>
              </div>
              <div className="summary-chip">
                <span className="summary-label">Positivos</span>
                <strong className="positive">{marketSummary.positives}</strong>
              </div>
              <div className="summary-chip">
                <span className="summary-label">Negativos</span>
                <strong className="negative">{marketSummary.negatives}</strong>
              </div>
              <div className="summary-chip">
                <span className="summary-label">Mejor sector</span>
                <strong>{marketSummary.bestSector}</strong>
              </div>
              <div className="summary-chip">
                <span className="summary-label">Peor sector</span>
                <strong>{marketSummary.worstSector}</strong>
              </div>
              <div className="summary-chip">
                <span className="summary-label">Volatilidad</span>
                <strong>{marketSummary.volatility}</strong>
              </div>
              <div className="summary-chip">
                <span className="summary-label">Volumen</span>
                <strong>{marketSummary.volume}</strong>
              </div>
            </section>

            <div className="market-columns">
              <section className="panel panel-list">
                <div className="panel-title-row">
                  <h3>Más alcistas</h3>
                  <span className="panel-subtitle">Ticker · nombre · precio · variación</span>
                </div>
                {topGainers.map((item) => (
                  <article key={item.name} className="market-row market-row-compact">
                    <div className="market-symbol-block">
                      <strong className="market-ticker">{item.name.slice(0, 4).toUpperCase()}</strong>
                      <div>
                        <strong>{item.name}</strong>
                        <span>{item.sector}</span>
                      </div>
                    </div>
                    <div className="market-price-block">
                      <strong>{item.price}</strong>
                      <span className="positive">{item.change}</span>
                    </div>
                  </article>
                ))}
              </section>

              <section className="panel panel-list">
                <div className="panel-title-row">
                  <h3>Más bajistas</h3>
                  <span className="panel-subtitle">Ticker · nombre · precio · variación</span>
                </div>
                {topLosers.map((item) => (
                  <article key={item.name} className="market-row market-row-compact">
                    <div className="market-symbol-block">
                      <strong className="market-ticker">{item.name.slice(0, 4).toUpperCase()}</strong>
                      <div>
                        <strong>{item.name}</strong>
                        <span>{item.sector}</span>
                      </div>
                    </div>
                    <div className="market-price-block">
                      <strong>{item.price}</strong>
                      <span className="negative">{item.change}</span>
                    </div>
                  </article>
                ))}
              </section>
            </div>

            <section className="panel panel-sectors-visual">
              <div className="panel-title-row">
                <h3>Sectores</h3>
                <span className="panel-subtitle">Fortaleza relativa del día</span>
              </div>
              <div className="sector-grid">
                {sectorRows.map((item) => (
                  <article key={item.name} className={`sector-card sector-${item.tone}`}>
                    <div className="sector-card__top">
                      <strong>{item.name}</strong>
                      <span className={item.trend.startsWith('+') ? 'positive' : 'negative'}>{item.trend}</span>
                    </div>
                    <p>{item.note}</p>
                  </article>
                ))}
              </div>
            </section>

            <section className="panel panel-moves">
              <div className="panel-title-row">
                <h3>Movimientos destacados</h3>
                <span className="panel-subtitle">Lo que realmente movió el mercado</span>
              </div>
              <div className="move-list">
                {highlightedMoves.map((move) => (
                  <article key={move.label} className="move-item">
                    <div>
                      <strong>{move.label}</strong>
                      <span>{move.detail}</span>
                    </div>
                    <strong className={move.change.startsWith('+') ? 'positive' : 'negative'}>{move.change}</strong>
                  </article>
                ))}
              </div>
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
