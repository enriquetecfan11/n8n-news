# Parámetros de Noticias - Documentación Completa

Este documento describe todos los parámetros que debe contener una noticia en el sistema N8N News para su correcto funcionamiento y clasificación.

## 📋 Parámetros Obligatorios

### 1. `title` (string)
- **Descripción**: Título principal de la noticia
- **Tipo**: String
- **Ejemplo**: `"La montaña rusa bursátil lanza señales de alerta: Atentos a estas recomendaciones"`
- **Requisitos**: Debe ser descriptivo y atractivo

### 2. `description` (string)
- **Descripción**: Resumen breve de la noticia
- **Tipo**: String
- **Ejemplo**: `"La volatilidad en los mercados financieros puede tener consecuencias graves para los inversores. A continuación, se presentan algunos consejos para minimizar el riesgo."`
- **Requisitos**: Máximo 200 caracteres recomendado

### 3. `pubDate` (date)
- **Descripción**: Fecha de publicación de la noticia
- **Tipo**: Date (formato YYYY-MM-DD)
- **Ejemplo**: `"2025-05-06"`
- **Requisitos**: Formato ISO 8601

## 📊 Parámetros de Clasificación Financiera

### 4. `impact` (enum)
- **Descripción**: Nivel de impacto de la noticia en los mercados
- **Tipo**: Enum
- **Valores permitidos**: `"alto"`, `"medio"`, `"bajo"`
- **Ejemplo**: `"alto"`
- **Criterios**:
  - **Alto**: Noticias sobre Fed, bancos centrales, inflación, recesión, crisis, elecciones, guerras, pandemias
  - **Medio**: Resultados empresariales, fusiones, adquisiciones, alianzas, acuerdos
  - **Bajo**: Análisis, opiniones, tendencias, predicciones

### 5. `sectors` (array)
- **Descripción**: Sectores económicos afectados por la noticia
- **Tipo**: Array de strings
- **Ejemplo**: `["finanzas", "economía", "automotriz", "comercio"]`
- **Sectores disponibles**:
  - `"tecnología"`: Microsoft, Meta, Google, Apple, Nvidia, Tesla, Intel, etc.
  - `"finanzas"`: Bancos, Fed, Reserva Federal, inflación, tipos de interés
  - `"energía"`: Petróleo, gas, energía, OPEC, crudo
  - `"salud"`: Salud, médico, farmacéutico, vacunas
  - `"consumo"`: Retail, consumo, ventas, marcas
  - `"política"`: Trump, elecciones, gobierno, congreso
  - `"economía"`: PIB, economía, recesión, crecimiento, empleo
  - `"automotriz"`: Autos, Ford, GM, vehículos
  - `"comercio"`: Comercio, aranceles, exportaciones, importaciones

### 6. `sentiment` (enum)
- **Descripción**: Sentimiento general de la noticia
- **Tipo**: Enum
- **Valores permitidos**: `"positivo"`, `"neutral"`, `"negativo"`
- **Ejemplo**: `"neutral"`
- **Criterios**:
  - **Positivo**: sube, crece, gana, mejora, aumenta, optimista, win, rise, growth, beat, strong, bullish
  - **Negativo**: baja, cae, pierde, empeora, disminuye, pesimista, struggled, tumult, inestabilidad, fall, drop, decline, weak, bearish, crisis
  - **Neutral**: Por defecto cuando no hay indicadores claros

### 7. `relevanceScore` (number)
- **Descripción**: Puntuación de relevancia de la noticia (1-10)
- **Tipo**: Number
- **Rango**: 1-10
- **Ejemplo**: `9`
- **Cálculo**:
  - Base: 5 puntos
  - Impacto alto: +3 puntos
  - Impacto medio: +1 punto
  - Sectores (máximo 2): +1-2 puntos
  - Tickers (máximo 2): +1-2 puntos
  - Sentimiento extremo: +1 punto

### 8. `tickers` (array)
- **Descripción**: Símbolos de acciones/activos mencionados en la noticia
- **Tipo**: Array de strings
- **Ejemplo**: `["F", "C"]`
- **Tickers comunes**:
  - **Tecnología**: MSFT, META, GOOGL, AAPL, NVDA, TSLA, INTC, AMZN, NFLX, AMD
  - **Finanzas**: SPY, QQQ, DIA, VIX, BAC, JPM, WFC, C, GS, MS, BLK, AXP
  - **Automotriz**: F, GM, TSLA
  - **Monedas**: BTC, ETH, EUR, USD, GBP, JPY, CAD=X
  - **ETFs**: EWC

### 9. `source` (string)
- **Descripción**: Fuente original de la noticia
- **Tipo**: String
- **Ejemplo**: `"Investing.com"`
- **Fuentes reconocidas**:
  - Investing.com
  - Bloomberg
  - Reuters
  - CNBC
  - Financial Times
  - Wall Street Journal
  - MarketWatch
  - Yahoo Finance
  - Seeking Alpha

## 📅 Parámetros Opcionales

### 10. `updatedDate` (date)
- **Descripción**: Fecha de última actualización de la noticia
- **Tipo**: Date (formato YYYY-MM-DD)
- **Ejemplo**: `"2025-05-07"`
- **Uso**: Para noticias que han sido actualizadas después de la publicación inicial

### 11. `imageUrl` (string)
- **Descripción**: URL de la imagen principal de la noticia
- **Tipo**: String
- **Ejemplo**: `"https://example.com/image.jpg"`
- **Uso**: Imagen destacada para la tarjeta de noticia

### 12. `excerpt` (string)
- **Descripción**: Extracto adicional de la noticia
- **Tipo**: String
- **Uso**: Texto adicional para mostrar en listas o resúmenes

### 13. `priority` (boolean)
- **Descripción**: Indica si la noticia tiene prioridad especial
- **Tipo**: Boolean
- **Ejemplo**: `true`
- **Uso**: Para destacar noticias importantes

### 14. `isHighlight` (boolean)
- **Descripción**: Indica si la noticia debe ser destacada
- **Tipo**: Boolean
- **Ejemplo**: `false`
- **Uso**: Para mostrar en secciones especiales

## 🔧 Parámetros Técnicos (Internos)

### 15. `newsId` (string)
- **Descripción**: Identificador único de la noticia
- **Tipo**: String
- **Ejemplo**: `"2025-05-06-la-montana-rusa-bursatil-lanza-senales-de-alerta-atentos-a-estas-recomendaciones"`
- **Uso**: Generado automáticamente desde el nombre del archivo

### 16. `url` (string)
- **Descripción**: URL de la noticia original
- **Tipo**: String
- **Ejemplo**: `"https://es.investing.com/news/economy/la-montana-rusa-bursatil-lanza-senales-de-alerta-atentos-a-estas-recomendaciones-3128342"`
- **Uso**: Enlace a la fuente original

## 📝 Ejemplo Completo de Frontmatter

```yaml
---
title: "La montaña rusa bursátil lanza señales de alerta: Atentos a estas recomendaciones"
description: "La volatilidad en los mercados financieros puede tener consecuencias graves para los inversores. A continuación, se presentan algunos consejos para minimizar el riesgo."
pubDate: "2025-05-06"
updatedDate: "2025-05-07" # Opcional
impact: "bajo"
sectors: ["finanzas", "economía", "automotriz", "comercio"]
source: "Investing.com"
sentiment: "neutral"
relevanceScore: 9
tickers: ["F", "C"]
imageUrl: "https://example.com/image.jpg" # Opcional
excerpt: "Análisis detallado de la volatilidad bursátil" # Opcional
priority: false # Opcional
isHighlight: false # Opcional
---

Contenido de la noticia en formato Markdown...
```

## 🎯 Criterios de Clasificación Automática

El sistema utiliza algoritmos de análisis de texto para detectar automáticamente:

1. **Sectores**: Basado en palabras clave específicas por sector
2. **Impacto**: Basado en términos de alta, media o baja relevancia
3. **Sentimiento**: Análisis de palabras positivas, negativas o neutrales
4. **Tickers**: Detección de símbolos de acciones conocidos
5. **Fuente**: Extracción desde URLs o menciones en el texto
6. **Relevancia**: Cálculo basado en múltiples factores

## 📊 Validación y Calidad

- **Confianza del análisis**: 0-100%
- **Revisión manual**: Recomendada para noticias con confianza < 40%
- **Actualización**: Los metadatos se pueden actualizar automáticamente
- **Backup**: Se crean copias de seguridad antes de las actualizaciones

## 🔄 Flujo de Trabajo

1. **Creación**: Nueva noticia con parámetros básicos
2. **Análisis**: Procesamiento automático de metadatos
3. **Validación**: Revisión de confianza y precisión
4. **Publicación**: Noticia disponible en el sistema
5. **Monitoreo**: Seguimiento de rendimiento y relevancia

---

*Este documento se actualiza regularmente para reflejar cambios en el sistema de clasificación de noticias.*
