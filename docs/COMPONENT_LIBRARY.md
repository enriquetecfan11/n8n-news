# Component Library - Investment Portfolio Design System

Quick reference for using components in this design system.

## Button Component

**File**: `src/components/Button.astro`

### Props
```typescript
interface Props {
    variant?: 'primary' | 'secondary' | 'destructive' | 'ghost' | 'icon';
    size?: 'sm' | 'md' | 'lg';
    disabled?: boolean;
    loading?: boolean;
    icon?: string;
    iconPosition?: 'left' | 'right';
    href?: string;
    target?: string;
    class?: string;
    type?: 'button' | 'submit' | 'reset';
    onClick?: string;
    title?: string;
}
```

### Usage Examples

```astro
---
import Button from "../components/Button.astro";
---

<!-- Primary action (solid background) -->
<Button variant="primary" size="md">Create Portfolio</Button>

<!-- Secondary action (bordered) -->
<Button variant="secondary" href="/portfolio">View Portfolio</Button>

<!-- Destructive action (red) -->
<Button variant="destructive" onClick="handleDelete()">Delete</Button>

<!-- Ghost action (text-only) -->
<Button variant="ghost">Learn More</Button>

<!-- Icon-only button (40×40 for close) -->
<Button variant="icon" title="Close modal">×</Button>

<!-- With icon -->
<Button variant="primary" icon="+" iconPosition="left">New</Button>

<!-- Loading state -->
<Button variant="primary" loading>Creating...</Button>

<!-- Disabled -->
<Button variant="primary" disabled>Unavailable</Button>
```

### Visual States

**Primary** (Money-moving actions)
- Default: Dark background, light text, subtle shadow
- Hover: Slightly darker, lift effect (translateY -1px), increased shadow
- Active: Return to baseline shadow
- Disabled: 50% opacity, not-allowed cursor
- Focus: 2px outline

**Secondary** (Navigation, alternatives)
- Default: Bordered, transparent background
- Hover: Light background fill
- Active: Slightly darker background
- Disabled: 50% opacity
- Focus: 2px outline

**Destructive** (Delete, cancel transactions)
- Default: Red background, light text
- Hover: Darker red, lift effect
- Active: Return to baseline
- Disabled: 50% opacity
- Focus: 2px outline

**Ghost** (Tertiary, text-like)
- Default: Transparent, text color
- Hover: Light background
- Active: Slightly darker
- Disabled: 50% opacity
- Focus: 2px outline

**Icon-Only** (40×40, close buttons)
- Default: Transparent, centered icon
- Hover: Light background
- Active: Slightly darker
- Disabled: 50% opacity
- Focus: 2px outline

---

## Modal Component

**File**: `src/components/Modal.astro`

### Props
```typescript
interface Props {
    id: string;              // Unique identifier for the modal
    title: string;           // Modal header title
    isOpen?: boolean;        // Initial open state (default: false)
    onClose?: string;        // Callback on close (optional)
    class?: string;          // Additional CSS classes
}
```

### Usage

```astro
---
import Modal from "../components/Modal.astro";
---

<Modal id="createPortfolio" title="Create New Portfolio">
  <form id="portfolio-form">
    <div class="form-group">
      <label for="name">Portfolio Name *</label>
      <input id="name" type="text" required />
    </div>
    
    <div class="form-group">
      <label for="desc">Description</label>
      <textarea id="desc"></textarea>
    </div>
    
    <div class="form-actions">
      <button type="button" class="btn btn-secondary" onclick="closeCreatePortfolio()">
        Cancel
      </button>
      <button type="submit" class="btn btn-primary">
        Create Portfolio
      </button>
    </div>
  </form>
</Modal>

<!-- Button to open modal -->
<button class="btn btn-primary" onclick="openCreatePortfolio()">
  + New Portfolio
</button>
```

### Keyboard Navigation

- **Esc** — Close modal
- **Tab** — Cycle forward through focusable elements (trapped within modal)
- **Shift+Tab** — Cycle backward through focusable elements
- **Click outside** — Close modal (click on backdrop)
- **Close button** — Click × to close

### JavaScript API

After initialization, two global functions are created:
```javascript
// Open modal
openCreatePortfolio()

// Close modal
closeCreatePortfolio()
```

Replace `createPortfolio` with your modal's `id` in camelCase.

### Features

- ✅ Backdrop blur (4px) for visual separation
- ✅ 8px border radius, clean shadow
- ✅ 40×40 close button (×) with aria-label
- ✅ Focus trap (Tab cycles within modal only)
- ✅ Esc key closes
- ✅ Click outside to close
- ✅ Fade + scale animation (300ms)
- ✅ Respects prefers-reduced-motion (fade only)
- ✅ ARIA labels for accessibility

---

## Data Display Components

### KPI Card

**File**: `src/components/portfolio/KpiCard.astro`

Shows a key performance indicator with value and optional change percentage.

```astro
---
import KpiCard from "../components/portfolio/KpiCard.astro";
---

<div class="kpi-container">
  <KpiCard 
    label="Portfolio Value"
    value="$125,432"
    suffix="USD"
    change={12.5}
    color="positive"
  />
  
  <KpiCard 
    label="Today's Loss"
    value="-$1,250"
    change={-2.3}
    color="negative"
  />
  
  <KpiCard 
    label="Holdings"
    value="24"
    color="default"
  />
</div>
```

**Features**:
- All numbers use Geist Mono
- `change` prop shows % change with color coding
- `color` prop: 'default' | 'positive' (green) | 'negative' (red)
- Responsive layout (grid auto-fit)

### Portfolio Card

Shows portfolio overview with stats and actions.

```astro
<PortfolioCard portfolio={portfolio} />
```

### Holdings Table

Displays current holdings with ticker, quantity, price, percentage.

```astro
<HoldingsTable holdings={holdings} />
```

### Transactions Table

Lists transaction history with type, amount, date, status.

```astro
<TransactionsTable transactions={transactions} />
```

---

## Color & Semantic Classes

### P&L Colors

Apply these classes to numbers to get automatic color + monospace:

```html
<!-- Profit/gain -->
<span class="pnl-positive">+$500.00</span>

<!-- Loss -->
<span class="pnl-negative">-$250.00</span>

<!-- Neutral -->
<span class="pnl-neutral">$0.00</span>
```

### Holding Badges

Type indicators for holdings:

```html
<span class="holding-badge stock">AAPL</span>
<span class="holding-badge etf">SPY</span>
<span class="holding-badge crypto">BTC</span>
<span class="holding-badge cash">USD</span>
```

### Transaction Type Badges

```html
<span class="transaction-type buy">Buy</span>
<span class="transaction-type sell">Sell</span>
<span class="transaction-type dividend">Dividend</span>
<span class="transaction-type fee">Fee</span>
```

---

## Typography & Data Display

### Using Monospace for Numbers

Default: body font (Figtree/Poppins)
Numbers: monospace font (Geist Mono)

```astro
<!-- Automatic with semantic classes -->
<span class="pnl-positive">+$1,234.56</span>

<!-- Manual application -->
<div style="font-family: var(--font-family-mono);">
  $1,234.56
</div>

<!-- CSS class -->
<span class="stat-value">1,234.56</span>  <!-- Already styled with monospace -->
```

### Labels

All labels use body font with uppercase, letter-spacing:

```astro
<label class="kpi-label">Total Portfolio Value</label>
```

---

## Form Components

### Form Group (Semantic HTML)

```astro
<div class="form-group">
  <label for="portfolio-name">Portfolio Name *</label>
  <input 
    id="portfolio-name" 
    type="text" 
    placeholder="My Portfolio"
    required 
  />
</div>

<div class="form-group">
  <label for="description">Description</label>
  <textarea id="description" rows="4"></textarea>
</div>
```

Styling is applied automatically. All inputs inherit design system spacing and borders.

### Form Actions

```astro
<div class="form-actions">
  <Button variant="secondary">Cancel</Button>
  <Button variant="primary" type="submit">Save</Button>
</div>
```

---

## Design Tokens

Access via CSS custom properties:

```css
/* Colors */
--bg-primary: #FAFAF7
--text-primary: #1A1A18
--color-gain: #059669
--color-loss: #B91C1C

/* Typography */
--font-family: 'Figtree', 'Poppins', system-ui
--font-family-mono: 'Geist Mono', 'SF Mono', monospace
--font-size-base: clamp(1rem, 1.8vw, 1.125rem)

/* Spacing */
--space-sm: 12px
--space-md: 16px
--space-lg: 24px

/* Motion */
--duration-normal: 300ms
--ease-out: cubic-bezier(0.25, 0.46, 0.45, 0.94)

/* Shadows */
--shadow-lg: 0 10px 15px rgba(26, 26, 24, 0.1)
--shadow-2xl: 0 25px 50px rgba(26, 26, 24, 0.25)

/* Border Radius */
--radius-md: 6px
--radius-lg: 8px
```

---

## Accessibility Checklist

When building new components:

- [ ] Minimum 44×44px touch target for buttons
- [ ] Focus-visible outline (should be visible, 2px)
- [ ] Color isn't the only differentiator (use icons, labels too)
- [ ] All form inputs have associated labels
- [ ] Modals trap focus and close with Esc
- [ ] Use semantic HTML (button, form, input, label, etc.)
- [ ] ARIA attributes where needed (aria-label, aria-modal, aria-labelledby)
- [ ] Motion respects prefers-reduced-motion
- [ ] Text contrast ≥ 7:1 (WCAG AA)

---

## Common Patterns

### Create Portfolio Flow

1. User clicks button → modal opens (fade + scale in)
2. Form appears, focus on first input
3. User fills form
4. Submit → request sent → loading state
5. Success → modal closes (fade + scale out), page refresh or redirect
6. Error → error message shown in modal

### Portfolio Selection

1. Cards show portfolio overview
2. Hover effect (lift) indicates interactivity
3. Click → navigate to detail page
4. Edit modal for portfolio settings

### Transaction Table with Actions

1. Table rows show transactions
2. Hover effect (background color) on row
3. Context menu or action buttons per row
4. Click delete → confirmation modal
5. Confirm → delete transaction, update table

---

## Testing Components

To verify the design system is working:

1. Check button hover/active states → should lift smoothly
2. Open a modal → should have blur backdrop and fade in
3. Try Esc in modal → should close
4. Check mobile view → buttons still 44×44px minimum
5. Check dark mode → colors should invert automatically
6. Check numbers in KPI cards → should be monospace
7. Use keyboard Tab → focus should be visible everywhere

---

## Next Steps

As you build out features:

1. **Use Button** for all interactive elements (not custom <button> tags)
2. **Use Modal** for all forms/dialogs (consistent interaction pattern)
3. **Use KpiCard** for displaying metrics (consistent data visualization)
4. **Apply monospace** to any numerical display (prices, amounts, percentages)
5. **Import design-tokens.css** in any new style files
6. **Test keyboard navigation** for every interactive component
7. **Test dark mode** by adding `dark-mode` class to body

All components are built for accessibility-first. Color is semantic (green=gain, red=loss). Motion is intentional. The system scales from mobile to desktop.
