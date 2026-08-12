import type { ComponentProps, ReactNode } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import Touch from "./Touch";
import {
  colors,
  fontSize,
  fontWeight,
  radius,
  spacing,
} from "../constants/design";

type Mode = "text" | "outlined" | "contained";
type IconProp =
  string | ((props: { color: string; size: number }) => ReactNode);

interface ButtonProps {
  mode?: Mode;
  onPress?: () => void;
  disabled?: boolean;
  loading?: boolean;
  icon?: IconProp;
  textColor?: string;
  buttonColor?: string;
  compact?: boolean;
  rippleColor?: string;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
  labelStyle?: StyleProp<TextStyle>;
  children?: ReactNode;
}

const DISABLED_BG = colors.border;
const DISABLED_TEXT = "rgba(255,255,255,0.32)";
const OUTLINED_BORDER = "rgba(255,255,255,0.29)";
const ICON_SIZE = 16;

function isLightColor(color: string) {
  if (color === "transparent") return false;
  const hex = color.replace("#", "");
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.5;
}

function toRippleColor(color: string) {
  if (!/^#[0-9a-fA-F]{6}$/.test(color)) return undefined;
  return color + "1F";
}

export default function Button({
  mode = "text",
  onPress,
  disabled,
  loading,
  icon,
  textColor,
  buttonColor,
  compact,
  rippleColor,
  style,
  contentStyle,
  labelStyle,
  children,
}: ButtonProps) {
  const backgroundColor =
    buttonColor && !disabled
      ? buttonColor
      : mode === "contained"
        ? disabled
          ? DISABLED_BG
          : colors.primary
        : "transparent";

  const resolvedTextColor =
    textColor && !disabled
      ? textColor
      : disabled
        ? DISABLED_TEXT
        : mode === "contained"
          ? isLightColor(backgroundColor)
            ? colors.appBackground
            : colors.text
          : colors.primary;

  const isReverse =
    StyleSheet.flatten(contentStyle)?.flexDirection === "row-reverse";
  const iconStyle = isReverse ? styles.iconReverse : styles.icon;

  const iconElement = loading ? (
    <ActivityIndicator
      size={ICON_SIZE}
      color={resolvedTextColor}
      style={[iconStyle, styles.loadingIcon]}
    />
  ) : typeof icon === "string" ? (
    <MaterialCommunityIcons
      name={icon as ComponentProps<typeof MaterialCommunityIcons>["name"]}
      size={ICON_SIZE}
      color={resolvedTextColor}
      style={iconStyle}
    />
  ) : typeof icon === "function" ? (
    <View style={iconStyle}>
      {icon({ color: resolvedTextColor, size: ICON_SIZE })}
    </View>
  ) : null;

  return (
    <Touch
      onPress={onPress}
      disabled={disabled}
      style={[
        styles.button,
        compact && styles.compact,
        {
          backgroundColor,
          borderColor: mode === "outlined" ? OUTLINED_BORDER : "transparent",
          borderWidth: mode === "outlined" ? StyleSheet.hairlineWidth : 0,
        },
        style,
      ]}
    >
      <View
        style={[
          styles.content,
          compact && styles.compactContent,
          icon !== null && {
            gap: spacing.md,
          },
          contentStyle,
        ]}
      >
        {iconElement}
        <Text
          numberOfLines={1}
          style={[styles.label, { color: resolvedTextColor }, labelStyle]}
        >
          {children}
        </Text>
      </View>
    </Touch>
  );
}

const styles = StyleSheet.create({
  button: {
    minWidth: 64,
    borderStyle: "solid",
    borderRadius: radius.modal,
    alignItems: "center",
    justifyContent: "center",
  },
  compact: {
    minWidth: "auto" as const,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 9,
    marginHorizontal: 16,
  },
  compactContent: {
    marginHorizontal: 8,
  },
  label: {
    textAlign: "center",
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  icon: {
    marginLeft: 4,
    marginRight: -4,
  },
  iconReverse: {
    marginRight: 12,
    marginLeft: -4,
  },
  loadingIcon: {
    marginRight: spacing.xs,
  },
});
