# Portfolio de Inversión - Guía de Configuración

Esta guía explica cómo activar y configurar la sección de Portfolio de Inversión en el sitio N8N News.

## 🎯 Características

- **Dashboard de portafolios**: Visualiza todos tus portafolios en una vista general
- **Detalles del portafolio**: KPIs en tiempo real (valor total, P&L, distribución)
- **Tabla de posiciones**: Gestiona tus holdings con detalles de cantidad, precio medio, coste y rentabilidad
- **Historial de transacciones**: Registro completo de compras, ventas, dividendos y comisiones
- **Precios en tiempo real**: Integración con APIs públicas (Yahoo Finance, CoinGecko, Frankfurter)
- **Caché de precios**: 15 minutos de caché para evitar saturar límites de APIs
- **Cálculos automáticos**: Holdings calculados dinámicamente desde transacciones

## 📋 Requisitos Previos

1. **Cuenta de Supabase** (gratuita)
2. **Variables de entorno** configuradas
3. **Acceso MCP a Supabase** (para crear la base de datos)

## 🚀 Pasos de Instalación

### 1. Crear Proyecto en Supabase

1. Ve a [supabase.com](https://supabase.com) y crea una cuenta (gratuita)
2. Crea un nuevo proyecto (selecciona región cercana a ti)
3. Espera a que se complete la inicialización

### 2. Crear el Esquema de Base de Datos

#### Opción A: Usando la URL MCP (Recomendado)

Si tienes acceso MCP a Supabase:

```bash
# En el navegador, autentica el MCP de Supabase:
# El harness te pedirá que completes la autenticación OAuth
```

Una vez autenticado, Claude Code ejecutará automáticamente:

```sql
-- Ejecutar migrations/001_create_portfolio_schema.sql
```

#### Opción B: Manual (SQL Editor en Supabase)

1. Abre el dashboard de tu proyecto en Supabase
2. Ve a **SQL Editor**
3. Copia el contenido de `migrations/001_create_portfolio_schema.sql`
4. Pégalo y ejecuta

**Resultado esperado**: 3 tablas creadas (portfolios, assets, transactions) + índices + políticas RLS

### 3. Configurar Variables de Entorno

1. En el dashboard de Supabase, ve a **Settings → API**
2. Copia:
   - `Project URL` → `PUBLIC_SUPABASE_URL`
   - `anon key` (público) → `PUBLIC_SUPABASE_ANON_KEY`

3. Crea un archivo `.env.local` en la raíz del proyecto:

```bash
PUBLIC_SUPABASE_URL=https://your-project.supabase.co
PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI...
```

4. **NO** commitees este archivo (está en .gitignore)

### 4. Instalar `@supabase/supabase-js` (si no está)

```bash
npm install @supabase/supabase-js
```

### 5. Verificar la Instalación

```bash
npm run dev
```

Navega a: http://localhost:3000/portfolio

Deberías ver:
- ✅ Una página de portafolios vacía (sin errores)
- ✅ El menú de navegación tiene un enlace "Portafolio"

## 📊 Cargar Datos de Ejemplo

### Opción 1: Vía SQL Editor (Supabase)

Descomenta las líneas SQL al final de `migrations/001_create_portfolio_schema.sql` y ejecuta.

Esto crea:
- 2 portafolios de ejemplo
- 5 activos (AAPL, MSFT, BTC, ETH, EUR)

### Opción 2: Vía Astro + MCP

(Por implementar: endpoint para crear portafolios)

## 🔗 Estructura de Archivos Creados

```
src/
├── lib/
│   ├── portfolio.ts          # Lógica de cálculos (holdings, P&L, precios)
│   ├── database.types.ts     # Tipos TypeScript para Supabase
│   └── supabase.ts           # Cliente Supabase + helpers
├── components/portfolio/
│   ├── PortfolioCard.astro   # Tarjeta de portafolio (lista)
│   ├── KpiCard.astro         # KPI individual
│   ├── HoldingsTable.astro   # Tabla de posiciones
│   └── TransactionsTable.astro # Tabla de movimientos
├── pages/portfolio/
│   ├── index.astro           # Lista de portafolios
│   ├── [id].astro            # Dashboard del portafolio
│   ├── [id]/
│   │   ├── transactions.astro # Historial completo
│   │   └── assets.astro       # Posiciones detalladas
├── styles/
│   └── portfolio.css         # Estilos del portfolio
└── components/
    └── Header.astro          # (actualizado con enlace)
```

## 💡 Cómo Usar

### Agregar un Portafolio

```typescript
import { createPortfolio } from '@/lib/supabase';

const portfolio = await createPortfolio(
  'Mi Portafolio',
  'Descripción opcional',
  'EUR' // divisa base
);
```

### Agregar un Activo

```typescript
import { createAsset } from '@/lib/supabase';

const asset = await createAsset(
  'Apple Inc.',
  'stock',
  'USD',
  'AAPL',
  'NASDAQ'
);
```

### Registrar una Transacción

```typescript
import { createTransaction } from '@/lib/supabase';

const tx = await createTransaction(
  portfolioId,
  assetId,
  'buy',      // tipo: 'buy' | 'sell' | 'dividend' | 'fee'
  100,        // cantidad
  150.50,     // precio unitario
  '2025-01-15',
  2.99,       // comisión (opcional)
  'Compra via broker' // notas (opcional)
);
```

## 📡 Precios en Tiempo Real

### Fuentes

| Tipo | Fuente | API | Rate Limit |
|------|--------|-----|-----------|
| Acciones/ETFs | Yahoo Finance | Unofficial | No límite conocido |
| Crypto | CoinGecko | Pública | 10-50 req/min (free) |
| Tipos Cambio | Frankfurter | Pública | No límite conocido |

### Caché

- **Duración**: 15 minutos
- **Ubicación**: Memory en `src/lib/portfolio.ts`
- **Limpiar**: Llamar `clearPriceCache()`

### Usar Precios Personalizados

```typescript
import { getHoldings } from '@/lib/portfolio';

// Sin precios (usa últimos precios conocidos)
const holdings1 = getHoldings(transactions, assetMap);

// Con precios personalizados
const customPrices = new Map([
  ['asset-uuid-1', 150.50],
  ['asset-uuid-2', 45000.00]
]);
const holdings2 = getHoldings(transactions, assetMap, customPrices);
```

## 🔒 Seguridad

- **RLS Habilitado**: Todas las tablas tienen políticas permisivas (sin auth)
- **Clave Pública**: Solo se usa la clave `anon` (pública)
- **No hay datos sensibles**: Los precios se obtienen desde APIs públicas
- **Para producción**: Implementar autenticación y políticas RLS basadas en usuario

## 🐛 Solucionar Problemas

### Error: "Cannot find module '@supabase/supabase-js'"

```bash
npm install @supabase/supabase-js
```

### Error: "PUBLIC_SUPABASE_URL is required"

- Verifica que `.env.local` existe
- Verifica que las variables están prefijadas con `PUBLIC_`
- Reinicia el servidor: `npm run dev`

### Precios no se actualizan

- Comprueba la conexión a internet
- Verifica que los tickers son correctos (ej: `AAPL`, no `apple`)
- Para crypto, usa IDs de CoinGecko (ej: `bitcoin`, `ethereum`)
- Revisa el caché: `clearPriceCache()`

### Transacciones no aparecen

- Verifica que `portfolio_id` y `asset_id` existen
- Comprueba que el formato de `date` es correcto: `YYYY-MM-DD`
- Asegúrate de que las restricciones de check se cumplen:
  - `type`: 'buy', 'sell', 'dividend', 'fee'
  - `quantity` y `unit_price` son > 0

## 📚 Referencias

- [Documentación Supabase](https://supabase.com/docs)
- [supabase-js Client Docs](https://supabase.com/docs/reference/javascript/introduction)
- [Yahoo Finance API (Unofficial)](https://finance.yahoo.com)
- [CoinGecko API](https://www.coingecko.com/en/api)
- [Frankfurter Exchange Rates](https://www.frankfurter.app)

## 🚀 Próximas Mejoras

- [ ] Crear portafolios desde UI
- [ ] Editar/eliminar transacciones
- [ ] Gráficas de evolución P&L
- [ ] Alertas de precios
- [ ] Exportar a CSV/Excel
- [ ] Autenticación por usuario
- [ ] Análisis de diversificación
- [ ] Backtesting de estrategias

## ✨ Notas

- El portafolio usa **cálculos dinámicos**: los holdings se recalculan desde transacciones cada vez
- No hay tabla separada de "holdings": se derivan de transacciones automáticamente
- P&L se calcula como: `(valorActual - costeDBase) / costeDBase * 100`
- Precios se obtienen **server-side** en cada página para evitar exponer claves
