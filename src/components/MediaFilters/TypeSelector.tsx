import { useCallback, useMemo } from "react";
import SegmentedButtons from "../SegmentedButtons";
import { StyleSheet, View } from "react-native";

import { colors, fontWeight, fontSize, radius } from "../../constants/design";
import useTranslation from "../../service/useTranslation";

type MediaType = "movie" | "tv" | "both";

interface TypeSelectorProps {
  value: MediaType;
  onChange: (value: MediaType) => void;
}

export default function TypeSelector({ value, onChange }: TypeSelectorProps) {
  const t = useTranslation();

  const handleValueChange = useCallback((val: string) => onChange(val as MediaType), [onChange]);

  const buttons = useMemo(
    () => [
      {
        value: "both",
        label: t("filters.both"),
        style: value === "both" ? styles.selectedButton : styles.button,
        labelStyle: value === "both" ? styles.selectedLabel : styles.label,
      },
      {
        value: "movie",
        label: t("filters.movie"),
        style: value === "movie" ? styles.selectedButton : styles.button,
        labelStyle: value === "movie" ? styles.selectedLabel : styles.label,
      },
      {
        value: "tv",
        label: t("filters.tv"),
        style: value === "tv" ? styles.selectedButton : styles.button,
        labelStyle: value === "tv" ? styles.selectedLabel : styles.label,
      },
    ],
    [value, t],
  );

  return (
    <View style={styles.container}>
      <SegmentedButtons value={value} onValueChange={handleValueChange} buttons={buttons} style={styles.segmentedButtons} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 0,
    borderRadius: radius.sm + 2,
    overflow: "hidden",
  },
  segmentedButtons: {
    backgroundColor: colors.input,
  },
  button: {
    backgroundColor: colors.input,
    borderColor: "#333",
  },
  selectedButton: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  label: {
    color: "#999",
    fontSize: fontSize.md,
  },
  selectedLabel: {
    color: colors.text,
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
  },
});
