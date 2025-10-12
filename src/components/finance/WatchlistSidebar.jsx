import React, { useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const WatchlistSidebar = ({ isExpanded, onToggle, isMobile = false }) => {
  const containerRef = useRef();

  // Símbolos de la watchlist
  const watchlistSymbols = [
    { symbol: 'SP500', name: 'S&P 500', change: '+0.45%', isPositive: true },
    { symbol: 'EURUSD', name: 'EUR/USD', change: '-0.12%', isPositive: false },
    { symbol: 'BTCUSD', name: 'Bitcoin', change: '+2.34%', isPositive: true },
    { symbol: 'ETHUSD', name: 'Ethereum', change: '+1.87%', isPositive: true },
    { symbol: 'META', name: 'Meta', change: '-0.89%', isPositive: false },
    { symbol: 'GOOGL', name: 'Google', change: '+0.67%', isPositive: true },
    { symbol: 'NVDA', name: 'NVIDIA', change: '+3.21%', isPositive: true },
    { symbol: 'AAPL', name: 'Apple', change: '+0.23%', isPositive: true },
    { symbol: 'TSLA', name: 'Tesla', change: '-1.45%', isPositive: false },
    { symbol: 'MSFT', name: 'Microsoft', change: '+0.78%', isPositive: true },
    { symbol: 'INTC', name: 'Intel', change: '-0.34%', isPositive: false }
  ];

  // Cargar widget de TradingView market overview
  useEffect(() => {
    if (!containerRef.current) return;

    // Limpiar contenido anterior
    containerRef.current.innerHTML = '';

    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.async = true;
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-market-overview.js';
    script.innerHTML = JSON.stringify({
      colorTheme: 'light',
      dateRange: '1D',
      showChart: true,
      locale: 'es',
      largeChartUrl: '',
      isTransparent: false,
      showSymbolLogo: true,
      showFloatingTooltip: false,
      width: '100%',
      height: isMobile ? '300' : '400',
      plotLineColorGrowing: 'rgba(0, 255, 0, 1)',
      plotLineColorFalling: 'rgba(255, 0, 0, 1)',
      gridLineColor: 'rgba(42, 46, 57, 0.1)',
      scaleFontColor: 'rgba(134, 137, 147, 1)',
      belowLineFillColorGrowing: 'rgba(41, 98, 255, 0.12)',
      belowLineFillColorFalling: 'rgba(41, 98, 255, 0.12)',
      belowLineFillColorGrowingBottom: 'rgba(41, 98, 255, 0)',
      belowLineFillColorFallingBottom: 'rgba(41, 98, 255, 0)',
      symbolActiveColor: 'rgba(41, 98, 255, 0.12)',
      symbols: watchlistSymbols.map(item => ({
        s: item.symbol.includes('USD') ? `FOREXCOM:${item.symbol}` : 
           item.symbol.includes('BTC') || item.symbol.includes('ETH') ? `BITSTAMP:${item.symbol}` :
           `NASDAQ:${item.symbol}`
      }))
    });

    containerRef.current.appendChild(script);

    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, [isMobile]);

  return (
    <div className={`watchlist-sidebar ${!isExpanded ? 'collapsed' : ''} ${isMobile ? 'mobile' : ''}`}>
      <div className="sidebar-header">
        <h3 className="sidebar-title">Lista de Seguimiento</h3>
        {!isMobile && (
          <button
            className="sidebar-toggle"
            onClick={onToggle}
            title={isExpanded ? 'Colapsar sidebar' : 'Expandir sidebar'}
          >
            {isExpanded ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        )}
      </div>

      {isExpanded ? (
        <div className="sidebar-content">
          {/* Lista de símbolos personalizada */}
          <div className="symbols-list">
            {watchlistSymbols.map((item, index) => (
              <div key={index} className="symbol-item">
                <div className="symbol-info">
                  <span className="symbol-name">{item.symbol}</span>
                  {!isMobile && <span className="symbol-full-name">{item.name}</span>}
                </div>
                <span className={`symbol-change ${item.isPositive ? 'positive' : 'negative'}`}>
                  {item.change}
                </span>
              </div>
            ))}
          </div>

          {/* Widget de TradingView */}
          <div className="tradingview-widget">
            <div ref={containerRef} className="tradingview-widget-container"></div>
          </div>
        </div>
      ) : (
        <div className="sidebar-collapsed">
          <div className="collapsed-symbols">
            {watchlistSymbols.slice(0, 6).map((item, index) => (
              <div key={index} className="collapsed-symbol">
                <span className="symbol-short">{item.symbol}</span>
                <span className={`symbol-change-mini ${item.isPositive ? 'positive' : 'negative'}`}>
                  {item.change}
                </span>
              </div>
            ))}
          </div>
          <button
            className="expand-button"
            onClick={onToggle}
            title="Expandir sidebar"
          >
            <ChevronLeft size={16} />
          </button>
        </div>
      )}
    </div>
  );
};

export default WatchlistSidebar;
