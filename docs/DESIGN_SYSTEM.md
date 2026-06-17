# Investment Portfolio Design System

A distinctive, precision-focused design system for portfolio management. This system emphasizes clarity, control, and competence—treating data as the visual hero through deliberate typography and purposeful motion.

## Visual Thesis

**Numbers are instruments, not decoration.** All numerical data (amounts, percentages, tickers, prices) uses **Geist Mono**, a monospace typeface that signals precision. Body text and labels use **Figtree** or **Poppins** for warmth and readability. Motion is intentional and accessible—fade/scale for modals (300ms), smooth hovers for interactive elements, all respecting `prefers-reduced-motion`.

The palette is refined and institutional without being corporate: warm neutrals paired with semantic colors that map directly to financial states (gains, losses, warnings, information).

---

## Color Palette

### Neutrals (Primary)
- **Background**: `#FAFAF7` — Clean, slightly warm off-white
- **Text**: `#1A1A18` — Deep neutral-black for readability
- **Secondary Text**: `#6B6B69` — Subtle mid-tone for labels and hints
- **Borders**: `#E5E5E3` — Soft, refined edge definition

### Semantic Colors
- **Gain (positive)**: `#059669` — confident green for profits
- **Loss (negative)**: `#B91C1C` — clear red for losses/risks
- **Info**: `#0369A1` — trustworthy blue for informational content
- **Warning**: `#B45309` — amber for cautionary states

### Dark Mode
Automatically inverted via CSS custom properties. Dark mode uses:
- **Background**: `#0D0D0C`
- **Text**: `#FAFAF7`
- **Borders**: `#2F2F2D`

---

## Typography

### Font Families
- **Monospace (Data)**: Geist Mono, SF Mono, Monaco, Roboto Mono (fallback)
  - Used for: all numbers, amounts, percentages, tickers, transaction values, KPI values
  - Ensures numbers align optically and read as precise

- **Body & Labels**: Figtree, Poppins, system fonts
  - Used for: labels, descriptions, navigation, form text, headers
  - Warm, readable typeface that's not austere

### Type Scale
```
--font-size-xs:   clamp(0.75rem, 1.2vw, 0.875rem)
--font-size-sm:   clamp(0.875rem, 1.5vw, 1rem)
--font-size-base: clamp(1rem, 1.8vw, 1.125rem)
--font-size-lg:   clamp(1.125rem, 2vw, 1.25rem)
--font-size-xl:   clamp(1.25rem, 2.5vw, 1.5rem)
--font-size-2xl:  clamp(1.5rem, 3vw, 2rem)
--font-size-3xl:  clamp(1.875rem, 4vw, 2.5rem)
```

Weights:
- **300** (light) — rarely used
- **400** (normal) — body text
- **500** (medium) — labels, secondary text
- **600** (semibold) — emphasis, card titles
- **700** (bold) — data headlines, strong emphasis

---

## Button System

### Principles
- **Minimum size**: 44px (touch-friendly, accessible)
- **Clear hierarchy**: Primary for money-moving actions, secondary for navigation
- **Intentional motion**: Smooth 300ms transitions, respects prefers-reduced-motion
- **Focus visible**: 2px outline for keyboard navigation

### Variants

#### Primary
**Use for**: Creating portfolio, confirming transactions, saving changes — actions that initiate state change
```css
Background: var(--color-neutral-text)  /* #1A1A18 */
Color: var(--color-neutral-bg)         /* #FAFAF7 */
Hover: Darkened background, subtle lift (translateY -1px)
Shadow: 0 2px 8px rgba(26, 26, 24, 0.15)
```

#### Secondary
**Use for**: Cancel, navigation, alternative actions — less committed than primary
```css
Background: transparent
Color: var(--color-neutral-text)
Border: 1px solid var(--color-neutral-border)
Hover: Light background fill, border darkens
```

#### Destructive
**Use for**: Delete portfolio, remove holdings, cancel transactions — irreversible or risky
```css
Background: var(--color-loss)          /* #B91C1C */
Color: var(--color-neutral-bg)         /* #FAFAF7 */
Hover: Darkened red, lift effect
```

#### Ghost
**Use for**: Tertiary actions, links that look like text but are buttons
```css
Background: transparent
Color: text
Border: transparent
Hover: Light background, subtle affordance
```

#### Icon-Only
**Use for**: Close modals (40×40), tight-space controls
```css
Width/Height: 40px (minimum, centered × or icon)
Padding: 0
Hover: Light background, maintains touch target
```

### Size Variants
- **sm**: Compact, 36px min-height (padding: 8px 12px)
- **md**: Default, 44px min-height (padding: 12px 16px)
- **lg**: Prominent, 48px min-height (padding: 16px 24px)

### States
- **Hover**: Smooth transition (300ms), lift effect for primary/destructive
- **Active**: Pressed feedback, shadow reduces
- **Disabled**: 50% opacity, not-allowed cursor
- **Loading**: Spinner animates, content fades to 70%
- **Focus-visible**: 2px outline with 2px offset

---

## Modal System

### Principles
- **Focused workspace**: Backdrop blur creates intentional separation
- **Accessible**: ARIA labels, focus trap, keyboard navigation
- **Responsive**: 90vh max-height, full-width on mobile
- **Motion**: Fade + scale 300ms entrance/exit

### Structure

```html
<div id="modal-id" class="modal" role="dialog" aria-modal="true" aria-labelledby="modal-id-title">
  <div class="modal-backdrop"></div>  <!-- Blur overlay, closeable -->
  <div class="modal-content">
    <div class="modal-header">
      <h2 id="modal-id-title">Title</h2>
      <button class="modal-close" aria-label="Cerrar diálogo">×</button>
    </div>
    <div class="modal-body">
      <!-- Form content, slots, etc. -->
    </div>
  </div>
</div>
```

### Features
- **Container**: 8px radius, max-width 500px
- **Close button**: 40×40 px, centered ×, aria-label
- **Backdrop**: Blur (4px), click to close, can't tab through
- **Motion**: `animation: modal-fade-scale 300ms ease-out`
- **Keyboard**:
  - Esc closes modal
  - Tab traps focus (cycles within modal)
  - Shift+Tab cycles backwards
- **Respects**: prefers-reduced-motion (fade only, no scale)

### Using the Modal Component

```astro
---
import Modal from "../components/Modal.astro";
---

<Modal id="createPortfolio" title="Create Portfolio">
  <form>
    <!-- Your form fields -->
  </form>
</Modal>

<!-- JavaScript: openCreatePortfolio() / closeCreatePortfolio() -->
<button onclick="openCreatePortfolio()">New Portfolio</button>
```

---

## Motion & Animation

### Duration
- **Fast**: 150ms (micro-interactions, icon changes)
- **Normal**: 300ms (modal animations, button hovers)
- **Slow**: 500ms (page transitions, loading states)

### Easing
- **ease-out**: `cubic-bezier(0.25, 0.46, 0.45, 0.94)` — snappy, natural feel
- **ease-in-out**: `cubic-bezier(0.645, 0.045, 0.355, 1)` — smooth, rounded

### Animations
- **Modal Entrance**: fade-in + scale-up (0.95 → 1)
- **Modal Exit**: fade-out + scale-down (1 → 0.95)
- **Button Hover**: translateY(-1px) + shadow increase
- **Button Active**: translateY(0) + shadow decrease

### prefers-reduced-motion
All animations become instant (0.01ms duration) when user enables reduced motion. Modals fade without scaling. Hovers don't translate.

---

## Spacing System

```css
--space-2xs: 4px
--space-xs:  8px
--space-sm:  12px
--space-md:  16px
--space-lg:  24px
--space-xl:  32px
--space-2xl: 48px
--space-3xl: 64px
--space-4xl: 96px
```

Use consistently for:
- Padding inside cards and components
- Gaps between items in grids/flex
- Margins between sections
- Space within form groups

---

## Shadows

```css
--shadow-xs:  0 1px 2px rgba(26, 26, 24, 0.05)
--shadow-sm:  0 1px 3px rgba(26, 26, 24, 0.1)
--shadow-md:  0 4px 6px rgba(26, 26, 24, 0.07)
--shadow-lg:  0 10px 15px rgba(26, 26, 24, 0.1)
--shadow-xl:  0 20px 25px rgba(26, 26, 24, 0.1)
--shadow-2xl: 0 25px 50px rgba(26, 26, 24, 0.25)
```

Use for:
- **Cards/containers**: `--shadow-sm` (hover → `--shadow-lg`)
- **Modals**: `--shadow-2xl`
- **Buttons on hover**: incremental shadow increase

---

## Border Radius

```css
--radius-sm: 4px   /* Subtle, tight components (inputs, small buttons) */
--radius-md: 6px   /* Buttons, form elements */
--radius-lg: 8px   /* Cards, modals, large containers (PRIMARY) */
--radius-xl: 12px  /* Optional, spacious containers */
--radius-full: 9999px  /* Pills, avatars */
```

Primary used everywhere: **8px (radius-lg)**.

---

## Z-Index Scale

```css
--z-dropdown: 1000
--z-sticky:   1020
--z-fixed:    1030
--z-modal-backdrop: 1040
--z-modal:    1050   /* Always on top */
--z-popover:  1060
--z-tooltip:  1070
--z-toast:    1080
```

---

## Data Display (Numbers)

### KPI Cards
All numerical values use monospace:
```astro
<div class="kpi-card">
  <span class="kpi-label">Total Portfolio Value</span>
  <span class="kpi-value">$125,432.89</span>  <!-- Geist Mono -->
  <span class="kpi-change positive">+12.5%</span>  <!-- Geist Mono -->
</div>
```

### Tables
Column values containing numbers (prices, amounts, percentages):
```css
.holdings-table td {
  font-family: var(--font-family-mono);  /* If numeric content */
}
```

### Transactions
Amounts, fees, totals → monospace. Types (Buy, Sell, Dividend) → body font.

---

## Accessibility Checklist

- ✅ **Color contrast**: All text meets WCAG AA (7:1 min on light backgrounds)
- ✅ **Focus visible**: 2px outline on all interactive elements
- ✅ **Touch targets**: Minimum 44px × 44px
- ✅ **Keyboard nav**: Full keyboard accessibility, focus trap in modals
- ✅ **ARIA labels**: Buttons have aria-label, modals have aria-modal/aria-labelledby
- ✅ **Motion**: Respects prefers-reduced-motion, non-essential animations disabled
- ✅ **Form**: Labels associated with inputs, error states clearly marked

---

## Files & Structure

```
src/
├── styles/
│   ├── design-tokens.css      ← Custom properties (colors, spacing, shadows)
│   ├── motion.css             ← Animations, transitions, prefers-reduced-motion
│   ├── portfolio.css          ← Portfolio-specific styles
│   ├── global.css             ← Baseline typography, resets
│   └── ...
├── components/
│   ├── Button.astro           ← Button variants (primary/secondary/destructive/ghost/icon)
│   ├── Modal.astro            ← Accessible modal with focus trap
│   ├── portfolio/
│   │   ├── KpiCard.astro      ← Data card with monospace numbers
│   │   ├── HoldingsTable.astro
│   │   ├── TransactionsTable.astro
│   │   └── ...
│   └── ...
└── layouts/
    └── BaseLayout.astro       ← Imports design-tokens.css, motion.css
```

---

## Implementation Examples

### Creating a Button
```astro
---
import Button from "../components/Button.astro";
---

<!-- Primary action -->
<Button variant="primary" size="md">Create Portfolio</Button>

<!-- Secondary navigation -->
<Button variant="secondary" href="/portfolio">View All</Button>

<!-- Destructive action -->
<Button variant="destructive">Delete</Button>

<!-- Icon-only close button -->
<Button variant="icon" title="Close">×</Button>
```

### Creating a Modal
```astro
---
import Modal from "../components/Modal.astro";
---

<Modal id="newTransaction" title="Add Transaction">
  <form id="transaction-form">
    <label for="amount">Amount</label>
    <input id="amount" type="text" />
    <!-- More fields -->
  </form>
</Modal>

<script>
  // Open: openNewTransaction()
  // Close: closeNewTransaction()
</script>
```

### Using Monospace for Numbers
```astro
<div style="font-family: var(--font-family-mono);">
  $1,234.56
</div>

<!-- Or apply CSS class -->
<span class="pnl-positive">+$500.00</span>  <!-- Green, monospace -->
```

---

## Customization

All colors, spacing, shadows are CSS custom properties in `design-tokens.css`. To adjust:

```css
:root {
  --color-neutral-bg: #FAFAF7;  /* Change background color */
  --color-gain: #059669;         /* Change success color */
  --space-lg: 24px;              /* Change spacing unit */
  --radius-lg: 8px;              /* Change corner radius */
}
```

Dark mode automatically inverts via `body.dark-mode` selector.

---

## Distinctive Elements

This design system **deliberately avoids** generic SaaS templates:

1. **Monospace for data**: Not every fintech uses monospace numbers—this signals precision.
2. **Refined palette**: Warm neutrals + semantic colors, not bright accents.
3. **Intentional motion**: 300ms standard, respects accessibility, not decorative.
4. **Clear hierarchy**: Primary buttons are the only solid fills; everything else is bordered or transparent.
5. **Calm tone**: Competent and trustworthy, not playful or corporate.

The result: an interface that could only belong to this product, not a reskin of a template.
