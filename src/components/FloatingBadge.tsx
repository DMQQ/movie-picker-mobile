import type { ReactNode } from "react";
import { StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
import Text from "./Text";
import { colors,  fontWeight, radius, spacing } from "../constants/design";

export interface FloatingBadgeProps {
  children: ReactNode;
  label?: string;
  color?: string;
  textColor?: string;
  icon?: ReactNode;
  visible?: boolean;
  style?: StyleProp<ViewStyle>;
  onPressCapture?: () => void;
}

export default function FloatingBadge({
  children,
  label = "NEW",
  color = colors.primary,
  textColor = "#fff",
  icon,
  visible = true,
  style,
  onPressCapture,
}: FloatingBadgeProps) {
  return (
    <View
      style={styles.container}
      onStartShouldSetResponderCapture={() => {
        onPressCapture?.();
        return false;
      }}
    >
      {children}
      {visible && (
        <View style={styles.badgeRow} pointerEvents="none">
          <View style={[styles.badge, { backgroundColor: color }, style]}>
            {icon && <View style={styles.icon}>{icon}</View>}
            {label ? (
              <Text numberOfLines={1} style={[styles.label, { color: textColor }]}>{label}</Text>
            ) : null}
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
  },
  badgeRow: {
    position: "absolute",
    top: -5,
    left: 0,
    right: 0,
    alignItems: "center",
    zIndex: 1,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: radius.pill,
    paddingHorizontal: spacing.xs,
    paddingVertical: 1,
    gap: 2,
  },
  icon: {
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    fontSize: 7.5,
    fontWeight: fontWeight.bold,
    letterSpacing: 0.5,
  },
});
