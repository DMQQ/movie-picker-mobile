import { colors } from "../constants/design";

export interface ThemeColors {
  primary: string;
  surface: string;
  onSurface: string;
  error: string;
  accent: string;
  background: string;
  text: string;
  placeholder: string;
  border: string;
  outline: string;
}

export type Theme = {
  colors: ThemeColors;
  dark: boolean;
  roundness: number;
};

const themeColors: ThemeColors = {
  primary: colors.primary,
  surface: colors.surface,
  onSurface: colors.text,
  error: colors.error,
  accent: "#03dac6",
  background: colors.appBackground,
  text: colors.text,
  placeholder: colors.placeholder,
  border: colors.border,
  outline: "rgba(255,255,255,0.29)",
};

const theme: Theme = {
  colors: themeColors,
  dark: true,
  roundness: 8,
};

export function useTheme() {
  return theme;
}
