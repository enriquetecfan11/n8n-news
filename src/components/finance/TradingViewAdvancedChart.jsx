// TradingViewWidget.jsx
import React, { useEffect, useRef, memo } from 'react';

function TradingViewWidget() {
    const container = useRef();

    useEffect(
        () => {
            const script = document.createElement("script");
            script.src = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
            script.type = "text/javascript";
            script.async = true;
            script.innerHTML = `
        {
          "autosize": true,
          "symbol": "VANTAGE:SP500",
          "interval": "1",
          "timezone": "Europe/Madrid",
          "withdateranges": true,
          "theme": "light",
          "style": "1",
          "locale": "es",
          "withdateranges": false,
          "allow_symbol_change": false,
          "details": false,
          "hotlist": false,
          "support_host": "https://www.tradingview.com",
          "watchlist": [
            "FOREXCOM:SPXUSD",
            "FX_IDC:EURUSD",
            "BITSTAMP:BTCUSD",
            "BITSTAMP:ETHUSD",
            "NASDAQ:META",
            "NASDAQ:GOOGL",
            "NASDAQ:NVDA",
            "NASDAQ:AAPL",
            "NASDAQ:TSLA",
            "NASDAQ:MSFT",
            "NASDAQ:INTC"
          ]
        }`;
            container.current.appendChild(script);
        },
        []
    );

    return (
        <div className="tradingview-widget-container" ref={container} style={{ height: "700px", width: "100%" }}>
            <div className="tradingview-widget-container__widget" style={{ height: "calc(100% - 32px)", width: "100%" }}></div>
        </div>
    );
}

export default memo(TradingViewWidget);