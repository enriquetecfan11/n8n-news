import React, { useEffect, useMemo, useState } from 'react';
import TradingViewAdvancedChart from './TradingViewAdvancedChart';

const WATCHLIST = [
  { label: 'SP500', symbol: 'VANTAGE:SP500' },
  { label: 'NASDAQ', symbol: 'NASDAQ:NDX' },
  { label: 'DOW', symbol: 'TVC:DJI' },
  { label: 'DAX', symbol: 'TVC:DAX' },
  { label: 'IBEX35', symbol: 'BME:IBEX' },
  { label: 'BTC', symbol: 'COINBASE:BTCUSD' },
  { label: 'ETH', symbol: 'COINBASE:ETHUSD' },
  { label: 'ORO', symbol: 'TVC:GOLD' },
  { label: 'EURUSD', symbol: 'FX:EURUSD' },
];

const TAB_DEFS = [
  { id: 'calor', label: 'Mapa de calor', widget: 'heatmap' },
  { id: 'sectores', label: 'Sectores', widget: 'sector' },
  { id: 'cripto', label: 'Cripto', widget: 'crypto' },
  { id: 'forex', label: 'Forex', widget: 'forex' },
];

const TradingDashboard = ({ news = [] }) => {
  const [isMobile, setIsMobile] = useState(false);
  const [activeSymbol, setActiveSymbol] = useState(WATCHLIST[0].symbol);
  const [activeTab, setActiveTab] = useState('calor');

  const topGainers = useMemo(
    () => [
      { name: 'NVIDIA', price: '$135.22', change: '+4.12%' },
      { name: 'Microsoft', price: '$481.91', change: '+2.34%' },
      { name: 'Amazon', price: '$228.54', change: '+1.88%' },
      { name: 'Apple', price: '$214.10', change: '+1.22%' },
      { name: 'Tesla', price: '$358.77', change: '+0.91%' },
    ],
    []
  );

  const topLosers = useMemo(
    () => [
      { name: 'Intel', price: '$19.84', change: '-5.22%' },
      { name: 'Boeing', price: '$188.11', change: '-3.90%' },
      { name: 'Nike', price: '$89.77', change: '-2.41%' },
      { name: 'Disney', price: '$118.03', change: '-1.84%' },
      { name: 'Meta', price: '$542.10', change: '-1.08%' },
    ],
    []
  );

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const loadWidget = (containerId, scriptSrc, config) => {
      const container = document.getElementById(containerId);
      if (!container) return;
      container.innerHTML = '';
      const script = document.createElement('script');
      script.type = 'text/javascript';
      script.async = true;
      script.src = scriptSrc;
      script.innerHTML = JSON.stringify(config);
      container.appendChild(script);
    };

    const renderActiveTab = () => {
      ['panel-calor', 'panel-sectores', 'panel-cripto', 'panel-forex'].forEach((id) => {
        const container = document.getElementById(id);
        if (container) container.innerHTML = '';
      });

      if (activeTab === 'calor') {
        loadWidget('panel-calor', 'https://s3.tradingview.com/external-embedding/embed-widget-stock-heatmap.js', {
          colorTheme: 'dark',
          dateRange: '1D',
          exchange: 'US',
          showChart: true,
          locale: 'es',
          largeChartUrl: '',
          isTransparent: true,
          plotLineColorGrowing: 'rgba(0, 255, 0, 1)',
          plotLineColorFalling: 'rgba(255, 0, 0, 1)',
          gridLineColor: 'rgba(42, 46, 57, 1)',
          scaleFontColor: 'rgba(134, 137, 147, 1)',
          belowLineFillColorGrowing: 'rgba(41, 98, 255, 0.12)',
          belowLineFillColorFalling: 'rgba(41, 98, 255, 0.12)',
          belowLineFillColorGrowingBottom: 'rgba(41, 98, 255, 0)',
          belowLineFillColorFallingBottom: 'rgba(41, 98, 255, 0)',
          symbolActiveColor: 'rgba(41, 98, 255, 0.12)',
          showToolbar: true,
          width: '100%',
          height: '100%',
          blockSize: 'market_cap_basic',
          dataSource: 'SPX500',
          symbols: [{ s: 'NASDAQ:META' }, { s: 'NASDAQ:GOOGL' }, { s: 'NASDAQ:NVDA' }, { s: 'NASDAQ:AAPL' }, { s: 'NASDAQ:TSLA' }],
        });
      }

      if (activeTab === 'sectores') {
        loadWidget('panel-sectores', 'https://s3.tradingview.com/external-embedding/embed-widget-hotlists.js', {
          colorTheme: 'dark',
          dateRange: '12M',
          exchange: 'US',
          showChart: true,
          locale: 'es',
          isTransparent: true,
          width: '100%',
          height: '100%',
          hotlist: 'sector',
        });
      }

      if (activeTab === 'cripto') {
        loadWidget('panel-cripto', 'https://s3.tradingview.com/external-embedding/embed-widget-screener.js', {
          width: '100%',
          height: '100%',
          defaultColumn: 'overview',
          defaultScreen: 'most_capitalized',
          market: 'crypto',
          colorTheme: 'dark',
          locale: 'es',
          isTransparent: true,
        });
      }

      if (activeTab === 'forex') {
        loadWidget('panel-forex', 'https://s3.tradingview.com/external-embedding/embed-widget-screener.js', {
          width: '100%',
          height: '100%',
          defaultColumn: 'overview',
          defaultScreen: 'top_gainers',
          market: 'forex',
          colorTheme: 'dark',
          locale: 'es',
          isTransparent: true,
        });
      }
    };

    const timer = setTimeout(renderActiveTab, 60);
    return () => clearTimeout(timer);
  }, [activeTab]);

  if (isMobile) {
    return (
      <div className="trading-dashboard mobile">
        <div className="mobile-content">
          <div className="mobile-chart-container">
            <TradingViewAdvancedChart symbol={activeSymbol} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="trading-dashboard">
      <div className="watchlist-bar">
        {WATCHLIST.map((item) => (
          <button key={item.symbol} data-symbol={item.symbol} className={`watchlist-pill ${activeSymbol === item.symbol ? 'active' : ''}`} onClick={() => setActiveSymbol(item.symbol)}>
            <span className="watchlist-label">{item.label}</span>
            <span className="watchlist-price">7.437,55</span>
            <span className="watchlist-change negative">▼ 1,21%</span>
          </button>
        ))}
      </div>

      <div className="dashboard-grid">
        <div className="chart-panel">
          <TradingViewAdvancedChart symbol={activeSymbol} />
        </div>

        <div className="right-panel">
          <nav className="tabs-bar">
            {TAB_DEFS.map((tab) => (
              <button key={tab.id} data-tab={tab.id} className={`tab-mkt ${activeTab === tab.id ? 'tab-active' : ''}`} onClick={() => setActiveTab(tab.id)}>
                {tab.label}
              </button>
            ))}
          </nav>

          <div className="tab-panels">
            <div data-panel="calor" className={activeTab === 'calor' ? 'tab-panel' : 'tab-panel hidden'}>
              <div id="panel-calor" className="widget-slot" />
            </div>
            <div data-panel="sectores" className={activeTab === 'sectores' ? 'tab-panel' : 'tab-panel hidden'}>
              <div id="panel-sectores" className="widget-slot" />
            </div>
            <div data-panel="cripto" className={activeTab === 'cripto' ? 'tab-panel' : 'tab-panel hidden'}>
              <div id="panel-cripto" className="widget-slot" />
            </div>
            <div data-panel="forex" className={activeTab === 'forex' ? 'tab-panel' : 'tab-panel hidden'}>
              <div id="panel-forex" className="widget-slot" />
            </div>
          </div>
        </div>
      </div>

      <div className="bottom-grid">
        <div className="movers-panel">
          <p className="bottom-title">🟢 Más alcistas</p>
          {topGainers.map((item) => (
            <div key={item.name} className="mover-row">
              <span>{item.name}</span>
              <span>{item.price}</span>
              <span className="positive">{item.change}</span>
            </div>
          ))}
        </div>

        <div className="movers-panel">
          <p className="bottom-title">🔴 Más bajistas</p>
          {topLosers.map((item) => (
            <div key={item.name} className="mover-row">
              <span>{item.name}</span>
              <span>{item.price}</span>
              <span className="negative">{item.change}</span>
            </div>
          ))}
        </div>

        <div className="news-panel">
          <p className="bottom-title">📰 Noticias</p>
          {news.slice(0, 4).map((n) => (
            <a key={n.url} href={n.url} target="_blank" rel="noreferrer" className="news-row">
              <p className="news-title">{n.title}</p>
              <div className="news-meta">
                <span>{n.source}</span>
                <span>·</span>
                <span>{n.date}</span>
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TradingDashboard;
