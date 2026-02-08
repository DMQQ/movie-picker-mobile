import { useCallback, useMemo } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { Chip, MD2DarkTheme } from "react-native-paper";
import useTranslation from "../../service/useTranslation";
import { DecadeFilter } from "../../redux/mediaFilters/mediaFiltersSlice";

interface DecadeSelectorProps {
  value: DecadeFilter;
  onChange: (value: DecadeFilter) => void;
}

const DECADES: DecadeFilter[] = ["all", "90s", "2000s", "2010s", "2020s"];

export default function DecadeSelector({ value, onChange }: DecadeSelectorProps) {
  const t = useTranslation();

  const labels = useMemo(
    () => ({
      all: t("filters.all"),
      "90s": t("filters.90s"),
      "2000s": t("filters.2000s"),
      "2010s": t("filters.2010s"),
      "2020s": t("filters.2020s"),
    }),
    [t]
  );

  return (
    <View style={styles.container}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {DECADES.map((decade) => (
          <Chip
            key={decade}
            selected={value === decade}
            onPress={() => onChange(decade)}
            style={[styles.chip, value === decade && styles.selectedChip]}
            textStyle={[styles.chipText, value === decade && styles.selectedChipText]}
            showSelectedCheck={false}
          >
            {labels[decade]}
          </Chip>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 0,
  },
  scrollContent: {
    gap: 8,
    paddingRight: 16,
  },
  chip: {
    backgroundColor: "#1a1a1a",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#333",
  },
  selectedChip: {
    backgroundColor: MD2DarkTheme.colors.primary,
    borderColor: MD2DarkTheme.colors.primary,
  },
  chipText: {
    color: "#999",
    fontSize: 14,
  },
  selectedChipText: {
    color: "#fff",
    fontWeight: "600",
  },
});
