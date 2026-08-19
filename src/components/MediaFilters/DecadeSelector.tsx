import { useMemo } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { spacing } from "../../constants/design";
import useTranslation from "../../service/useTranslation";
import { DecadeFilter } from "../../redux/mediaFilters/mediaFiltersSlice";
import GenreChip from "../GenreChip";

interface DecadeSelectorProps {
  value: DecadeFilter;
  onChange: (value: DecadeFilter) => void;
}

const DECADES: DecadeFilter[] = ["all", "90s", "2000s", "2010s", "2020s"];

export default function DecadeSelector({ value, onChange }: DecadeSelectorProps) {
  const t = useTranslation();

  const labels = useMemo(
    () => ({
      all: t("filters.all") as string,
      "90s": t("filters.90s") as string,
      "2000s": t("filters.2000s") as string,
      "2010s": t("filters.2010s") as string,
      "2020s": t("filters.2020s") as string,
    }),
    [t],
  );

  return (
    <View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {DECADES.map((decade) => (
          <GenreChip
            key={decade}
            genre={labels[decade]}
            selected={value === decade}
            onPress={() => onChange(value === decade ? "all" : decade)}
          />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    gap: spacing.sm,
    paddingRight: spacing.lg,
  },
});
