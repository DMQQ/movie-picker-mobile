import { useCallback, useMemo } from "react";
import { StyleSheet, View } from "react-native";
import { MD2DarkTheme, SegmentedButtons } from "react-native-paper";
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
    borderRadius: 10,
    overflow: "hidden",
  },
  segmentedButtons: {
    backgroundColor: "#1a1a1a",
  },
  button: {
    backgroundColor: "#1a1a1a",
    borderColor: "#333",
  },
  selectedButton: {
    backgroundColor: MD2DarkTheme.colors.primary,
    borderColor: MD2DarkTheme.colors.primary,
  },
  label: {
    color: "#999",
    fontSize: 14,
  },
  selectedLabel: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
});
