// TradingViewAdvancedChart.jsx
import React, { useEffect, useRef, useState } from 'react';

function TradingViewAdvancedChart({ symbol = 'VANTAGE:SP500' }) {
    const containerRef = useRef(null);
    const scriptRef = useRef(null);
    const [theme, setTheme] = useState(() =>
        typeof document === 'undefined'
            ? 'dark'
            : (document.body.classList.contains('dark-theme') || document.documentElement.classList.contains('dark-theme'))
                ? 'dark'
                : 'light'
    );

    useEffect(() => {
        const observer = new MutationObserver(() => {
            const isDark = document.body.classList.contains('dark-theme') || document.documentElement.classList.contains('dark-theme');
            setTheme(isDark ? 'dark' : 'light');
        });

        observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        // Verificar que el contenedor existe
        if (!containerRef.current) return;

        // Crear el script
        const script = document.createElement("script");
        script.src = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
        script.type = "text/javascript";
        script.async = true;
        script.innerHTML = JSON.stringify({
            autosize: true,
            symbol,
            interval: "1",
            timezone: "Europe/Madrid",
            theme,
            style: "1",
            locale: "es",
            allow_symbol_change: true,
            details: true,
            hotlist: false,
            calendar: false,
            support_host: "https://www.tradingview.com",
            toolbar_bg: theme === 'dark' ? "#0f1117" : "#ffffff",
            backgroundColor: "rgba(0,0,0,0)",
            enable_publishing: false,
            hide_side_toolbar: false,
            hide_top_toolbar: false,
            save_image: false,
            studies: ["Volume@tv-basicstudies"],
            show_popup_button: true,
            popup_width: "1000",
            popup_height: "650",
            container_id: "tradingview_chart_container"
        });

        // Guardar referencia al script
        scriptRef.current = script;
        
        // Agregar script al contenedor
        containerRef.current.appendChild(script);

        // Función de limpieza (cleanup)
        return () => {
            // Remover el script cuando el componente se desmonte
            if (scriptRef.current && containerRef.current) {
                containerRef.current.removeChild(scriptRef.current);
            }
        };
    }, [symbol, theme]);

    return (
        <div className="tradingview-shell tradingview-shell--chart">
            <div className="tradingview-widget-container tradingview-shell--chart">
                <div
                    id="tradingview_chart_container"
                    className="tradingview-widget-container__widget"
                    ref={containerRef}
                />
            </div>
        </div>
    );
}

export default TradingViewAdvancedChart;
