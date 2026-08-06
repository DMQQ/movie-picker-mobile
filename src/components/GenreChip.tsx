import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { colors, common, fontSize, fontWeight } from "../constants/design";

interface GenreChipProps {
  genre: string;
  selected?: boolean;
  onPress?: () => void;
  light?: boolean;
}

export default function GenreChip({ genre, selected, onPress, light }: GenreChipProps) {
  const isInteractive = !!onPress;

  const chipStyle = [
    styles.chip,
    light && styles.chipLight,
    isInteractive && selected && styles.chipSelected,
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
