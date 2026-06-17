// TradingViewAdvancedChart.jsx
import React, { useEffect, useRef } from 'react';

function TradingViewAdvancedChart({ symbol = 'VANTAGE:SP500' }) {
    const containerRef = useRef(null);
    const scriptRef = useRef(null);

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
            theme: "dark",
            style: "1",
            locale: "es",
            allow_symbol_change: true,
            details: true,
            hotlist: false,
            calendar: false,
            support_host: "https://www.tradingview.com",
            toolbar_bg: "#0f1117",
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
    }, [symbol]);

    return (
        <div style={{ background: "#0f1117", borderRadius: "12px", overflow: "hidden", height: "100%", minHeight: "700px", width: "100%" }}>
            <div
                className="tradingview-widget-container"
                style={{ height: "100%", minHeight: "700px", width: "100%", background: "#0f1117", colorScheme: "dark" }}
            >
                <div
                    id="tradingview_chart_container"
                    className="tradingview-widget-container__widget"
                    ref={containerRef}
                    style={{ height: "700px", minHeight: "700px", width: "100%", background: "#0f1117", colorScheme: "dark" }}
                />
            </div>
        </div>
    );
}

export default TradingViewAdvancedChart;
