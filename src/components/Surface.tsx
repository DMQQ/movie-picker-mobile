import type { ReactNode } from "react";
import { StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
import { colors, radius } from "../constants/design";

interface SurfaceProps {
  style?: StyleProp<ViewStyle>;
  /** paper compat — surfaces are flat here, elevation is ignored */
  elevation?: number;
  children?: ReactNode;
}

export default function Surface({ style, elevation, children }: SurfaceProps) {
  return <View style={[styles.surface, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  surface: {
    backgroundColor: colors.surface,
    borderRadius: radius.card,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    overflow: "hidden",
  },
});
