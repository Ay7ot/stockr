# Stockr Design System v1.0

A precise, minimal design system for Gadget Inventory — built with clarity, restraint, and operational efficiency at its core.

## Design Principles

1. **Clarity above all** - Data must be scannable in under two seconds. Hierarchy is enforced through type weight, size, and whitespace — never decoration.
2. **Functional beauty** - Nothing is added for aesthetics alone. Every visual element communicates something meaningful about state or structure.
3. **Consistent motion** - Transitions reinforce spatial relationships. Elements don't appear or disappear — they arrive from meaningful positions.
4. **Ruthless reduction** - If a UI element can be removed without losing function or clarity, it should be.
5. **Status fluency** - Inventory has states: in stock, low, critical, out. The system makes these states impossible to miss.
6. **Accessible defaults** - All color pairs meet WCAG AA contrast. Motion respects `prefers-reduced-motion`.

---

## Color Palette

### Neutral Scale — Ink

| Token | Value | Usage |
|-------|-------|-------|
| `--ink-0` | `#ffffff` | Pure white, cards on light bg |
| `--ink-50` | `#f5f5f7` | Page background |
| `--ink-100` | `#e8e8ed` | Borders, dividers |
| `--ink-200` | `#d1d1d6` | Strong borders, inputs |
| `--ink-300` | `#aeaeb2` | Placeholders, disabled |
| `--ink-400` | `#8e8e93` | Tertiary text |
| `--ink-500` | `#636366` | Secondary text, labels |
| `--ink-600` | `#3a3a3c` | Strong text, icons |
| `--ink-700` | `#2c2c2e` | Headings |
| `--ink-800` | `#1c1c1e` | Primary text |
| `--ink-900` | `#0a0a0c` | Maximum contrast |

### Brand Colors

| Color | Light | Base | Dark | Usage |
|-------|-------|------|------|-------|
| Blue | `#e8f1fc` | `#0071e3` | `#004ea8` | Primary action, links |
| Green | `#e4f9eb` | `#30d158` | `#1a9e3a` | Positive, in stock |
| Amber | `#fff5e6` | `#ff9f0a` | `#c07800` | Warning, low stock |
| Red | `#fff0ef` | `#ff3b30` | `#c00018` | Critical, error, out of stock |
| Purple | `#f5eafd` | `#bf5af2` | `#8a3ab2` | Category, tags |

### Semantic Tokens

```css
--bg: var(--ink-50);              /* Page background */
--surface: var(--ink-0);           /* Card/panel surface */
--border: var(--ink-100);          /* Default borders */
--border-strong: var(--ink-200);   /* Hover/active borders */
--text-primary: var(--ink-800);    /* Headings, values */
--text-secondary: var(--ink-500);  /* Labels, nav items */
--text-tertiary: var(--ink-300);   /* Placeholders, meta */
--accent: var(--blue);             /* Primary interactive */
```

---

## Typography

### Typefaces

- **DM Sans** - All UI copy. Warmth without personality clutter.
- **DM Mono** - All numeric and code content. Ensures alignment and precision.

### Type Scale

| Token | Size | Weight | Usage |
|-------|------|--------|-------|
| `--text-xs` | 11px | 600 | Labels, badges, uppercase |
| `--text-sm` | 13px | 400 | Body small, metadata |
| `--text-base` | 15px | 400 | Body text |
| `--text-md` | 17px | 500 | Subheadings |
| `--text-lg` | 20px | 600 | Section headings |
| `--text-xl` | 24px | 600 | Page titles |
| `--text-2xl` | 30px | 600 | Large stats |
| `--text-3xl` | 38px | 600 | Hero numbers |

### Typography Rules

- Headings use negative letter-spacing: `-0.5px` for lg, `-1px` for 2xl, `-1.2px` for 3xl
- Numeric data always uses DM Mono for tabular alignment
- Labels are uppercase with `letter-spacing: 0.8px`

---

## Spacing

Base unit: **4px grid**

| Token | Value | Usage |
|-------|-------|-------|
| `--space-1` | 4px | Icon padding, tight gaps |
| `--space-2` | 8px | Badge padding, compact lists |
| `--space-3` | 12px | Nav items, icon gaps |
| `--space-4` | 16px | Button padding, cell padding |
| `--space-5` | 20px | Card padding (compact) |
| `--space-6` | 24px | Card padding (default) |
| `--space-8` | 32px | Section gaps, topbar padding |
| `--space-10` | 40px | Section spacing |
| `--space-12` | 48px | Page section gaps |
| `--space-16` | 64px | Major page sections |

---

## Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| `--r-xs` | 6px | Badges, small buttons |
| `--r-sm` | 10px | Buttons, inputs, tabs |
| `--r-md` | 14px | Code blocks, modals |
| `--r-lg` | 20px | Cards, table cards |
| `--r-xl` | 28px | Sheet overlays |
| `50%` | - | Avatars, circular elements |

---

## Elevation (Shadows)

| Token | Value | Usage |
|-------|-------|-------|
| `--shadow-xs` | `0 1px 2px rgba(0,0,0,.05)` | Subtle borders, chips |
| `--shadow-sm` | `0 1px 4px rgba(0,0,0,.06), 0 2px 8px rgba(0,0,0,.04)` | Cards (default) |
| `--shadow-md` | `0 4px 16px rgba(0,0,0,.08), 0 1px 3px rgba(0,0,0,.04)` | Cards (hover) |
| `--shadow-lg` | `0 12px 40px rgba(0,0,0,.12), 0 2px 8px rgba(0,0,0,.06)` | Modals, dropdowns |

---

## Motion

### Timing

| Token | Value | Usage |
|-------|-------|-------|
| `--duration-fast` | 120ms | Hover states, color transitions |
| `--duration-base` | 220ms | Card hover, input focus, tabs |
| `--duration-slow` | 380ms | Page fades, sheet slides |

### Easing

```css
--ease: cubic-bezier(.25, .46, .45, .94);
```

### Keyframe: fadeUp

```css
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
}
```

---

## Components

### Buttons

**Variants:**
- `.btn-primary` - Blue bg, white text. One per screen (main action).
- `.btn-secondary` - White bg, gray border. Secondary actions.
- `.btn-ghost` - Transparent, blue text. Tertiary actions.
- `.btn-destructive` - Red light bg, red text. Delete/remove.

**Sizes:**
- `.btn-sm` - 32px height, 5px 12px padding
- Default - 36px height, 8px 16px padding
- `.btn-lg` - 42px height, 11px 22px padding

### Badges

| Variant | Background | Text | Usage |
|---------|------------|------|-------|
| `badge-green` | `#e4f9eb` | `#1a7a32` | In Stock |
| `badge-amber` | `#fff5e6` | `#a05c00` | Low Stock |
| `badge-red` | `#fff0ef` | `#cc0000` | Critical, Out of Stock |
| `badge-blue` | `#e8f1fc` | `#0071e3` | Category |
| `badge-purple` | `#f5eafd` | `#7c2da0` | Tag |
| `badge-neutral` | `#e8e8ed` | `#3a3a3c` | Draft, Inactive |

### Form Elements

**Input:**
- Height: 36px
- Padding: 8px 12px
- Border: 1px solid `--ink-200`
- Border radius: `--r-sm`
- Focus: Blue border + 3px blue ring (15% opacity)

### Stock Indicator Bar

| Threshold | Fill Color | Badge |
|-----------|------------|-------|
| ≥ 30% capacity | `--green` | badge-green "In Stock" |
| 10-29% capacity | `--amber` | badge-amber "Low Stock" |
| 1-9% capacity | `--red` | badge-red "Critical" |
| 0 units | none (empty) | badge-red "Out of Stock" |

### Icons

- Library: Lucide
- Size: 16×16 (small), 20×20 (medium), 24×24 (large)
- Stroke width: 2.0 at 16-20px, 1.8 at 24px+
- Always use `stroke-linecap: round`
- Never fill icons

---

## Layout

### Structure

- **Sidebar**: 240px fixed, sticky, full height
- **Topbar**: 60px height, sticky, backdrop-filter: blur(12px)
- **Content**: Fluid, max-width varies by context
- **Content padding**: 32px horizontal

### Breakpoints

- Min width: 1280px
- Below 1440px: KPI grid collapses to 2 columns

### Grid Patterns

- **KPI grid**: `repeat(4, 1fr)`, 20px gap
- **Bottom grid**: `1fr 360px` (Chart + activity)

---

## Complete CSS Tokens

```css
:root {
  /* Neutrals */
  --ink-0:   #ffffff;
  --ink-50:  #f5f5f7;
  --ink-100: #e8e8ed;
  --ink-200: #d1d1d6;
  --ink-300: #aeaeb2;
  --ink-400: #8e8e93;
  --ink-500: #636366;
  --ink-600: #3a3a3c;
  --ink-700: #2c2c2e;
  --ink-800: #1c1c1e;
  --ink-900: #0a0a0c;

  /* Brand */
  --blue:        #0071e3;
  --blue-light:  #e8f1fc;
  --blue-dark:   #004ea8;
  --green:       #30d158;
  --green-light: #e4f9eb;
  --red:         #ff3b30;
  --red-light:   #fff0ef;
  --amber:       #ff9f0a;
  --amber-light: #fff5e6;
  --purple:      #bf5af2;
  --purple-light:#f5eafd;

  /* Semantic */
  --bg:             var(--ink-50);
  --surface:        var(--ink-0);
  --border:         var(--ink-100);
  --border-strong:  var(--ink-200);
  --text-primary:   var(--ink-800);
  --text-secondary: var(--ink-500);
  --text-tertiary:  var(--ink-300);
  --accent:         var(--blue);

  /* Radius */
  --r-xs: 6px;
  --r-sm: 10px;
  --r-md: 14px;
  --r-lg: 20px;
  --r-xl: 28px;

  /* Shadows */
  --shadow-xs: 0 1px 2px rgba(0,0,0,.05);
  --shadow-sm: 0 1px 4px rgba(0,0,0,.06), 0 2px 8px rgba(0,0,0,.04);
  --shadow-md: 0 4px 16px rgba(0,0,0,.08), 0 1px 3px rgba(0,0,0,.04);
  --shadow-lg: 0 12px 40px rgba(0,0,0,.12), 0 2px 8px rgba(0,0,0,.06);

  /* Type scale */
  --text-xs:  11px;
  --text-sm:  13px;
  --text-base:15px;
  --text-md:  17px;
  --text-lg:  20px;
  --text-xl:  24px;
  --text-2xl: 30px;
  --text-3xl: 38px;

  /* Spacing (4px grid) */
  --space-1:  4px;
  --space-2:  8px;
  --space-3:  12px;
  --space-4:  16px;
  --space-5:  20px;
  --space-6:  24px;
  --space-8:  32px;
  --space-10: 40px;
  --space-12: 48px;
  --space-16: 64px;

  /* Motion */
  --ease: cubic-bezier(.25,.46,.45,.94);
  --duration-fast: 120ms;
  --duration-base: 220ms;
  --duration-slow: 380ms;
}
```
