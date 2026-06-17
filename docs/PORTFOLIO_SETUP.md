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
- **CRUD completo**: Crear, editar y eliminar portafolios, activos y transacciones desde la UI

## 📋 Requisitos Previos

1. **Cuenta de Supabase** (gratuita)
2. **Variables de entorno** configuradas
3. **Node.js** >= 24.0.0

## 🚀 Pasos de Instalación

### 1. Crear Proyecto en Supabase

1. Ve a [supabase.com](https://supabase.com) y crea una cuenta (gratuita)
2. Crea un nuevo proyecto (selecciona región cercana a ti)
3. Espera a que se complete la inicialización

### 2. Crear el Esquema de Base de Datos

Las tablas ya fueron creadas cuando ejecutaste el MCP de Supabase. Si necesitas recrearlas:

1. Abre el dashboard de tu proyecto en Supabase
2. Ve a **SQL Editor**
3. Copia el contenido de `migrations/001_create_portfolio_schema.sql`
4. Pégalo y ejecuta

**Tablas creadas:**
- `portfolios` - Los portafolios
- `assets` - Los activos (acciones, ETFs, crypto, cash)
- `transactions` - Las transacciones

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

### 4. Instalar Dependencias

```bash
npm install
```

### 5. Verificar la Instalación

```bash
npm run dev
```

Navega a: http://localhost:3000/portfolio

Deberías ver:
- ✅ Una página de portafolios vacía (sin errores)
- ✅ El menú de navegación tiene un enlace "Portafolio"
- ✅ Un botón "+ Nuevo Portafolio" funcional

## 🎮 Uso de la Interfaz

### Crear un Portafolio

1. Haz clic en "+ Nuevo Portafolio"
2. Completa el formulario:
   - **Nombre** (requerido): ej. "Mi Portafolio Principal"
   - **Descripción** (opcional): ej. "Inversiones a largo plazo"
   - **Divisa Base**: EUR, USD, GBP
3. Haz clic en "Crear Portafolio"

### Ver Dashboard del Portafolio

1. Desde la lista, haz clic en cualquier portafolio
2. Verás:
   - KPIs principales (valor total, P&L)
   - Distribución por tipo de activo
   - Últimas transacciones
   - Enlaces a vistas detalladas

### Agregar una Transacción

1. Desde el dashboard, haz clic en "+ Transacción"
2. Completa:
   - **Activo**: selecciona de la lista (o créalo primero)
   - **Tipo**: Compra, Venta, Dividendo, Comisión
   - **Fecha**: cuándo ocurrió
   - **Cantidad**: cuántos títulos/unidades
   - **Precio Unitario**: a qué precio
   - **Comisión** (opcional): gastos de transacción
   - **Notas** (opcional): referencias
3. Haz clic en "Registrar Transacción"

### Ver Posiciones Completas

Desde el dashboard:
- Haz clic en "Ver todos →" en la sección "Posiciones Actuales"
- O navega a `/portfolio/[id]/assets`

### Ver Historial de Transacciones

Desde el dashboard:
- Haz clic en "Ver todas →" en la sección "Últimas Transacciones"
- O navega a `/portfolio/[id]/transactions`
- Aquí puedes filtrar por tipo de transacción o activo
- Puedes eliminar transacciones individuales

### Eliminar un Portafolio

Desde el dashboard del portafolio:
- Haz clic en el botón "🗑️ Eliminar"
- Confirma la eliminación
- Se eliminarán todas las transacciones asociadas

### Eliminar una Transacción

Desde el historial de transacciones:
- Haz clic en el ✕ en la columna "Acciones"
- Confirma la eliminación
- La posición se recalcula automáticamente

## 🔗 API Endpoints

Si necesitas agregar lógica personalizada, estos son los endpoints disponibles:

```bash
POST /api/portfolio/create
{
  "name": "string",
  "description": "string?",
  "baseCurrency": "EUR|USD|GBP"
}

POST /api/portfolio/delete
{
  "id": "uuid"
}

POST /api/asset/create
{
  "name": "string",
  "type": "stock|etf|crypto|cash",
  "currency": "string",
  "ticker": "string?",
  "exchange": "string?"
}

POST /api/transaction/create
{
  "portfolioId": "uuid",
  "assetId": "uuid",
  "type": "buy|sell|dividend|fee",
  "quantity": "number",
  "unitPrice": "number",
  "date": "YYYY-MM-DD",
  "fee": "number?",
  "notes": "string?"
}

POST /api/transaction/delete
{
  "id": "uuid"
}
```

## 📊 Cargar Datos de Ejemplo

### Vía SQL Editor (Supabase)

1. En Supabase, abre SQL Editor
2. Copia y pega el código comentado al final de `migrations/001_create_portfolio_schema.sql`
3. Ejecuta

Esto crea:
- 2 portafolios de ejemplo
- 5 activos (AAPL, MSFT, BTC, ETH, EUR)

### Vía Interfaz

Usa los modales para crear portafolios, activos y transacciones manualmente.

## 🐛 Solucionar Problemas

### "Cannot find module '@supabase/supabase-js'"

```bash
npm install
```

### "PUBLIC_SUPABASE_URL is required"

- Verifica que `.env.local` existe
- Variables deben estar prefijadas con `PUBLIC_`
- Reinicia servidor: `npm run dev`

### Precios no se actualizan

- Comprueba conexión a internet
- Verifica tickers correctos (ej: `AAPL`, no `apple`)
- Para crypto, usa IDs de CoinGecko (ej: `bitcoin`, `ethereum`)

### El modal no aparece

- Abre la consola del navegador (F12)
- Verifica que no hay errores JavaScript
- Prueba en otra pestaña del navegador

## 🔐 Seguridad

- ✅ RLS habilitado en base de datos
- ✅ Claves públicas solo (anon key)
- ✅ Precios de APIs públicas
- ✅ `.env` en .gitignore

Para producción, implementar autenticación por usuario.

## 📚 Referencias

- [Documentación Supabase](https://supabase.com/docs)
- [Astro](https://docs.astro.build)
- [CoinGecko API](https://www.coingecko.com/en/api)

## 🚀 Próximas Mejoras

- [ ] Editar portafolios
- [ ] Editar transacciones
- [ ] Gráficas de evolución P&L
- [ ] Alertas de precios
- [ ] Exportar a CSV/Excel
- [ ] Autenticación por usuario
- [ ] Análisis de diversificación
