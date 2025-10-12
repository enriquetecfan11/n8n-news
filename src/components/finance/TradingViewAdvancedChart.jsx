// TradingViewAdvancedChart.jsx
import React, { useEffect, useRef } from 'react';

function TradingViewAdvancedChart() {
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
            symbol: "VANTAGE:SP500",
            interval: "1",
            timezone: "Europe/Madrid",
            theme: "light",
            style: "1",
            locale: "es",
            allow_symbol_change: true,
            details: true,
            hotlist: false,
            calendar: false,
            support_host: "https://www.tradingview.com",
            toolbar_bg: "#F5F5F5",
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
    }, []); // Array vacío = solo se ejecuta en mount y cleanup en unmount

    return (
        <div 
            className="tradingview-widget-container" 
            style={{ height: "100%", width: "100%" }}
        >
            <div 
                id="tradingview_chart_container"
                className="tradingview-widget-container__widget" 
                ref={containerRef}
                style={{ height: "100%", width: "100%" }}
            />
        </div>
    );
}

export default TradingViewAdvancedChart;