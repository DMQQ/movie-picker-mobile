import type { ReactNode } from "react";
import { StyleSheet, type StyleProp, type ViewStyle } from "react-native";
import Touch from "./Touch";
import { colors, radius } from "../constants/design";

interface CardProps {
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  disabled?: boolean;
  children?: ReactNode;
}

export default function Card({ onPress, style, disabled, children }: CardProps) {
  return (
    <Touch
      onPress={onPress}
      disabled={disabled || !onPress}
      style={[styles.card, style]}
    >
      {children}
    </Touch>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.card,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    overflow: "hidden",
  },
});
