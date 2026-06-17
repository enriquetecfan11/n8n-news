# Portfolio CRUD - Guía de Operaciones

Esta guía documenta cómo funcionan las operaciones de Create, Read, Update, Delete (CRUD) en la sección de Portfolio.

## 📊 Operaciones Implementadas

### CREATE (Crear)

#### Crear Portafolio
**UI**: `/portfolio` → Botón "+ Nuevo Portafolio"

```javascript
POST /api/portfolio/create
{
  "name": "Mi Portafolio",
  "description": "Opcional",
  "baseCurrency": "EUR"
}
```

**Respuesta**: Objeto portafolio con UUID

#### Crear Transacción
**UI**: `/portfolio/[id]` → Botón "+ Transacción"

```javascript
POST /api/transaction/create
{
  "portfolioId": "uuid",
  "assetId": "uuid",
  "type": "buy|sell|dividend|fee",
  "quantity": 10,
  "unitPrice": 150.50,
  "date": "2025-01-15",
  "fee": 2.99,
  "notes": "Opcional"
}
```

**Respuesta**: Objeto transacción con UUID

#### Crear Activo
**Vía API** (no hay UI para esto aún):

```javascript
POST /api/asset/create
{
  "name": "Apple Inc.",
  "type": "stock|etf|crypto|cash",
  "currency": "USD",
  "ticker": "AAPL",
  "exchange": "NASDAQ"
}
```

### READ (Leer)

#### Listar Portafolios
**UI**: `/portfolio`

- Fetch automático desde Supabase
- Muestra resumen KPIs para cada portafolio
- Totales calculados dinámicamente

#### Ver Dashboard Portafolio
**UI**: `/portfolio/[id]`

- KPIs principales (valor total, P&L)
- Distribución por tipo
- Últimas 5 transacciones
- Precios en tiempo real (server-side)

#### Ver Posiciones Completas
**UI**: `/portfolio/[id]/assets`

- Tabla de todos los holdings
- Calculados desde transacciones
- Precios actuales

#### Ver Transacciones
**UI**: `/portfolio/[id]/transactions`

- Historial completo
- Filtrable por tipo y activo
- URL params persistentes

### UPDATE (Actualizar)

**Actualmente no implementado desde UI**, pero la infraestructura está lista:

```javascript
POST /api/transaction/update
{
  "id": "uuid",
  "type": "buy|sell|dividend|fee",
  "quantity": 10,
  "unit_price": 150.50,
  "date": "2025-01-15",
  "fee": 2.99,
  "notes": "Updated notes"
}
```

### DELETE (Eliminar)

#### Eliminar Portafolio
**UI**: `/portfolio/[id]` → Botón "🗑️ Eliminar"

```javascript
POST /api/portfolio/delete
{
  "id": "uuid"
}
```

- Eliminación en cascada (borra también transacciones)
- Requiere confirmación

#### Eliminar Transacción
**UI**: `/portfolio/[id]/transactions` → ✕ en la columna "Acciones"

```javascript
POST /api/transaction/delete
{
  "id": "uuid"
}
```

- Recalcula holdings automáticamente
- Requiere confirmación

---

## 🏗️ Arquitectura

### Flow de Datos

```
UI (Modal/Button)
  ↓
JavaScript Event Listener
  ↓
fetch() → API Route
  ↓
Supabase Client
  ↓
PostgreSQL Database
  ↓
Supabase (respuesta JSON)
  ↓
JavaScript Handler
  ↓
Reload / Redirect / Update UI
```

### Archivos de Implementación

**API Routes:**
- `src/pages/api/portfolio/create.ts`
- `src/pages/api/portfolio/delete.ts`
- `src/pages/api/asset/create.ts`
- `src/pages/api/transaction/create.ts`
- `src/pages/api/transaction/delete.ts`

**Componentes (Modales):**
- `src/components/portfolio/CreatePortfolioModal.astro`
- `src/components/portfolio/AddTransactionModal.astro`

**Páginas:**
- `src/pages/portfolio/index.astro`
- `src/pages/portfolio/[id].astro`
- `src/pages/portfolio/[id]/transactions.astro`
- `src/pages/portfolio/[id]/assets.astro`

**Librerías:**
- `src/lib/supabase.ts` (cliente + helpers)
- `src/lib/portfolio.ts` (lógica de negocio)

---

## 🔄 Ciclo de Vida de una Operación

### Crear Portafolio (Ejemplo Completo)

1. **Usuario abre modal**: Hace clic en "+ Nuevo Portafolio"
   - Modal se hace visible con `data-open="true"`

2. **Usuario completa formulario**: Nombre, descripción, divisa

3. **Submit del formulario**: Evento `submit` disparado

4. **JavaScript intercepta**: `CreatePortfolioModal.astro:script`
   - Extrae datos del formulario
   - Valida campos requeridos
   - Muestra estado "Creando portafolio..."

5. **Request al API**: `fetch('/api/portfolio/create', { ... })`

6. **API Route** (`portfolio/create.ts`):
   - Valida request body
   - Llama a `createPortfolio()` de Supabase
   - Retorna portafolio creado o error

7. **JavaScript recibe respuesta**:
   - Si éxito: muestra "✓ Portafolio creado correctamente"
   - Si error: muestra "✗ Error al crear portafolio"

8. **Redirección**: `window.location.href = '/portfolio'`
   - El servidor re-renderiza la lista actualizada
   - Se muestra el nuevo portafolio

---

## 🚨 Manejo de Errores

### Validación en API

```typescript
if (!name || !type || !currency) {
  return new Response(
    JSON.stringify({ error: 'Campos requeridos' }),
    { status: 400, headers: { 'Content-Type': 'application/json' } }
  );
}
```

### Manejo en JavaScript

```javascript
const response = await fetch(url);
if (!response.ok) {
  const error = await response.json();
  throw new Error(error.error);
}
```

### Confirmaciones Críticas

```javascript
if (!confirm('¿Estás seguro de que deseas eliminar?')) {
  return;
}
```

---

## 📝 Validaciones

### Por Campo

| Campo | Validación | Ejemplo |
|-------|-----------|---------|
| Nombre | Requerido, texto | "Mi Portafolio" |
| Cantidad | Número positivo | 10, 0.5, 0.00000001 |
| Precio | Número positivo | 150.50 |
| Fecha | Formato YYYY-MM-DD | "2025-01-15" |
| Tipo | Enum | "buy"\|"sell"\|"dividend"\|"fee" |
| Divisa | Texto ISO | "USD", "EUR", "GBP" |

### En Base de Datos

```sql
-- Check constraints
type IN ('buy', 'sell', 'dividend', 'fee')
type IN ('stock', 'etf', 'crypto', 'cash')

-- Foreign keys
portfolio_id REFERENCES portfolios(id)
asset_id REFERENCES assets(id)
```

---

## ⚡ Performance

### Caching de Precios

```typescript
const priceCache = new Map<string, { value: number; timestamp: number }>();
const CACHE_DURATION = 15 * 60 * 1000; // 15 minutos
```

- Se cachean precios de APIs externas
- Evita saturar límites de rate limiting
- Se actualiza cada 15 minutos

### Cálculos Dinámicos

- Holdings se recalculan desde transacciones cada vez
- No hay tabla separada de holdings
- Performance O(n) pero n es pequeño en un portafolio típico

---

## 🔐 Seguridad

### CORS y CSRF

- Las rutas API son POST (no vulnerable a CSRF desde navegadores normales)
- Sin implementación CSRF en esta versión (se puede agregar si es necesario)

### SQL Injection

- Se usa Supabase client que parameteriza queries
- Sin concatenación de SQL raw

### Validación de Entrada

```typescript
const data = {
  name: formData.get('name'),      // Nunca se ejecuta como código
  quantity: parseFloat(quantity),   // Se convierte a número
  date: date,                       // Se valida como fecha
};
```

---

## 📦 Próximas Mejoras

### Fáciles
- [ ] Editar portafolios (nombre, descripción)
- [ ] Editar transacciones
- [ ] Crear activos desde UI modal

### Moderadas
- [ ] Validación de duplicados (no crear dos activos iguales)
- [ ] Historial de cambios de precios
- [ ] Undo/Redo de operaciones

### Avanzadas
- [ ] Autenticación y RLS por usuario
- [ ] Batch operations (importar CSVs)
- [ ] Webhooks para sincronizar con external APIs
- [ ] Real-time updates con Realtime de Supabase

---

## 🧪 Pruebas Manuales

### Checklist

- [ ] Crear portafolio → redirige correctamente
- [ ] Ver portafolio → muestra datos correctos
- [ ] Crear transacción → actualiza holdings
- [ ] Eliminar transacción → recalcula P&L
- [ ] Eliminar portafolio → elimina todo en cascada
- [ ] Filtros en transacciones → funcionan correctamente
- [ ] Precios se cargan → aparecen en KPIs
- [ ] Modales cierran con X, Cancel, o Overlay click
- [ ] Formularios se resetean después de submit
- [ ] Errores se muestran correctamente

---

## 📖 Referencias de Código

### Crear Transacción (JavaScript)

```javascript
const response = await fetch('/api/transaction/create', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    portfolioId: formData.get('portfolioId'),
    assetId: formData.get('assetId'),
    type: formData.get('type'),
    quantity: parseFloat(formData.get('quantity')),
    unitPrice: parseFloat(formData.get('unitPrice')),
    date: formData.get('date'),
    fee: formData.get('fee') ? parseFloat(formData.get('fee')) : undefined,
    notes: formData.get('notes'),
  }),
});
```

### Obtener Holdings Actualizados

```typescript
const transactions = await getTransactionsByPortfolio(portfolioId);
const assetMap = new Map(allAssets.map((a) => [a.id, a]));
const holdings = getHoldings(transactions, assetMap);
const summary = getPortfolioSummary(holdings);
```

---

**Última actualización**: 2025-06-16
