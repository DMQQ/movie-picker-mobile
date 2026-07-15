import { useCallback, useEffect, useRef } from "react";
import { Platform, ScrollView, StyleSheet, View } from "react-native";
import { Chip, MD2DarkTheme, Text } from "react-native-paper";
import PrimaryButton from "../components/PrimaryButton";
import { router, useLocalSearchParams } from "expo-router";
import { useAppDispatch, useAppSelector } from "../redux/store";
import {
  setDecade,
  setMediaType,
  setProviders,
  toggleGenre,
  DecadeFilter,
} from "../redux/mediaFilters/mediaFiltersSlice";
import {
  useGetAllProvidersQuery,
  useGetCategoriesQuery,
  useGetGenresWithThumbnailsQuery,
} from "../redux/movie/movieApi";
import useTranslation from "../service/useTranslation";
import TypeSelector from "../components/MediaFilters/TypeSelector";
import DecadeSelector from "../components/MediaFilters/DecadeSelector";
import ProviderList from "../components/Room/ProviderList";
import { useFilterPreferences } from "../hooks/useFilterPreferences";

function ProvidersSection() {
  const t = useTranslation();
  const dispatch = useAppDispatch();
  const selectedProviders = useAppSelector(
    (state) => state.mediaFilters.selectedProviders,
  );
  const { data: providers = [], isLoading } = useGetAllProvidersQuery({});
  const { savePreferences } = useFilterPreferences();
  const lastSavedRef = useRef<string>("");

  useEffect(() => {
    const key = selectedProviders.join(",");
    if (key !== lastSavedRef.current && selectedProviders.length > 0) {
      lastSavedRef.current = key;
      savePreferences({ providers: selectedProviders });
    } else if (key === "" && lastSavedRef.current !== "") {
      lastSavedRef.current = "";
      savePreferences({ providers: [] });
    }
  }, [selectedProviders, savePreferences]);

  const handleToggle = useCallback(
    (newProviders: number[]) => {
      dispatch(setProviders(newProviders));
    },
    [dispatch],
  );

  return (
    <View style={styles.section}>
      <Text variant="titleMedium" style={styles.sectionTitle}>
        {t("filters.providers")}
      </Text>
      <ProviderList
        providers={providers}
        selectedProviders={selectedProviders}
        onToggleProvider={handleToggle}
        isCategorySelected={true}
        vertical={false}
        isLoading={isLoading}
      />
    </View>
  );
}

function GenresSection() {
  const t = useTranslation();
  const dispatch = useAppDispatch();
  const mediaType = useAppSelector((state) => state.mediaFilters.mediaType);
  const selectedGenres = useAppSelector(
    (state) => state.mediaFilters.selectedGenres,
  );

  const genreType = mediaType === "both" ? "movie" : mediaType;
  const { data: genres = [], isLoading } = useGetGenresWithThumbnailsQuery({
    type: genreType,
  });

  const handleToggle = useCallback(
    (genre: { id: number; name: string }) => {
      dispatch(toggleGenre(genre));
    },
    [dispatch],
  );

  return (
    <View style={styles.section}>
      <Text variant="titleMedium" style={styles.sectionTitle}>
        {t("filters.genres")}
      </Text>
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>{t("room.builder.loading")}</Text>
        </View>
      ) : (
        <View style={styles.chipsContainer}>
          {genres.map((genre) => {
            const isSelected = selectedGenres.some((g) => g.id === genre.id);
            return (
              <Chip
                key={genre.id}
                selected={isSelected}
                onPress={() => handleToggle({ id: genre.id, name: genre.name })}
                style={[styles.chip, isSelected && styles.chipSelected]}
                textStyle={[
                  styles.chipText,
                  isSelected && styles.chipTextSelected,
                ]}
                showSelectedCheck={false}
              >
                {genre.name}
              </Chip>
            );
          })}
        </View>
      )}
    </View>
  );
}

function CategoriesSection({ onSelect }: { onSelect: (name: string) => void }) {
  const t = useTranslation();
  const { data: categoriesData, isLoading } = useGetCategoriesQuery({});
  const categories = categoriesData ?? [];
  const validCategories = categories.filter(
    (c) => c.results && c.results.length > 0,
  );

  return (
    <View style={styles.section}>
      <Text variant="titleMedium" style={styles.sectionTitle}>
        {t("filters.categories")}
      </Text>
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>{t("room.builder.loading")}</Text>
        </View>
      ) : (
        <View style={styles.chipsContainer}>
          {validCategories.map((category) => (
            <Chip
              key={category.name}
              onPress={() => onSelect(category.name)}
              style={styles.chip}
              textStyle={styles.chipText}
            >
              {category.name}
            </Chip>
          ))}
        </View>
      )}
    </View>
  );
}

export default function FiltersScreen() {
  const t = useTranslation();
  const dispatch = useAppDispatch();
  const { showCategories } = useLocalSearchParams<{ showCategories: string }>();

  const mediaType = useAppSelector((state) => state.mediaFilters.mediaType);
  const selectedDecade = useAppSelector(
    (state) => state.mediaFilters.selectedDecade,
  );
  const providersCount = useAppSelector(
    (state) => state.mediaFilters.selectedProviders.length,
  );
  const genresCount = useAppSelector(
    (state) => state.mediaFilters.selectedGenres.length,
  );

  const activeFilterCount =
    (mediaType !== "both" ? 1 : 0) +
    (providersCount > 0 ? 1 : 0) +
    (genresCount > 0 ? 1 : 0) +
    (selectedDecade !== "all" ? 1 : 0);

  const handleMediaTypeChange = useCallback(
    (type: "movie" | "tv" | "both") => dispatch(setMediaType(type)),
    [dispatch],
  );

  const handleDecadeChange = useCallback(
    (decade: DecadeFilter) => dispatch(setDecade(decade)),
    [dispatch],
  );

  const handleApply = useCallback(() => {
    router.back();
  }, []);

  const handleCategorySelect = useCallback((name: string) => {
    router.back();
    setTimeout(() => {
      router.setParams({ selectedCategory: name });
    }, 100);
  }, []);

  return (
    <View style={styles.container} collapsable={false}>
      {Platform.OS === "android" && <View style={styles.grabber} />}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        collapsable={false}
      >
        <View style={styles.section}>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            {t("filters.type")}
          </Text>
          <TypeSelector value={mediaType} onChange={handleMediaTypeChange} />
        </View>

        <View style={styles.section}>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            {t("filters.decade")}
          </Text>
          <DecadeSelector
            value={selectedDecade}
            onChange={handleDecadeChange}
          />
        </View>

        <ProvidersSection />
        <GenresSection />

        {showCategories === "true" && (
          <CategoriesSection onSelect={handleCategorySelect} />
        )}
      </ScrollView>

      <View style={styles.footer} collapsable={false}>
        <PrimaryButton onPress={handleApply} style={styles.applyButton}>
          {t("filters.apply")}
          {activeFilterCount > 0 && ` (${activeFilterCount})`}
        </PrimaryButton>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: MD2DarkTheme.colors.surface,
    ...Platform.select({
      ios: { paddingTop: 25 },
    }),
  },
  grabber: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#555",
    alignSelf: "center",
    marginTop: 12,
    marginBottom: 4,
  },
  scroll: {
    flex: 1,
    paddingHorizontal: 20,
  },
  scrollContent: {
    paddingTop: 8,
    paddingBottom: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    color: "#fff",
    fontFamily: "Bebas",
    fontSize: 22,
    marginBottom: 8,
  },
  chipsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    backgroundColor: "#1a1a1a",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#333",
  },
  chipSelected: {
    backgroundColor: MD2DarkTheme.colors.primary,
    borderColor: MD2DarkTheme.colors.primary,
  },
  chipText: {
    color: "#999",
    fontSize: 13,
  },
  chipTextSelected: {
    color: "#fff",
    fontWeight: "600",
  },
  loadingContainer: {
    height: 80,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: "#666",
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: Platform.OS === "android" ? 24 : 20,
    borderTopWidth: 1,
    borderTopColor: "#333",
    backgroundColor: MD2DarkTheme.colors.surface,
  },
  applyButton: {
    borderRadius: 24,
  },
  applyButtonLabel: {
    fontSize: 15,
    fontWeight: "600",
  },
});
