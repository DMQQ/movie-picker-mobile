import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { colors, common, fontSize, fontWeight, radius, spacing, withAlpha } from "../constants/design";

interface GenreChipProps {
  genre: string;
  selected?: boolean;
  onPress?: () => void;
  light?: boolean;
}

export default function GenreChip({ genre, selected, onPress, light }: GenreChipProps) {
  const isInteractive = !!onPress;
  const removable = isInteractive && selected;

  const chipStyle = [
    styles.chip,
    light && styles.chipLight,
    isInteractive && selected && styles.chipSelected,
    removable && styles.chipRemovable,
  ];

  const textStyle = [
    styles.text,
    light && styles.textLight,
    isInteractive && selected && styles.textSelected,
  ];

  if (isInteractive) {
    return (
      <TouchableOpacity onPress={onPress} style={chipStyle} activeOpacity={0.7}>
        <Text style={textStyle}>{genre}</Text>
        {removable && (
          <MaterialCommunityIcons
            name="close"
            size={12}
            color={colors.text}
            style={styles.removeIcon}
          />
        )}
      </TouchableOpacity>
    );
  }

  return (
    <View style={chipStyle}>
      <Text style={textStyle}>{genre}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    ...common.chip,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.15)",
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipLight: {
    backgroundColor: "rgba(0,0,0,0.12)",
    borderColor: "rgba(0,0,0,0.08)",
  },
  chipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipRemovable: {
    paddingRight: spacing.xs,
  },
  removeIcon: {
    marginLeft: spacing.xs,
    backgroundColor: withAlpha(colors.text, 0.2),
    borderRadius: radius.pill,
    padding: 2,
  },
  text: {
    color: colors.text,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
  },
  textLight: {
    color: "rgba(0,0,0,0.75)",
  },
  textSelected: {
    color: colors.text,
  },
});
