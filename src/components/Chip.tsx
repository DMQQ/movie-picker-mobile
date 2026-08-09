import type { ComponentProps, ReactNode } from "react";
import { StyleSheet, type StyleProp, type TextStyle, type ViewStyle } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import Touch from "./Touch";
import Text from "./Text";
import {
  colors,
  fontSize,
  fontWeight,
  spacing,
  withAlpha,
} from "../constants/design";

interface ChipProps {
  icon?: string;
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
      {icon ? (
        <MaterialCommunityIcons
          name={icon as ComponentProps<typeof MaterialCommunityIcons>["name"]}
          size={16}
          color={colors.placeholder}
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
  label: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
  },
});
