import type { ComponentProps, ReactNode } from "react";
import { StyleSheet, type StyleProp, type TextStyle, type ViewStyle } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Image } from "expo-image";
import Touch from "./Touch";
import Text from "./Text";
import {
  colors,
  fontSize,
  fontWeight,
  radius,
  spacing,
  withAlpha,
} from "../constants/design";

interface ChipProps {
  icon?: string;
  iconColor?: string;
  image?: { uri: string };
  onPress?: () => void;
  disabled?: boolean;
  selected?: boolean;
  showSelectedCheck?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  children?: ReactNode;
}

export default function Chip({
  icon,
  iconColor,
  image,
  onPress,
  disabled,
  selected,
  showSelectedCheck = true,
  style,
  textStyle,
  children,
}: ChipProps) {
  return (
    <Touch
      onPress={onPress}
      disabled={disabled || !onPress}
      style={[styles.chip, selected && styles.chipSelected, style]}
    >
      {image ? (
        <Image source={image} style={styles.image} contentFit="contain" />
      ) : icon ? (
        <MaterialCommunityIcons
          name={icon as ComponentProps<typeof MaterialCommunityIcons>["name"]}
          size={16}
          color={iconColor ?? colors.placeholder}
        />
      ) : null}
      {selected && showSelectedCheck && (
        <MaterialCommunityIcons name="check" size={16} color={colors.primary} />
      )}
      <Text style={[styles.label, textStyle]}>{children}</Text>
    </Touch>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    height: 32,
    paddingHorizontal: spacing.md,
    borderRadius: 100,
    backgroundColor: colors.overlay,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  chipSelected: {
    backgroundColor: withAlpha(colors.primary, 0.15),
    borderColor: colors.primary,
  },
  image: {
    width: 24,
    height: 16,
    borderRadius: radius.sm,
  },
  label: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
  },
});
