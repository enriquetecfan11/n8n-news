import React, { useState, useEffect } from 'react';
import TradingViewAdvancedChart from './TradingViewAdvancedChart';
import WatchlistSidebar from './WatchlistSidebar';

const TradingDashboard = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [sidebarExpanded, setSidebarExpanded] = useState(true);

  // Detectar si estamos en móvil
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Cargar widgets de TradingView cuando el componente se monta
  useEffect(() => {
    const loadHeatmapWidget = (containerId, height = "400") => {
      const container = document.getElementById(containerId);
      if (!container) return;

      container.innerHTML = '';

      const script = document.createElement('script');
      script.type = 'text/javascript';
      script.async = true;
      script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-stock-heatmap.js';
      script.innerHTML = JSON.stringify({
        colorTheme: 'light',
        dateRange: '1D',
        exchange: 'US',
        showChart: true,
        locale: 'es',
        largeChartUrl: '',
        isTransparent: false,
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
        height: height,
        blockSize: 'market_cap_basic',
        dataSource: 'SPX500',
        symbols: [
          { s: 'NASDAQ:META' },
          { s: 'NASDAQ:GOOGL' },
          { s: 'NASDAQ:NVDA' },
          { s: 'NASDAQ:AAPL' },
          { s: 'NASDAQ:TSLA' },
          { s: 'NASDAQ:MSFT' },
          { s: 'NASDAQ:INTC' },
          { s: 'NASDAQ:AMZN' },
          { s: 'NYSE:DIS' },
          { s: 'NYSE:JPM' }
        ]
      });

      container.appendChild(script);
    };

    const loadCalendarWidget = (containerId, height = "400") => {
      const container = document.getElementById(containerId);
      if (!container) return;

      container.innerHTML = '';

      const script = document.createElement('script');
      script.type = 'text/javascript';
      script.async = true;
      script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-events.js';
      script.innerHTML = JSON.stringify({
        colorTheme: 'light',
        isTransparent: false,
        width: '100%',
        height: height,
        locale: 'es',
        importanceFilter: '-1,0,1',
        countryFilter: 'us,eu,es',
        currencyFilter: 'USD,EUR',
        timeFrame: '1W'
      });

      container.appendChild(script);
    };

    const timer = setTimeout(() => {
      // Cargar heatmap desktop
      if (document.getElementById('heatmap-desktop')) {
        loadHeatmapWidget('heatmap-desktop', '400');
      }

      // Cargar calendar desktop
      if (document.getElementById('calendar-desktop')) {
        loadCalendarWidget('calendar-desktop', '400');
      }

      // Cargar heatmap mobile
      if (document.getElementById('heatmap-mobile')) {
        loadHeatmapWidget('heatmap-mobile', '400');
      }

      // Cargar calendar mobile
      if (document.getElementById('calendar-mobile')) {
        loadCalendarWidget('calendar-mobile', '400');
      }
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  // Función para alternar sidebar
  const toggleSidebar = () => {
    setSidebarExpanded(!sidebarExpanded);
  };


  if (isMobile) {
    return (
      <div className="trading-dashboard mobile">
        <div className="mobile-content">
          <div className="mobile-chart-container">
            <TradingViewAdvancedChart />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="trading-dashboard">
      {/* Grid principal: Gráfico + Sidebar */}
      <div className="main-grid">
        <div className="chart-container">
          <TradingViewAdvancedChart />
        </div>
        
        <div className={`sidebar-container ${!sidebarExpanded ? 'collapsed' : ''}`}>
          <WatchlistSidebar
            isExpanded={sidebarExpanded}
            onToggle={toggleSidebar}
            isMobile={false}
          />
        </div>
      </div>

      {/* Separador */}
      <div className="section-separator"></div>

      {/* Grid secundario: Heatmap + Calendario */}
      <div className="secondary-grid">
        <div className="heatmap-container">
          <div className="widget-card">
            <div className="widget-header-container">
              <h3 className="widget-header">Mapa de Calor del Mercado</h3>
            </div>
            <div className="widget-content">
              <div id="heatmap-desktop" className="widget-placeholder">
                <p>Cargando mapa de calor...</p>
              </div>
            </div>
          </div>
        </div>

        <div className="calendar-container">
          <div className="widget-card">
            <div className="widget-header-container">
              <h3 className="widget-header">Calendario Económico</h3>
            </div>
            <div className="widget-content">
              <div id="calendar-desktop" className="widget-placeholder">
                <p>Cargando calendario económico...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TradingDashboard;