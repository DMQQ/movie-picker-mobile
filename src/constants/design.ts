import { Dimensions } from "react-native";

const { width: screenWidth } = Dimensions.get("window");
const scale = screenWidth / 390;
const s = (v: number) => Math.round(v * scale);

// ── Spacing (4px base grid) ──────────────────────────────────────────────
// Values scale with screen width so an SE doesn't feel cramped and a Pro Max
// doesn't feel airy. Base reference: 390dp (iPhone 14/15).
// Most common screen paddingHorizontal: 15. Use 16 going forward;
// 15 is kept as a migration alias so existing screens don't shift.
export const spacing = {
  xs: s(4),
  sm: s(8),
  md: s(12),
  lg: s(16),
  xl: s(20),
  xxl: s(24),
  /** Legacy — migrate to lg (16). */
  screen: s(15),
};

// ── Border Radius ─────────────────────────────────────────────────────────
// Card consensus: 16 (GameCard, CinemaTicket, MarathonTicket, SelectionCard,
// SwipeableGenreCard, SkeletonCard all use it).
// Pill consensus: 100 (GenreChip, PrimaryButton, ScoreRing, Cast director).
export const radius = {
  xs: s(4),
  sm: s(8),
  md: s(12),
  /** Default card corner. */
  card: s(16),
  /** Modal / sheet corner. */
  modal: s(20),
  /** Large cards / tickets (24 — auth cards, game summary). */
  lg: s(24),
  /** Full pill / circle — clamped to 100 (unlimited rounding looks bad). */
  pill: 100,
};

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
// Exact MD2DarkTheme values, hardcoded so we can drop the paper dependency.
//
// Migrate with find-replace:
//   MD2DarkTheme.colors.primary     → colors.primary
//   MD2DarkTheme.colors.surface     → colors.surface
//   MD2DarkTheme.colors.background  → colors.background
//   …etc (every key matches 1:1)
export const colors = {
  // ── MD2DarkTheme (1:1) ──
  primary: "#BB86FC",
  accent: "#03dac6",
  error: "#CF6679",
  text: "#FFFFFF",
  onSurface: "#FFFFFF",
  placeholder: "rgba(255,255,255,0.54)",
  disabled: "rgba(255,255,255,0.38)",
  backdrop: "rgba(0,0,0,0.5)",
  notification: "#ff80ab",
  tooltip: "rgba(230,225,229,1)",
  surface: "#121212",
  background: "#121212",

  // ── App-specific (not in MD2) ──
  /** Pure black — app screens use #000, paper uses #121212. */
  appBackground: "#000",
  /** Slightly lighter surface for elevated cards (skeleton, hover). */
  surfaceElevated: "#2a2a2a",
  /** Secondary gray text — lighter than placeholder, common in the app. */
  textSecondary: "#999",
  /** Hairline border on dark surfaces (~10% white). */
  border: "rgba(255,255,255,0.1)",
  /** Subtle pressable overlay (~8% white). */
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
