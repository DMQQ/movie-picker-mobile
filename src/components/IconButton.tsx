import type { ComponentProps, ReactNode } from "react";
import { StyleSheet, type StyleProp, type ViewStyle } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import Touch from "./Touch";
import { colors } from "../constants/design";

interface IconButtonProps {
  icon: string | ((props: { color: string; size: number }) => ReactNode);
  size?: number;
  iconColor?: string;
  /** paper Appbar.Action passes `color` instead of `iconColor` */
  color?: string;
  onPress?: () => void;
  disabled?: boolean;
  /** paper compat — callers style their own background */
  mode?: string;
  style?: StyleProp<ViewStyle>;
}

export default function IconButton({
  icon,
  size = 24,
  iconColor,
  color,
  onPress,
  disabled,
  style,
}: IconButtonProps) {
  const resolvedColor = disabled ? colors.placeholder : (iconColor ?? color ?? colors.text);
  return (
    <Touch
      onPress={onPress}
      disabled={disabled}
      style={[styles.container, style]}
      hitSlop={8}
    >
      {typeof icon === "function" ? (
        icon({ color: resolvedColor, size })
      ) : (
        <MaterialCommunityIcons
          name={icon as ComponentProps<typeof MaterialCommunityIcons>["name"]}
          size={size}
          color={resolvedColor}
        />
      )}
    </Touch>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
});
