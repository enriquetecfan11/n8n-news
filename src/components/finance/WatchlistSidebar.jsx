import React, { useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const WatchlistSidebar = ({ isExpanded, onToggle, isMobile = false }) => {
  const containerRef = useRef();

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
      height: isMobile ? '300' : '600',
      plotLineColorGrowing: 'rgba(0, 255, 0, 1)',
      plotLineColorFalling: 'rgba(255, 0, 0, 1)',
      gridLineColor: 'rgba(42, 46, 57, 0.1)',
      scaleFontColor: 'rgba(134, 137, 147, 1)',
      belowLineFillColorGrowing: 'rgba(41, 98, 255, 0.12)',
      belowLineFillColorFalling: 'rgba(41, 98, 255, 0.12)',
      belowLineFillColorGrowingBottom: 'rgba(41, 98, 255, 0)',
      belowLineFillColorFallingBottom: 'rgba(41, 98, 255, 0)',
      symbolActiveColor: 'rgba(41, 98, 255, 0.12)',
      symbols: [
        { s: 'FOREXCOM:SPX500' },
        { s: 'FOREXCOM:EURUSD' },
        { s: 'BITSTAMP:BTCUSD' },
        { s: 'BITSTAMP:ETHUSD' },
        { s: 'NASDAQ:META' },
        { s: 'NASDAQ:GOOGL' },
        { s: 'NASDAQ:NVDA' },
        { s: 'NASDAQ:AAPL' },
        { s: 'NASDAQ:TSLA' },
        { s: 'NASDAQ:MSFT' },
        { s: 'NASDAQ:INTC' }
      ]
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
      </div>

      {isExpanded ? (
        <div className="sidebar-content">
          {/* Widget de TradingView */}
          <div className="tradingview-widget">
            <div ref={containerRef} className="tradingview-widget-container"></div>
          </div>
        </div>
      ) : (
        <div className="sidebar-collapsed">
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
