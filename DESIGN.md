---
version: alpha
name: PharmaLink-Design-System
description: PharmaLink is a right-to-left (RTL) medicine delivery platform for the Egyptian market. The design system is built around a clean, trustworthy healthcare aesthetic — a deep emerald green primary color evoking pharmacy trust, paired with warm coral accents for urgency and action. The system supports a full patient journey from prescription upload to real-time order tracking, with a mobile-first responsive approach and Arabic-first typography using Cairo font family.

colors:
  primary: "#0d9488"
  primary-deep: "#0f766e"
  primary-light: "#ccfbf1"
  primary-50: "#f0fdfa"
  primary-100: "#ccfbf1"
  primary-200: "#99f6e4"
  primary-300: "#5eead4"
  primary-400: "#2dd4bf"
  primary-500: "#14b8a6"
  primary-600: "#0d9488"
  primary-700: "#0f766e"
  primary-800: "#115e59"
  primary-900: "#134e4a"
  accent-coral: "#f97316"
  accent-coral-light: "#fff7ed"
  accent-coral-deep: "#ea580c"
  accent-rose: "#fb7185"
  accent-rose-light: "#fff1f2"
  accent-blue: "#3b82f6"
  accent-blue-light: "#eff6ff"
  success: "#22c55e"
  success-light: "#f0fdf4"
  warning: "#eab308"
  warning-light: "#fefce8"
  error: "#ef4444"
  error-light: "#fef2f2"
  canvas: "#ffffff"
  surface: "#f8fafc"
  surface-elevated: "#ffffff"
  surface-card: "#ffffff"
  hairline: "#e2e8f0"
  hairline-soft: "#f1f5f9"
  hairline-strong: "#cbd5e1"
  ink-deep: "#0f172a"
  ink: "#1e293b"
  charcoal: "#334155"
  slate: "#475569"
  steel: "#64748b"
  stone: "#94a3b8"
  muted: "#cbd5e1"
  placeholder: "#94a3b8"
  on-primary: "#ffffff"
  on-dark: "#ffffff"
  on-dark-muted: "#cbd5e1"
  on-coral: "#ffffff"
  footer-bg: "#0f172a"
  overlay: "rgba(15, 23, 42, 0.5)"
  shadow-color: "rgba(15, 23, 42, 0.08)"

typography:
  hero-display:
    fontFamily: Cairo
    fontSize: 56px
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: 0
  display-lg:
    fontFamily: Cairo
    fontSize: 48px
    fontWeight: 700
    lineHeight: 1.25
    letterSpacing: 0
  heading-1:
    fontFamily: Cairo
    fontSize: 40px
    fontWeight: 700
    lineHeight: 1.3
    letterSpacing: 0
  heading-2:
    fontFamily: Cairo
    fontSize: 32px
    fontWeight: 700
    lineHeight: 1.35
    letterSpacing: 0
  heading-3:
    fontFamily: Cairo
    fontSize: 24px
    fontWeight: 700
    lineHeight: 1.4
    letterSpacing: 0
  heading-4:
    fontFamily: Cairo
    fontSize: 20px
    fontWeight: 600
    lineHeight: 1.45
    letterSpacing: 0
  heading-5:
    fontFamily: Cairo
    fontSize: 18px
    fontWeight: 600
    lineHeight: 1.5
    letterSpacing: 0
  subtitle:
    fontFamily: Cairo
    fontSize: 18px
    fontWeight: 400
    lineHeight: 1.6
    letterSpacing: 0
  body-lg:
    fontFamily: Cairo
    fontSize: 18px
    fontWeight: 400
    lineHeight: 1.6
    letterSpacing: 0
  body-md:
    fontFamily: Cairo
    fontSize: 16px
    fontWeight: 400
    lineHeight: 1.6
    letterSpacing: 0
  body-md-medium:
    fontFamily: Cairo
    fontSize: 16px
    fontWeight: 500
    lineHeight: 1.6
    letterSpacing: 0
  body-sm:
    fontFamily: Cairo
    fontSize: 14px
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: 0
  body-sm-medium:
    fontFamily: Cairo
    fontSize: 14px
    fontWeight: 500
    lineHeight: 1.5
    letterSpacing: 0
  caption:
    fontFamily: Cairo
    fontSize: 13px
    fontWeight: 400
    lineHeight: 1.4
    letterSpacing: 0
  caption-bold:
    fontFamily: Cairo
    fontSize: 13px
    fontWeight: 600
    lineHeight: 1.4
    letterSpacing: 0
  micro:
    fontFamily: Cairo
    fontSize: 12px
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: 0
  micro-uppercase:
    fontFamily: Cairo
    fontSize: 11px
    fontWeight: 600
    lineHeight: 1.4
    letterSpacing: 0.5px
  button-md:
    fontFamily: Cairo
    fontSize: 16px
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: 0
  stat-display:
    fontFamily: Cairo
    fontSize: 48px
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: 0
  price-display:
    fontFamily: Cairo
    fontSize: 32px
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: 0
  order-id:
    fontFamily: "IBM Plex Mono", monospace
    fontSize: 13px
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: 0.5px

rounded:
  xs: 4px
  sm: 6px
  md: 8px
  lg: 12px
  xl: 16px
  xxl: 20px
  xxxl: 24px
  full: 9999px

spacing:
  xxs: 4px
  xs: 8px
  sm: 12px
  md: 16px
  lg: 20px
  xl: 24px
  xxl: 32px
  xxxl: 40px
  section-sm: 48px
  section: 64px
  section-lg: 96px
  hero: 80px

components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    typography: "{typography.button-md}"
    rounded: "{rounded.lg}"
    padding: "14px 28px"
    shadow: "0 4px 14px rgba(13, 148, 136, 0.25)"
  button-primary-pressed:
    backgroundColor: "{colors.primary-deep}"
    textColor: "{colors.on-primary}"
    shadow: "0 2px 8px rgba(13, 148, 136, 0.3)"
  button-primary-disabled:
    backgroundColor: "{colors.primary-200}"
    textColor: "{colors.primary-400}"
    shadow: "none"
  button-coral:
    backgroundColor: "{colors.accent-coral}"
    textColor: "{colors.on-coral}"
    typography: "{typography.button-md}"
    rounded: "{rounded.lg}"
    padding: "14px 28px"
    shadow: "0 4px 14px rgba(249, 115, 22, 0.25)"
  button-coral-pressed:
    backgroundColor: "{colors.accent-coral-deep}"
    textColor: "{colors.on-coral}"
  button-secondary:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    typography: "{typography.button-md}"
    rounded: "{rounded.lg}"
    padding: "14px 28px"
    border: "1.5px solid {colors.hairline-strong}"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.primary}"
    typography: "{typography.button-md}"
    rounded: "{rounded.lg}"
    padding: "10px 20px"
  button-upload:
    backgroundColor: "{colors.primary-50}"
    textColor: "{colors.primary-700}"
    typography: "{typography.button-md}"
    rounded: "{rounded.xl}"
    padding: "20px 32px"
    border: "2px dashed {colors.primary-300}"
  card-base:
    backgroundColor: "{colors.surface-card}"
    rounded: "{rounded.xl}"
    padding: "{spacing.xl}"
    border: "1px solid {colors.hairline-soft}"
    shadow: "0 1px 3px {colors.shadow-color}"
  card-elevated:
    backgroundColor: "{colors.surface-card}"
    rounded: "{rounded.xl}"
    padding: "{spacing.xl}"
    border: "1px solid {colors.hairline-soft}"
    shadow: "0 4px 20px {colors.shadow-color}"
  card-feature:
    backgroundColor: "{colors.surface-card}"
    rounded: "{rounded.xxl}"
    padding: "{spacing.xxl}"
    border: "1px solid {colors.hairline-soft}"
  card-feature-primary:
    backgroundColor: "{colors.primary-50}"
    textColor: "{colors.primary-800}"
    rounded: "{rounded.xxl}"
    padding: "{spacing.xxl}"
    border: "1px solid {colors.primary-200}"
  card-feature-coral:
    backgroundColor: "{colors.accent-coral-light}"
    textColor: "{colors.accent-coral-deep}"
    rounded: "{rounded.xxl}"
    padding: "{spacing.xxl}"
  card-order-tracking:
    backgroundColor: "{colors.surface-card}"
    rounded: "{rounded.xl}"
    padding: "{spacing.lg} {spacing.xl}"
    border: "1px solid {colors.hairline}"
    shadow: "0 2px 12px {colors.shadow-color}"
  card-stat:
    backgroundColor: "transparent"
    textColor: "{colors.ink-deep}"
    typography: "{typography.stat-display}"
    padding: "{spacing.md}"
  card-testimonial:
    backgroundColor: "{colors.surface-card}"
    rounded: "{rounded.xxl}"
    padding: "{spacing.xxl}"
    border: "1px solid {colors.hairline-soft}"
  card-prescription-item:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.lg}"
    padding: "{spacing.md} {spacing.lg}"
    border: "1px solid {colors.hairline-soft}"
  text-input:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    typography: "{typography.body-md}"
    rounded: "{rounded.lg}"
    padding: "{spacing.md} {spacing.lg}"
    border: "1.5px solid {colors.hairline-strong}"
    height: 52px
  text-input-focused:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    border: "2px solid {colors.primary}"
    shadow: "0 0 0 4px {colors.primary-100}"
  text-input-error:
    backgroundColor: "{colors.error-light}"
    textColor: "{colors.error}"
    border: "1.5px solid {colors.error}"
  search-pill:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.steel}"
    typography: "{typography.body-sm}"
    rounded: "{rounded.full}"
    padding: "{spacing.sm} {spacing.lg}"
    height: 44px
    border: "1px solid {colors.hairline}"
  badge-status-pending:
    backgroundColor: "{colors.warning-light}"
    textColor: "{colors.warning}"
    typography: "{typography.caption-bold}"
    rounded: "{rounded.full}"
    padding: "6px 14px"
  badge-status-processing:
    backgroundColor: "{colors.primary-100}"
    textColor: "{colors.primary-700}"
    typography: "{typography.caption-bold}"
    rounded: "{rounded.full}"
    padding: "6px 14px"
  badge-status-delivering:
    backgroundColor: "{colors.accent-blue-light}"
    textColor: "{colors.accent-blue}"
    typography: "{typography.caption-bold}"
    rounded: "{rounded.full}"
    padding: "6px 14px"
  badge-status-delivered:
    backgroundColor: "{colors.success-light}"
    textColor: "{colors.success}"
    typography: "{typography.caption-bold}"
    rounded: "{rounded.full}"
    padding: "6px 14px"
  badge-tag-primary:
    backgroundColor: "{colors.primary-100}"
    textColor: "{colors.primary-700}"
    typography: "{typography.caption-bold}"
    rounded: "{rounded.full}"
    padding: "4px 12px"
  badge-tag-coral:
    backgroundColor: "{colors.accent-coral-light}"
    textColor: "{colors.accent-coral-deep}"
    typography: "{typography.caption-bold}"
    rounded: "{rounded.full}"
    padding: "4px 12px"
  badge-tag-rose:
    backgroundColor: "{colors.accent-rose-light}"
    textColor: "{colors.accent-rose}"
    typography: "{typography.caption-bold}"
    rounded: "{rounded.full}"
    padding: "4px 12px"
  step-indicator:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    typography: "{typography.heading-4}"
    rounded: "{rounded.full}"
    size: 48px
  step-indicator-inactive:
    backgroundColor: "{colors.hairline-soft}"
    textColor: "{colors.stone}"
    typography: "{typography.heading-4}"
    rounded: "{rounded.full}"
    size: 48px
  progress-track:
    backgroundColor: "{colors.hairline-soft}"
    height: 6px
    rounded: "{rounded.full}"
  progress-fill:
    backgroundColor: "{colors.primary}"
    height: 6px
    rounded: "{rounded.full}"
  progress-fill-coral:
    backgroundColor: "{colors.accent-coral}"
    height: 6px
    rounded: "{rounded.full}"
  avatar-circle:
    backgroundColor: "{colors.primary-100}"
    textColor: "{colors.primary-700}"
    typography: "{typography.heading-5}"
    rounded: "{rounded.full}"
    size: 48px
  avatar-circle-large:
    backgroundColor: "{colors.primary-100}"
    textColor: "{colors.primary-700}"
    typography: "{typography.heading-3}"
    rounded: "{rounded.full}"
    size: 64px
  nav-top:
    backgroundColor: "{colors.canvas}"
    height: 72px
    border: "0 0 1px {colors.hairline-soft} solid"
    shadow: "0 1px 3px {colors.shadow-color}"
  nav-link:
    backgroundColor: "transparent"
    textColor: "{colors.charcoal}"
    typography: "{typography.body-md-medium}"
    padding: "{spacing.sm} {spacing.md}"
  nav-link-active:
    backgroundColor: "{colors.primary-50}"
    textColor: "{colors.primary-700}"
    typography: "{typography.body-md-medium}"
    rounded: "{rounded.lg}"
    padding: "{spacing.sm} {spacing.md}"
  hero-band:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink-deep}"
    padding: "{spacing.hero} {spacing.section}"
  section-band:
    backgroundColor: "{colors.canvas}"
    padding: "{spacing.section-lg} {spacing.section}"
  section-band-alt:
    backgroundColor: "{colors.surface}"
    padding: "{spacing.section-lg} {spacing.section}"
  cta-banner:
    backgroundColor: "{colors.primary-800}"
    textColor: "{colors.on-dark}"
    rounded: "{rounded.xxl}"
    padding: "{spacing.section} {spacing.xxl}"
  footer-region:
    backgroundColor: "{colors.footer-bg}"
    textColor: "{colors.on-dark}"
    typography: "{typography.body-sm}"
    padding: "{spacing.section-lg} {spacing.xxl}"
  footer-link:
    backgroundColor: "transparent"
    textColor: "{colors.on-dark-muted}"
    typography: "{typography.body-sm}"
    padding: "{spacing.xxs} 0"
  divider-soft:
    backgroundColor: "{colors.hairline-soft}"
    height: 1px
  divider-strong:
    backgroundColor: "{colors.hairline}"
    height: 1px
  icon-circle-primary:
    backgroundColor: "{colors.primary-100}"
    textColor: "{colors.primary-600}"
    rounded: "{rounded.full}"
    size: 56px
  icon-circle-coral:
    backgroundColor: "{colors.accent-coral-light}"
    textColor: "{colors.accent-coral}"
    rounded: "{rounded.full}"
    size: 56px
  icon-circle-rose:
    backgroundColor: "{colors.accent-rose-light}"
    textColor: "{colors.accent-rose}"
    rounded: "{rounded.full}"
    size: 56px
  icon-circle-blue:
    backgroundColor: "{colors.accent-blue-light}"
    textColor: "{colors.accent-blue}"
    rounded: "{rounded.full}"
    size: 56px
  prescription-preview:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.lg}"
    border: "1px solid {colors.hairline}"
    padding: "{spacing.md}"
  order-timeline-item:
    backgroundColor: "transparent"
    padding: "{spacing.md} 0"
    border: "0 0 0 2px {colors.hairline} solid"
  order-timeline-item-active:
    border: "0 0 0 2px {colors.primary} solid"
  toast-success:
    backgroundColor: "{colors.success}"
    textColor: "{colors.on-primary}"
    rounded: "{rounded.lg}"
    padding: "{spacing.md} {spacing.lg}"
    shadow: "0 4px 12px rgba(34, 197, 94, 0.3)"
  toast-error:
    backgroundColor: "{colors.error}"
    textColor: "{colors.on-primary}"
    rounded: "{rounded.lg}"
    padding: "{spacing.md} {spacing.lg}"
    shadow: "0 4px 12px rgba(239, 68, 68, 0.3)"
  modal-overlay:
    backgroundColor: "{colors.overlay}"
  modal-container:
    backgroundColor: "{colors.surface-card}"
    rounded: "{rounded.xxl}"
    padding: "{spacing.xxl}"
    shadow: "0 20px 60px rgba(15, 23, 42, 0.2)"
  mobile-bottom-nav:
    backgroundColor: "{colors.canvas}"
    height: 64px
    border: "1px 0 0 {colors.hairline-soft} solid"
    shadow: "0 -2px 10px {colors.shadow-color}"
  mobile-nav-item:
    backgroundColor: "transparent"
    textColor: "{colors.steel}"
    typography: "{typography.micro}"
    padding: "{spacing.xs} {spacing.sm}"
  mobile-nav-item-active:
    textColor: "{colors.primary}"
---

## Overview

PharmaLink is an Arabic-first, right-to-left (RTL) medicine delivery platform serving the Egyptian market. The design language balances clinical trust with consumer warmth — a deep emerald green primary palette signals pharmacy reliability, while coral accents inject urgency and action into CTAs and status indicators. The interface is built mobile-first, with a clear patient journey from prescription upload through real-time order tracking.

The homepage opens with a centered hero proposition: "احصل على دوائك بنقرة واحدة" (Get your medicine with one click), followed by a prescription upload CTA, a live order tracking card, a 3-step how-it-works flow, feature highlights, social proof stats, and customer testimonials. The entire system reads right-to-left with Cairo as the primary typeface.

**Key Characteristics:**
- RTL-first layout with logical properties for spacing and alignment
- Deep emerald green (`{colors.primary}`) as the dominant brand color — never used as a background wash
- Coral (`{colors.accent-coral}`) reserved for urgent CTAs and delivery status
- Cairo font family across all surfaces, from 56px hero display to 11px micro labels
- Rounded-lg (12px) as the default button radius; full-pill for status badges only
- Prescription upload zone with dashed-border drag-and-drop treatment
- Live order tracking card with step timeline and progress bar
- Stat counters with large display numbers for social proof
- Customer testimonial cards with avatar initials and role badges
- Mobile bottom navigation bar for core app flows

## Colors

### Brand & Accent
- **Primary Emerald** (`{colors.primary}`): The dominant brand color — CTAs, active states, progress fills. Evokes pharmacy trust and healthcare reliability.
- **Primary Deep** (`{colors.primary-deep}`): Pressed/hover state for primary buttons.
- **Primary Light** (`{colors.primary-light}`): Subtle background tints for feature cards and focus rings.
- **Accent Coral** (`{colors.accent-coral}`): Urgency color for secondary CTAs, delivery tracking, and promotional highlights.
- **Accent Coral Deep** (`{colors.accent-coral-deep}`): Pressed state for coral buttons.
- **Accent Coral Light** (`{colors.accent-coral-light}`): Background tint for coral-themed feature cards.
- **Accent Rose** (`{colors.accent-rose}`): Soft accent for testimonials and gentle highlights.
- **Accent Blue** (`{colors.accent-blue}`): Informational accent for delivery-in-progress states.
- **Success Green** (`{colors.success}`): Delivered status, confirmation toasts.
- **Warning Yellow** (`{colors.warning}`): Pending status indicators.
- **Error Red** (`{colors.error}`): Form validation errors, cancellation states.

### Surface
- **Canvas White** (`{colors.canvas}`): Page background and primary card surface.
- **Surface** (`{colors.surface}`): Subtle section alternation (hero band, alternating sections).
- **Surface Elevated** (`{colors.surface-elevated}`): Modal and dropdown backgrounds.
- **Surface Card** (`{colors.surface-card}`): Card backgrounds — always white for maximum contrast.
- **Hairline** (`{colors.hairline}`): Primary 1px borders and dividers.
- **Hairline Soft** (`{colors.hairline-soft}`): Quieter dividers, table-row separators.
- **Hairline Strong** (`{colors.hairline-strong}`): Input borders and stronger card outlines.

### Text
- **Ink Deep** (`{colors.ink-deep}`): Hero headlines, primary headings.
- **Ink** (`{colors.ink}`): Body text, card titles.
- **Charcoal** (`{colors.charcoal}`): Emphasis text, secondary headings.
- **Slate** (`{colors.slate}`): Metadata, timestamps.
- **Steel** (`{colors.steel}`): Tertiary text, inactive nav items.
- **Stone** (`{colors.stone}`): Captions, helper text.
- **Muted** (`{colors.muted}`): Disabled states, placeholders.
- **Placeholder** (`{colors.placeholder}`): Input placeholder text.
- **On Primary** (`{colors.on-primary}`): White text on primary buttons.
- **On Dark** (`{colors.on-dark}`): White text on dark surfaces (footer, CTA banner).
- **On Dark Muted** (`{colors.on-dark-muted}`): Reduced-opacity white for footer links.

### Semantic
- **Shadow Color** (`{colors.shadow-color}`): Unified shadow tint — `rgba(15, 23, 42, 0.08)`.
- **Overlay** (`{colors.overlay}`): Modal backdrop — `rgba(15, 23, 42, 0.5)`.

## Typography

### Font Family
**Cairo** (primary): A modern Arabic typeface with excellent readability at all sizes. Used across every UI surface from 56px hero display to 11px micro labels. The face has open counters and balanced proportions that perform well in RTL layouts. Fallbacks: "Noto Sans Arabic", "Tahoma", system-ui, sans-serif.

**IBM Plex Mono** (monospace): Used exclusively for order IDs and tracking numbers to ensure character-level clarity.

### Hierarchy

| Token | Size | Weight | Line Height | Letter Spacing | Use |
|---|---|---|---|---|---|
| `{typography.hero-display}` | 56px | 700 | 1.2 | 0 | Marketing hero headline |
| `{typography.display-lg}` | 48px | 700 | 1.25 | 0 | Major section openers |
| `{typography.heading-1}` | 40px | 700 | 1.3 | 0 | Page-level headlines |
| `{typography.heading-2}` | 32px | 700 | 1.35 | 0 | Section headlines |
| `{typography.heading-3}` | 24px | 700 | 1.4 | 0 | Card titles, feature names |
| `{typography.heading-4}` | 20px | 600 | 1.45 | 0 | Sub-card titles, step labels |
| `{typography.heading-5}` | 18px | 600 | 1.5 | 0 | FAQ questions, small cards |
| `{typography.subtitle}` | 18px | 400 | 1.6 | 0 | Hero subtitle, section descriptions |
| `{typography.body-lg}` | 18px | 400 | 1.6 | 0 | Emphasis body text |
| `{typography.body-md}` | 16px | 400 | 1.6 | 0 | Primary body text |
| `{typography.body-md-medium}` | 16px | 500 | 1.6 | 0 | Navigation links, labels |
| `{typography.body-sm}` | 14px | 400 | 1.5 | 0 | Secondary body, table cells |
| `{typography.body-sm-medium}` | 14px | 500 | 1.5 | 0 | Order item names, metadata |
| `{typography.caption}` | 13px | 400 | 1.4 | 0 | Helper text, timestamps |
| `{typography.caption-bold}` | 13px | 600 | 1.4 | 0 | Status badges, tags |
| `{typography.micro}` | 12px | 500 | 1.4 | 0 | Footer microcopy |
| `{typography.micro-uppercase}` | 11px | 600 | 1.4 | 0.5px | Section labels, table headers |
| `{typography.button-md}` | 16px | 600 | 1.3 | 0 | Primary button labels |
| `{typography.stat-display}` | 48px | 700 | 1.1 | 0 | "+3,921" stat callouts |
| `{typography.price-display}` | 32px | 700 | 1.2 | 0 | Order total, pricing |
| `{typography.order-id}` | 13px | 500 | 1.4 | 0.5px | Order tracking numbers |

### Principles
- **Generous line height** (1.6) for Arabic text ensures diacritics don't collide
- **No negative letter-spacing** — Arabic scripts require natural character spacing
- **Bold weight (700) for all headings** — creates clear hierarchy in RTL
- **Medium weight (500/600) for interactive elements** — buttons, nav links, badges
- **Monospace for order IDs** — prevents character confusion in tracking numbers

## Layout

### Spacing System
- **Base unit**: 4px
- **Tokens**: `{spacing.xxs}` (4px) · `{spacing.xs}` (8px) · `{spacing.sm}` (12px) · `{spacing.md}` (16px) · `{spacing.lg}` (20px) · `{spacing.xl}` (24px) · `{spacing.xxl}` (32px) · `{spacing.xxxl}` (40px) · `{spacing.section-sm}` (48px) · `{spacing.section}` (64px) · `{spacing.section-lg}` (96px) · `{spacing.hero}` (80px)
- **Section rhythm**: Alternating `{spacing.section-lg}` (96px) between white and surface-gray bands
- **Card internal padding**: `{spacing.xl}` (24px) for standard cards; `{spacing.xxl}` (32px) for feature and testimonial cards

### Grid & Container
- Max-width: 1200px centered with `{spacing.section}` (64px) horizontal padding
- Mobile: full-width with `{spacing.lg}` (20px) horizontal padding
- Hero band: centered single-column layout
- How-it-works: 3-column grid on desktop, single column on mobile
- Feature highlights: 2×2 grid on desktop, single column on mobile
- Stats row: 4-column flex row on desktop, 2×2 grid on tablet, single column on mobile
- Testimonials: 3-column grid on desktop, single column on mobile

### RTL Considerations
- All text alignment defaults to `text-align: right`
- Flex and grid layouts use logical properties: `margin-inline-start/end`, `padding-inline-start/end`
- Icons in buttons and navigation maintain logical positioning relative to text
- Progress bars and timelines fill from right to left
- Number inputs and order IDs remain LTR within their containers (`dir="ltr"`)

## Elevation & Depth

| Level | Treatment | Use |
|---|---|---|
| 0 (flat) | No shadow; `{colors.hairline-soft}` border | Default cards, input fields |
| 1 (subtle) | `0 1px 3px {colors.shadow-color}` | Subtle hover-elevated tiles |
| 2 (card) | `0 2px 12px {colors.shadow-color}` | Order tracking cards, elevated cards |
| 3 (feature) | `0 4px 20px {colors.shadow-color}` | Feature cards, testimonial cards |
| 4 (modal) | `0 20px 60px rgba(15, 23, 42, 0.2)` | Modals, bottom sheets |

### Decorative Depth
- Hero band uses a subtle gradient from `{colors.surface}` to `{colors.canvas}`
- Feature cards use colored background tints (primary-50, coral-light) instead of shadows for visual weight
- Order tracking card uses a left-border accent in `{colors.primary}` for RTL emphasis
- Avatar circles use solid background colors with contrasting initials

## Shapes

### Border Radius Scale

| Token | Value | Use |
|---|---|---|
| `{rounded.xs}` | 4px | Small chips, micro-controls |
| `{rounded.sm}` | 6px | Small badges, discount pills |
| `{rounded.md}` | 8px | Inputs, search pills |
| `{rounded.lg}` | 12px | Standard buttons, cards, modals |
| `{rounded.xl}` | 16px | Feature panels, order cards |
| `{rounded.xxl}` | 20px | Large feature cards, testimonial cards |
| `{rounded.xxxl}` | 24px | Hero CTA containers |
| `{rounded.full}` | 9999px | Status badges, avatars, step indicators |

### Component Geometry
- Buttons: `{rounded.lg}` (12px) — rounded rectangles, not full pills
- Status badges: `{rounded.full}` — full pills
- Cards: `{rounded.xl}` (16px) to `{rounded.xxl}` (20px)
- Avatars: `{rounded.full}` — perfect circles
- Upload zone: `{rounded.xl}` with dashed border
- Modal containers: `{rounded.xxl}` (20px)

## Components

### Buttons

**`button-primary`** — Emerald primary CTA, the dominant action ("اطلب الآن" / "Order Now").
- Background `{colors.primary}`, text `{colors.on-primary}`, typography `{typography.button-md}`, padding `14px 28px`, rounded `{rounded.lg}`.
- Shadow: `0 4px 14px rgba(13, 148, 136, 0.25)`.
- Pressed state `button-primary-pressed`: background `{colors.primary-deep}`, reduced shadow.
- Disabled state `button-primary-disabled`: background `{colors.primary-200}`, text `{colors.primary-400}`, no shadow.

**`button-coral`** — Coral accent CTA for urgency ("توصيل سريع" / "Fast Delivery").
- Background `{colors.accent-coral}`, text `{colors.on-coral}`, typography `{typography.button-md}`, padding `14px 28px`, rounded `{rounded.lg}`.
- Shadow: `0 4px 14px rgba(249, 115, 22, 0.25)`.
- Pressed state `button-coral-pressed`: background `{colors.accent-coral-deep}`.

**`button-secondary`** — Outlined button for secondary actions.
- Background transparent, text `{colors.ink}`, border `1.5px solid {colors.hairline-strong}`, typography `{typography.button-md}`, padding `14px 28px`, rounded `{rounded.lg}`.

**`button-ghost`** — Text-only button for tertiary actions.
- Background transparent, text `{colors.primary}`, typography `{typography.button-md}`, padding `10px 20px`, rounded `{rounded.lg}`.

**`button-upload`** — Prescription upload zone.
- Background `{colors.primary-50}`, text `{colors.primary-700}`, border `2px dashed {colors.primary-300}`, typography `{typography.button-md}`, padding `20px 32px`, rounded `{rounded.xl}`.

### Cards & Containers

**`card-base`** — Standard content card.
- Background `{colors.surface-card}`, rounded `{rounded.xl}`, padding `{spacing.xl}`, border `1px solid {colors.hairline-soft}`, shadow `0 1px 3px {colors.shadow-color}`.

**`card-elevated`** — Elevated content card.
- Background `{colors.surface-card}`, rounded `{rounded.xl}`, padding `{spacing.xl}`, border `1px solid {colors.hairline-soft}`, shadow `0 4px 20px {colors.shadow-color}`.

**`card-feature`** — White feature card with larger corners.
- Background `{colors.surface-card}`, rounded `{rounded.xxl}`, padding `{spacing.xxl}`, border `1px solid {colors.hairline-soft}`.

**`card-feature-primary`** — Primary-tinted feature card.
- Background `{colors.primary-50}`, text `{colors.primary-800}`, rounded `{rounded.xxl}`, padding `{spacing.xxl}`, border `1px solid {colors.primary-200}`.

**`card-feature-coral`** — Coral-tinted feature card.
- Background `{colors.accent-coral-light}`, text `{colors.accent-coral-deep}`, rounded `{rounded.xxl}`, padding `{spacing.xxl}`.

**`card-order-tracking`** — Live order tracking card.
- Background `{colors.surface-card}`, rounded `{rounded.xl}`, padding `{spacing.lg} {spacing.xl}`, border `1px solid {colors.hairline}`, shadow `0 2px 12px {colors.shadow-color}`.
- Contains: order ID (monospace), status badge, prescription item list, progress bar, delivery estimate.

**`card-stat`** — Stat counter cell.
- Background transparent, text `{colors.ink-deep}`, typography `{typography.stat-display}`, padding `{spacing.md}`.
- Label below in `{typography.body-sm}` `{colors.slate}`.

**`card-testimonial`** — Customer review card.
- Background `{colors.surface-card}`, rounded `{rounded.xxl}`, padding `{spacing.xxl}`, border `1px solid {colors.hairline-soft}`.
- Contains: quote text, avatar circle with Arabic initial, name in `{typography.heading-5}`, role badge.

**`card-prescription-item`** — Individual medicine line item.
- Background `{colors.surface}`, rounded `{rounded.lg}`, padding `{spacing.md} {spacing.lg}`, border `1px solid {colors.hairline-soft}`.
- Contains: medicine name, dosage, quantity badge, price.

### Inputs & Forms

**`text-input`** — Standard text field.
- Background `{colors.canvas}`, text `{colors.ink}`, border `1.5px solid {colors.hairline-strong}`, rounded `{rounded.lg}`, padding `{spacing.md} {spacing.lg}`, height 52px.
- Typography `{typography.body-md}`.

**`text-input-focused`** — Activated state.
- Border `2px solid {colors.primary}`, shadow `0 0 0 4px {colors.primary-100}`.

**`text-input-error`** — Validation error state.
- Background `{colors.error-light}`, text `{colors.error}`, border `1.5px solid {colors.error}`.

**`search-pill`** — Search bar.
- Background `{colors.surface}`, text `{colors.steel}`, typography `{typography.body-sm}`, rounded `{rounded.full}`, height 44px, border `1px solid {colors.hairline}`.

### Badges & Status

**`badge-status-pending`** — Order pending.
- Background `{colors.warning-light}`, text `{colors.warning}`, typography `{typography.caption-bold}`, rounded `{rounded.full}`, padding `6px 14px`.

**`badge-status-processing`** — Order being prepared.
- Background `{colors.primary-100}`, text `{colors.primary-700}`, typography `{typography.caption-bold}`, rounded `{rounded.full}`, padding `6px 14px`.

**`badge-status-delivering`** — Out for delivery.
- Background `{colors.accent-blue-light}`, text `{colors.accent-blue}`, typography `{typography.caption-bold}`, rounded `{rounded.full}`, padding `6px 14px`.

**`badge-status-delivered`** — Order completed.
- Background `{colors.success-light}`, text `{colors.success}`, typography `{typography.caption-bold}`, rounded `{rounded.full}`, padding `6px 14px`.

**`badge-tag-primary`** — Primary feature tag.
- Background `{colors.primary-100}`, text `{colors.primary-700}`, typography `{typography.caption-bold}`, rounded `{rounded.full}`, padding `4px 12px`.

**`badge-tag-coral`** — Coral feature tag.
- Background `{colors.accent-coral-light}`, text `{colors.accent-coral-deep}`, typography `{typography.caption-bold}`, rounded `{rounded.full}`, padding `4px 12px`.

**`badge-tag-rose`** — Rose feature tag.
- Background `{colors.accent-rose-light}`, text `{colors.accent-rose}`, typography `{typography.caption-bold}`, rounded `{rounded.full}`, padding `4px 12px`.

### Progress & Timeline

**`step-indicator`** — Active step number.
- Background `{colors.primary}`, text `{colors.on-primary}`, typography `{typography.heading-4}`, rounded `{rounded.full}`, size 48px.

**`step-indicator-inactive`** — Inactive step number.
- Background `{colors.hairline-soft}`, text `{colors.stone}`, typography `{typography.heading-4}`, rounded `{rounded.full}`, size 48px.

**`progress-track`** — Progress bar background.
- Background `{colors.hairline-soft}`, height 6px, rounded `{rounded.full}`.

**`progress-fill`** — Primary progress fill.
- Background `{colors.primary}`, height 6px, rounded `{rounded.full}`.

**`progress-fill-coral`** — Urgency progress fill.
- Background `{colors.accent-coral}`, height 6px, rounded `{rounded.full}`.

### Avatars

**`avatar-circle`** — Standard user avatar.
- Background `{colors.primary-100}`, text `{colors.primary-700}`, typography `{typography.heading-5}`, rounded `{rounded.full}`, size 48px.
- Displays single Arabic initial centered.

**`avatar-circle-large`** — Large testimonial avatar.
- Background `{colors.primary-100}`, text `{colors.primary-700}`, typography `{typography.heading-3}`, rounded `{rounded.full}`, size 64px.

### Navigation

**`nav-top`** — Sticky top navigation.
- Background `{colors.canvas}`, height 72px, bottom border `1px solid {colors.hairline-soft}`, shadow `0 1px 3px {colors.shadow-color}`.
- Left (logical end): Logo + brand name.
- Center: Horizontal link list (Product, Solutions, Resources) — hidden on mobile.
- Right (logical start): "Login" link + primary CTA button.

**`nav-link`** — Inactive navigation link.
- Background transparent, text `{colors.charcoal}`, typography `{typography.body-md-medium}`, padding `{spacing.sm} {spacing.md}`.

**`nav-link-active`** — Active navigation link.
- Background `{colors.primary-50}`, text `{colors.primary-700}`, rounded `{rounded.lg}`, padding `{spacing.sm} {spacing.md}`.

**`mobile-bottom-nav`** — Mobile app bottom bar.
- Background `{colors.canvas}`, height 64px, top border `1px solid {colors.hairline-soft}`, shadow `0 -2px 10px {colors.shadow-color}`.
- 4-5 icon tabs: Home, Orders, Upload, Profile.

**`mobile-nav-item`** — Inactive bottom tab.
- Background transparent, text `{colors.steel}`, typography `{typography.micro}`, padding `{spacing.xs} {spacing.sm}`.

**`mobile-nav-item-active`** — Active bottom tab.
- Text `{colors.primary}`.

### Signature Components

**`hero-band`** — Marketing hero section.
- Background `{colors.surface}`, padding `{spacing.hero} {spacing.section}`.
- Layout: centered headline in `{typography.hero-display}`, centered subtitle, centered CTA row, then illustration/mockup below.
- RTL: all text right-aligned, CTA row flex-start on desktop (logical start = right).

**`section-band`** — White content section.
- Background `{colors.canvas}`, padding `{spacing.section-lg} {spacing.section}`.

**`section-band-alt`** — Alternating gray content section.
- Background `{colors.surface}`, padding `{spacing.section-lg} {spacing.section}`.

**`cta-banner`** — Dark CTA banner at bottom of pages.
- Background `{colors.primary-800}`, text `{colors.on-dark}`, rounded `{rounded.xxl}`, padding `{spacing.section} {spacing.xxl}`.
- Centered headline + subtitle + primary button.

**`footer-region`** — Multi-column dark footer.
- Background `{colors.footer-bg}`, padding `{spacing.section-lg} {spacing.xxl}`.
- 4-column link grid (Product, Company, Support, Legal).
- Section headings in `{typography.body-md-medium}` `{colors.on-dark}`.

**`footer-link`** — Individual footer link.
- Background transparent, text `{colors.on-dark-muted}`, typography `{typography.body-sm}`, padding `{spacing.xxs} 0`.

**`icon-circle-primary`** — Primary icon container.
- Background `{colors.primary-100}`, text `{colors.primary-600}`, rounded `{rounded.full}`, size 56px.

**`icon-circle-coral`** — Coral icon container.
- Background `{colors.accent-coral-light}`, text `{colors.accent-coral}`, rounded `{rounded.full}`, size 56px.

**`icon-circle-rose`** — Rose icon container.
- Background `{colors.accent-rose-light}`, text `{colors.accent-rose}`, rounded `{rounded.full}`, size 56px.

**`icon-circle-blue`** — Blue icon container.
- Background `{colors.accent-blue-light}`, text `{colors.accent-blue}`, rounded `{rounded.full}`, size 56px.

**`prescription-preview`** — Uploaded prescription thumbnail.
- Background `{colors.surface}`, rounded `{rounded.lg}`, border `1px solid {colors.hairline}`, padding `{spacing.md}`.

**`order-timeline-item`** — Timeline event in order tracking.
- Background transparent, padding `{spacing.md} 0`.
- Left border (logical start in RTL): `2px solid {colors.hairline}` for inactive, `2px solid {colors.primary}` for active.

**`toast-success`** — Success notification.
- Background `{colors.success}`, text `{colors.on-primary}`, rounded `{rounded.lg}`, padding `{spacing.md} {spacing.lg}`, shadow `0 4px 12px rgba(34, 197, 94, 0.3)`.

**`toast-error`** — Error notification.
- Background `{colors.error}`, text `{colors.on-primary}`, rounded `{rounded.lg}`, padding `{spacing.md} {spacing.lg}`, shadow `0 4px 12px rgba(239, 68, 68, 0.3)`.

**`modal-overlay`** — Modal backdrop.
- Background `{colors.overlay}`.

**`modal-container`** — Modal content container.
- Background `{colors.surface-card}`, rounded `{rounded.xxl}`, padding `{spacing.xxl}`, shadow `0 20px 60px rgba(15, 23, 42, 0.2)`.

## Do's and Don'ts

### Do
- Use `{colors.primary}` (emerald) as the dominant CTA and active state color
- Reserve `{colors.accent-coral}` for urgent actions, delivery tracking, and promotional highlights
- Apply `{rounded.lg}` (12px) to all buttons — the rounded rectangle is the brand signature
- Use `{rounded.full}` only for status badges, avatars, and step indicators
- Maintain Cairo across every UI surface; use IBM Plex Mono only for order IDs
- Use logical properties (`margin-inline-start`, `padding-inline-end`) for all RTL spacing
- Keep number inputs and order IDs in LTR direction within RTL containers
- Alternate section backgrounds between `{colors.canvas}` and `{colors.surface}` for rhythm
- Use real prescription upload mockups and pharmacy imagery — no stock photos
- Apply generous line height (1.6) for all Arabic body text

### Don't
- Don't use `{colors.primary}` as a large background wash — reserve for buttons, borders, and small tints
- Don't use full-pill buttons — rounded rectangles (`{rounded.lg}`) are the button standard
- Don't introduce additional accent colors beyond emerald, coral, rose, and blue
- Don't use negative letter-spacing — Arabic scripts require natural spacing
- Don't left-align Arabic text unless it's a number or order ID
- Don't use shadows on flat documentation cards; reserve elevation for order tracking and feature cards
- Don't use stock photography — show real prescription forms, medicine packaging, and delivery scenes
- Don't reduce body line height below 1.5 for Arabic text

## Responsive Behavior

### Breakpoints
| Name | Width | Key Changes |
|---|---|---|
| Mobile (small) | < 480px | Single column. Hero scales to 32px. Bottom nav visible. |
| Mobile (large) | 480 – 767px | Feature tiles 2-up. Hero scales to 40px. |
| Tablet | 768 – 1023px | 2-column feature grids. Hero scales to 48px. Top nav hamburger. |
| Desktop | 1024 – 1279px | 3-column how-it-works. 2×2 feature grid. Hero at 56px. |
| Wide Desktop | ≥ 1280px | Full layout, 1200px container. |

### Touch Targets
- Primary buttons: 52px height (padding + content) — exceeds WCAG AAA
- Bottom nav items: 64px height bar, 44px tap area per item
- Form inputs: 52px height
- Upload zone: minimum 120px tall tap area
- Card buttons: full card tap area on mobile

### Collapsing Strategy
- **Top nav**: Below 1024px collapses to hamburger menu; below 768px shows only logo + hamburger
- **Hero band**: Single column on all breakpoints; CTA button full-width on mobile
- **How-it-works**: 3-column → 1-column stacked on mobile; step numbers stack above text
- **Feature grid**: 2×2 → 1-column on mobile
- **Stats row**: 4-column → 2×2 grid → 1-column on mobile
- **Testimonials**: 3-column → 1-column on mobile
- **Order tracking card**: Full-width on mobile; prescription items stack vertically
- **Footer**: 4-column → 2-column → 1-column accordion on mobile

### Image Behavior
- Prescription upload mockups maintain 4:3 ratio with `{rounded.xl}` corners
- Pharmacy/store imagery uses 16:9 ratio with `{rounded.xxl}` corners
- Avatar initials render as SVG circles, no image loading required
- Icons use 24×24px default, 20×20px in dense areas

## Iteration Guide

1. Focus on ONE component at a time
2. Reference component names and tokens directly
3. Add new variants as separate `components:` entries
4. Default to `{typography.body-md}` for body and `{typography.heading-3}` for card titles
5. Keep `{colors.primary}` confined to CTAs, active states, and small background tints
6. Rounded rectangles (`{rounded.lg}`) for buttons always; full pills only for badges
7. When showing the product, use real prescription forms and medicine packaging
8. Test all components in RTL layout with Arabic placeholder text
9. Ensure order IDs and prices always render LTR within RTL containers
10. Maintain 1.6 line height minimum for all Arabic text surfaces

## Known Gaps

- Specific dark-mode token values not surfaced
- Animation/transition timings not extracted; recommend 200ms ease for interactions, 300ms ease for page transitions
- Form validation success state not explicitly captured beyond toast component
- Voice search and camera upload interaction patterns not documented
- Pharmacy partner dashboard design tokens not included (patient-facing only)
- Specific Arabic numeral shaping (Eastern Arabic vs Western Arabic) not specified
