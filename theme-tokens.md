```yaml
colors:
  primary: "#0f9d76"
  on-primary: "#ffffff"
  ink: "#1a2b28"
  body: "#5e5e5e"
  mute: "#6b7a76"
  hairline-mid: "#e2e8e6"
  canvas: "#ffffff"
  canvas-soft: "#f6f8f7"
  canvas-softer: "#eef2f1"
  surface-pressed: "#e2e2e2"
  warning: "#f59e0b"
  warning-soft: "rgba(245, 158, 11, 0.15)"
  warning-on: "#7c4a03"
  info: "#2563eb"
  info-soft: "rgba(37, 99, 235, 0.15)"
  accent-success: "#0f9d76"
  accent-soft: "rgba(15, 157, 118, 0.15)"
  destructive: "#dc2626"
  destructive-soft: "rgba(220, 38, 38, 0.15)"
  footer: rgb(33 39 48);
  header: rgb(253 255 255);
  green-hover: rgb(0 148 139);

typography:
  display-xxl:
    fontFamily: Cairo, Tajawal, system-ui, sans-serif
    fontSize: 2.25rem
    fontWeight: 700
    lineHeight: 2.75rem
  display-lg:
    fontFamily: Cairo, Tajawal, system-ui, sans-serif
    fontSize: 2rem
    fontWeight: 700
    lineHeight: 2.5rem
  display-md:
    fontFamily: Cairo, Tajawal, system-ui, sans-serif
    fontSize: 1.5rem
    fontWeight: 700
    lineHeight: 2rem
  display-sm:
    fontFamily: Cairo, Tajawal, system-ui, sans-serif
    fontSize: 1.25rem
    fontWeight: 700
    lineHeight: 1.75rem
  body-lg:
    fontFamily: Cairo, Tajawal, system-ui, sans-serif
    fontSize: 1.0625rem
    fontWeight: 500
    lineHeight: 1.5rem
  body-md:
    fontFamily: Cairo, Tajawal, system-ui, sans-serif
    fontSize: 0.9375rem
    fontWeight: 400
    lineHeight: 1.375rem
  body-md-strong:
    fontFamily: Cairo, Tajawal, system-ui, sans-serif
    fontSize: 0.9375rem
    fontWeight: 600
    lineHeight: 1.375rem
  body-sm:
    fontFamily: Cairo, Tajawal, system-ui, sans-serif
    fontSize: 0.8125rem
    fontWeight: 400
    lineHeight: 1.125rem
  body-sm-strong:
    fontFamily: Cairo, Tajawal, system-ui, sans-serif
    fontSize: 0.8125rem
    fontWeight: 600
    lineHeight: 1.125rem
  caption:
    fontFamily: Cairo, Tajawal, system-ui, sans-serif
    fontSize: 0.71875rem
    fontWeight: 500
    lineHeight: 1rem
  button:
    fontFamily: Cairo, Tajawal, system-ui, sans-serif
    fontSize: 0.9375rem
    fontWeight: 600
    lineHeight: 1.25rem

rounded:
  none: 0px
  sm: 0.25rem
  md: 0.5rem
  lg: 0.75rem
  xl: 1rem
  pill: 999px
  full: 9999px

spacing:
  xxs: 0.25rem
  xs: 0.375rem
  sm: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.25rem
  2xl: 1.5rem
  3xl: 2rem

components:
  nav-bar:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    borderColor: "{colors.hairline-mid}"
    typography: "{typography.display-sm}"
    padding: "{spacing.md} {spacing.2xl}"
  sidebar-link:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    typography: "{typography.body-md-strong}"
    rounded: "{rounded.lg}"
    padding: "{spacing.sm} {spacing.md}"
  sidebar-link-active:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    typography: "{typography.body-md-strong}"
    rounded: "{rounded.lg}"
    padding: "{spacing.sm} {spacing.md}"
  metric-card:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    borderColor: "{colors.hairline-mid}"
    labelColor: "{colors.mute}"
    labelTypography: "{typography.body-md}"
    valueTypography: "{typography.display-xxl}"
    rounded: "{rounded.xl}"
    padding: "{spacing.2xl}"
  low-stock-alert:
    backgroundColor: "{colors.warning-soft}"
    textColor: "{colors.warning-on}"
    borderColor: "{colors.warning}"
    typography: "{typography.body-md-strong}"
    rounded: "{rounded.xl}"
    padding: "{spacing.lg}"
  recent-orders-table:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    borderColor: "{colors.hairline-mid}"
    headerBackgroundColor: "{colors.canvas-softer}"
    headerTextColor: "{colors.mute}"
    headerTypography: "{typography.body-sm-strong}"
    cellTypography: "{typography.body-sm}"
    rounded: "{rounded.xl}"
    padding: "{spacing.md} {spacing.lg}"
  status-badge-delivered:
    backgroundColor: "{colors.accent-soft}"
    textColor: "{colors.accent-success}"
    typography: "{typography.caption}"
    rounded: "{rounded.pill}"
    padding: "{spacing.xxs} {spacing.md}"
  status-badge-in-delivery:
    backgroundColor: "{colors.info-soft}"
    textColor: "{colors.info}"
    typography: "{typography.caption}"
    rounded: "{rounded.pill}"
    padding: "{spacing.xxs} {spacing.md}"
  status-badge-cancelled:
    backgroundColor: "{colors.destructive-soft}"
    textColor: "{colors.destructive}"
    typography: "{typography.caption}"
    rounded: "{rounded.pill}"
    padding: "{spacing.xxs} {spacing.md}"
  branch-dropdown:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    borderColor: "{colors.hairline-mid}"
    labelColor: "{colors.mute}"
    typography: "{typography.body-md}"
    focusRingColor: "{colors.primary}"
    rounded: "{rounded.md}"
    padding: "{spacing.sm} {spacing.md}"
```
