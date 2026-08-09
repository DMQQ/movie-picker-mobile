import type { ReactNode } from "react";
import {
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewProps,
  type ViewStyle,
} from "react-native";
import { colors, fontSize, fontWeight } from "../constants/design";

interface BadgeProps {
  size?: number;
  visible?: boolean;
  style?: StyleProp<ViewStyle>;
  pointerEvents?: ViewProps["pointerEvents"];
  children?: ReactNode;
}

export default function Badge({ size = 20, visible = true, style, pointerEvents, children }: BadgeProps) {
  if (!visible) return null;
  return (
    <View pointerEvents={pointerEvents} style={[styles.badge, { minWidth: size, height: size, borderRadius: size / 2 }, style]}>
      <Text style={[styles.label, { fontSize: Math.max(10, size * 0.55) }]}>{children}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 5,
    backgroundColor: colors.primary,
  },
  label: {
    color: colors.appBackground,
    fontWeight: fontWeight.bold,
  },
});
