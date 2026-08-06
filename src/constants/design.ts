// ── Spacing (4px base grid) ──────────────────────────────────────────────
// Most common screen paddingHorizontal: 15. Use 16 going forward;
// 15 is kept as a migration alias so existing screens don't shift.
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  /** Legacy — migrate to lg (16). */
  screen: 15,
} as const;

// ── Border Radius ─────────────────────────────────────────────────────────
// Card consensus: 16 (GameCard, CinemaTicket, MarathonTicket, SelectionCard,
// SwipeableGenreCard, SkeletonCard all use it).
// Pill consensus: 100 (GenreChip, PrimaryButton, ScoreRing, Cast director).
export const radius = {
  xs: 4,
  sm: 8,
  md: 12,
  /** Default card corner. */
  card: 16,
  /** Modal / sheet corner. */
  modal: 20,
  /** Full pill / circle. */
  pill: 100,
} as const;

// ── Font Sizes ────────────────────────────────────────────────────────────
export const fontSize = {
  xs: 10,
  sm: 12,
  md: 14,
  lg: 16,
  xl: 18,
  xxl: 20,
  title: 24,
  display: 32,
} as const;

// ── Font Weights ──────────────────────────────────────────────────────────
// Prefer numeric; avoid "bold" string (same visual as "700").
export const fontWeight = {
  normal: "400" as const,
  medium: "500" as const,
  semibold: "600" as const,
  bold: "700" as const,
};

// ── Colors ────────────────────────────────────────────────────────────────
// All values hardcoded — no dependency on react-native-paper.
//
// Migrate with find-replace:
//   MD2DarkTheme.colors.primary     → colors.primary
//   MD2DarkTheme.colors.accent      → colors.accent
//   MD2DarkTheme.colors.error       → colors.error
//   MD2DarkTheme.colors.text        → colors.text
//   MD2DarkTheme.colors.onSurface   → colors.onSurface
//   MD2DarkTheme.colors.placeholder → colors.placeholder
//   MD2DarkTheme.colors.disabled    → colors.disabled
//   MD2DarkTheme.colors.backdrop    → colors.backdrop
//   MD2DarkTheme.colors.notification→ colors.notification
//   MD2DarkTheme.colors.tooltip     → colors.tooltip
//   MD2DarkTheme.colors.surface     → colors.paperSurface  (or colors.surface)
//   theme.colors.primary            → colors.primary  (same values)
//
// App surface (#1a1a1a) is lighter than paper surface (#121212).
// When migrating a paper component, use colors.paperSurface to preserve
// the existing look; when building new UI, prefer colors.surface.
export const colors = {
  // ── From MD2DarkTheme — exact values for drop-in replacement ──

  /** Primary brand color (purple). Buttons, selected states, accent elements. */
  primary: "#BB86FC",
  /** Secondary accent (teal). Rarely used — mostly paper FAB. */
  accent: "#03dac6",
  /** Error / destructive action color (pink-red). */
  error: "#CF6679",
  /** Primary text on dark backgrounds. */
  text: "#FFFFFF",
  /** Text/icons painted on surface color. Same as text on dark theme. */
  onSurface: "#FFFFFF",
  /** Muted / placeholder text. ~54% white. */
  placeholder: "rgba(255,255,255,0.54)",
  /** Disabled element text/icons. ~38% white. */
  disabled: "rgba(255,255,255,0.38)",
  /** Scrim / modal backdrop. 50% black. */
  backdrop: "rgba(0,0,0,0.5)",
  /** Badge / notification dot (pink A100). */
  notification: "#ff80ab",
  /** Tooltip background. */
  tooltip: "rgba(230,225,229,1)",

  // ── App-specific (override paper defaults) ──

  /** App background — pure black, intentionally darker than paper's #121212. */
  background: "#000",
  /** Card / elevated surface. Lighter than paper's #121212 for visual layering. */
  surface: "#1a1a1a",
  /** Slightly lighter surface variant (skeleton placeholder, hover states). */
  surfaceElevated: "#2a2a2a",
  /** Paper's surface (#121212). Use when migrating paper components that need
   *  the original darker value; prefer colors.surface for new UI. */
  paperSurface: "#121212",
  /** Paper's background (#121212). Same as paperSurface on dark theme. */
  paperBackground: "#121212",
  /** Secondary gray text — app convention, lighter than placeholder. */
  textSecondary: "#999",
  /** Standard hairline border on dark surfaces (~10% white). */
  border: "rgba(255,255,255,0.1)",
  /** Subtle transparent pressable overlay (~8% white). */
  overlay: "rgba(255,255,255,0.08)",
} as const;

// ── Typography ────────────────────────────────────────────────────────────
export const typography = {
  /** Bebas display font — section titles, auth headings, empty states. */
  bebas: "Bebas" as const,
  /** Canonical Bebas sizes. Use these instead of ad-hoc values. */
  bebasSize: {
    section: 35,
    auth: 38,
    empty: 45,
  } as const,
  /** Consistent letter spacing for all Bebas display text. */
  bebasLetterSpacing: 1,
} as const;

// ── Common Style Shortcuts ────────────────────────────────────────────────
// Reusable partial styles to spread in StyleSheet.create blocks.
export const common = {
  /** Full-width pill button (height 50, radius pill). */
  pillButton: {
    borderRadius: radius.pill,
    height: 50,
  } as const,
  /** Standard chip/tag pill (radius pill, h-padding 10, v-padding 4). */
  chip: {
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm + 2, // 10 — matches GenreChip
    paddingVertical: spacing.xs, // 4
  } as const,
  /** Standard dark card (radius 16, bg #1a1a1a, overflow hidden). */
  card: {
    borderRadius: radius.card,
    backgroundColor: colors.surface,
    overflow: "hidden" as const,
  } as const,
  /** Screen-level content horizontal padding. */
  screenPadding: {
    paddingHorizontal: spacing.screen,
  } as const,
} as const;
