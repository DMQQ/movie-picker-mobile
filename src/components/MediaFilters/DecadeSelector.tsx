import { useCallback, useMemo } from "react";
import Chip from "../Chip";
import { ScrollView, StyleSheet, View } from "react-native";

import { colors, fontWeight, fontSize, radius, spacing } from "../../constants/design";
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
    gap: spacing.sm,
    paddingRight: spacing.lg,
  },
  chip: {
    backgroundColor: colors.input,
    borderRadius: radius.modal,
    borderWidth: 1,
    borderColor: "#333",
  },
  selectedChip: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipText: {
    color: "#999",
    fontSize: fontSize.md,
  },
  selectedChipText: {
    color: colors.text,
    fontWeight: fontWeight.semibold,
  },
});
