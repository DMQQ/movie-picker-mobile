import type { ComponentProps, ReactNode } from "react";
import { StyleSheet, View, type StyleProp, type TextStyle, type ViewStyle } from "react-native";
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
  contained?: boolean;
  showSelectedCheck?: boolean;
  removable?: boolean;
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
  contained = false,
  showSelectedCheck = true,
  removable = false,
  style,
  textStyle,
  children,
}: ChipProps) {
  return (
    <Touch
      onPress={onPress}
      disabled={disabled || !onPress}
      style={[
        styles.chip,
        selected && styles.chipSelected,
        contained && styles.chipContained,
        removable && styles.chipRemovable,
        style,
      ]}
    >
      <View style={styles.content}>
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
      </View>
      {removable && (
        <MaterialCommunityIcons
          name="close"
          size={12}
          color={iconColor ?? colors.text}
          style={styles.removeIcon}
        />
      )}
    </Touch>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
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
  chipContained: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipRemovable: {
    paddingRight: spacing.sm,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  image: {
    width: 24,
    height: 16,
    borderRadius: radius.sm,
  },
  removeIcon: {
    backgroundColor: withAlpha(colors.text, 0.2),
    borderRadius: radius.pill,
    padding: 2,
  },
  label: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
  },
});
