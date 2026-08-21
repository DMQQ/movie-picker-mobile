import { useCallback, useEffect, useRef } from "react";
import Text from "../components/Text";
import SignUpNudgeBanner from "../components/SignUpNudgeBanner";
import { Platform, ScrollView, StyleSheet, View } from "react-native";
import FormSheetContainer from "../components/FormSheetContainer";
import {
  colors,
  fontWeight,
  fontSize,
  radius,
  spacing,
} from "../constants/design";
import GenreChip from "../components/GenreChip";
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
import { posthog } from "../constants/posthog";

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
              <GenreChip
                key={genre.id}
                genre={genre.name}
                selected={isSelected}
                onPress={() => handleToggle({ id: genre.id, name: genre.name })}
              />
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
            <GenreChip
              key={category.name}
              genre={category.name}
              onPress={() => onSelect(category.name)}
            />
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
    posthog?.capture("filters_applied", {
      media_type: mediaType,
      decade: selectedDecade,
      selected_provider_count: providersCount,
      selected_genre_count: genresCount,
    });
    router.back();
  }, [mediaType, selectedDecade, providersCount, genresCount]);

  const handleCategorySelect = useCallback((name: string) => {
    router.back();
    setTimeout(() => {
      router.setParams({ selectedCategory: name });
    }, 100);
  }, []);

  return (
    <View style={styles.wrapper}>
      <FormSheetContainer padX={spacing.lg}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={[styles.section, Platform.OS === "ios" && { paddingTop: spacing.xxl * 2 }]}>
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
          <SignUpNudgeBanner />
        </ScrollView>
      </FormSheetContainer>

      <View style={[styles.footer, { paddingHorizontal: spacing.lg }]}>
        <PrimaryButton onPress={handleApply} style={styles.applyButton}>
          {t("filters.apply")}
          {activeFilterCount > 0 && ` (${activeFilterCount})`}
        </PrimaryButton>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    flexDirection: "column",
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  section: {
    marginBottom: spacing.xxl,
  },
  sectionTitle: {
    color: colors.text,
    fontFamily: "Bebas",
    fontSize: 22,
    marginBottom: spacing.sm,
  },
  chipsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
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
    paddingTop: spacing.lg,
    paddingBottom: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: "#333",
    backgroundColor: colors.surface,
  },
  applyButton: {
    borderRadius: radius.lg,
  },
  applyButtonLabel: {
    fontSize: fontSize.md + 1,
    fontWeight: fontWeight.semibold,
  },
});
