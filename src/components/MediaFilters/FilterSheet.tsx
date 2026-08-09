import { useCallback, useEffect, useMemo, useRef } from "react";
import IconButton from "../IconButton";
import Text from "../Text";
import { Modal, Pressable, ScrollView, StyleSheet, View } from "react-native";

import Button from "../Button";
import { colors, fontWeight, fontSize, radius, spacing } from "../../constants/design";
import GenreChip from "../GenreChip";
import PrimaryButton from "../PrimaryButton";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAppDispatch, useAppSelector } from "../../redux/store";
import {
  clearAllFilters,
  setDecade,
  setMediaType,
  setProviders,
  toggleGenre,
  DecadeFilter,
} from "../../redux/mediaFilters/mediaFiltersSlice";
import { useGetAllProvidersQuery, useGetCategoriesQuery, useGetGenresWithThumbnailsQuery } from "../../redux/movie/movieApi";
import useTranslation from "../../service/useTranslation";
import TypeSelector from "./TypeSelector";
import DecadeSelector from "./DecadeSelector";
import ProviderList from "../Room/ProviderList";
import { useFilterPreferences } from "../../hooks/useFilterPreferences";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";

function ProvidersSection() {
  const t = useTranslation();
  const dispatch = useAppDispatch();
  const selectedProviders = useAppSelector((state) => state.mediaFilters.selectedProviders);
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
  const selectedGenres = useAppSelector((state) => state.mediaFilters.selectedGenres);

  const genreType = mediaType === "both" ? "movie" : mediaType;
  const { data: genres = [], isLoading } = useGetGenresWithThumbnailsQuery({ type: genreType });

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
        <View style={styles.genreLoading}>
          <Text style={styles.loadingText}>{t("room.builder.loading")}</Text>
        </View>
      ) : (
        <View style={styles.genresContainer}>
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

function CategoriesSection({ onSelect }: { onSelect: (category: string) => void }) {
  const t = useTranslation();
  const { data: categories = [], isLoading } = useGetCategoriesQuery({});

  const validCategories = categories.filter((category) => category.results && category.results.length > 0);

  return (
    <View style={styles.section}>
      <Text variant="titleMedium" style={styles.sectionTitle}>
        {t("filters.categories")}
      </Text>
      {isLoading ? (
        <View style={styles.genreLoading}>
          <Text style={styles.loadingText}>{t("room.builder.loading")}</Text>
        </View>
      ) : (
        <View style={styles.genresContainer}>
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

interface FilterSheetProps {
  visible: boolean;
  onClose: () => void;
  onCategorySelect?: (category: string) => void;
  showCategories?: boolean;
}

export default function FilterSheet({ visible, onClose, onCategorySelect, showCategories }: FilterSheetProps) {
  const t = useTranslation();
  const insets = useSafeAreaInsets();
  const dispatch = useAppDispatch();

  const mediaType = useAppSelector((state) => state.mediaFilters.mediaType);
  const selectedDecade = useAppSelector((state) => state.mediaFilters.selectedDecade);
  const providersCount = useAppSelector((state) => state.mediaFilters.selectedProviders.length);
  const genresCount = useAppSelector((state) => state.mediaFilters.selectedGenres.length);

  const handleMediaTypeChange = useCallback(
    (type: "movie" | "tv" | "both") => {
      dispatch(setMediaType(type));
    },
    [dispatch],
  );

  const handleDecadeChange = useCallback(
    (decade: DecadeFilter) => {
      dispatch(setDecade(decade));
    },
    [dispatch],
  );

  const handleApply = useCallback(() => {
    onClose();
  }, [onClose]);

  const handleCategorySelect = useCallback(
    (category: string) => {
      onCategorySelect?.(category);
      onClose();
    },
    [onCategorySelect, onClose],
  );

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (mediaType !== "both") count++;
    if (providersCount > 0) count++;
    if (genresCount > 0) count++;
    if (selectedDecade !== "all") count++;
    return count;
  }, [mediaType, providersCount, genresCount, selectedDecade]);

  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose} statusBarTranslucent>
      <View style={styles.overlay}>
        <Animated.View style={styles.backdrop} entering={FadeIn.delay(200)} exiting={FadeOut}>
          <Pressable style={styles.backdrop} onPress={onClose} />
        </Animated.View>

        <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 24) }]}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerContent}>
              <Text variant="headlineSmall" style={styles.title}>
                {t("filters.title")}
              </Text>
              <IconButton icon="close" iconColor={colors.text} size={24} onPress={onClose} style={styles.closeButton} />
            </View>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Type Selector */}
            <View style={styles.section}>
              <Text variant="titleMedium" style={styles.sectionTitle}>
                {t("filters.type")}
              </Text>
              <TypeSelector value={mediaType} onChange={handleMediaTypeChange} />
            </View>

            {/* Decade Selector */}
            <View style={styles.section}>
              <Text variant="titleMedium" style={styles.sectionTitle}>
                {t("filters.decade")}
              </Text>
              <DecadeSelector value={selectedDecade} onChange={handleDecadeChange} />
            </View>

            <ProvidersSection />
            <GenresSection />
            {showCategories && onCategorySelect && <CategoriesSection onSelect={handleCategorySelect} />}
          </ScrollView>

          {/* Footer Actions */}
          <View style={styles.footer}>
            {/* {isFilterActive && (
              <Button
                mode="outlined"
                onPress={handleClearAll}
                style={styles.clearButton}
                labelStyle={styles.clearButtonLabel}
                contentStyle={{ padding: spacing.xs + 3.5 }}
                textColor="#999"
              >
                {t("filters.clear")}
              </Button>
            )} */}
            <PrimaryButton onPress={handleApply} style={styles.applyButton}>
              {t("filters.apply")}
              {activeFilterCount > 0 && ` (${activeFilterCount})`}
            </PrimaryButton>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "75%",
  },
  header: {
    alignItems: "center",
    paddingTop: spacing.lg,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    paddingHorizontal: spacing.lg,
  },
  title: {
    color: colors.text,
    fontWeight: fontWeight.bold,
    flex: 1,
    textAlign: "center",
  },
  closeButton: {
    position: "absolute",
    right: 8,
  },
  content: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
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
  selectedCount: {
    color: colors.primary,
    fontWeight: fontWeight.normal,
  },
  genresContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  genreLoading: {
    height: 100,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: "#666",
  },
  footer: {
    flexDirection: "row",
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    gap: spacing.md,
    borderTopWidth: 1,
    borderTopColor: "#333",
  },
  clearButton: {
    flex: 1,
    borderRadius: radius.lg,
    borderColor: "#666",
  },
  clearButtonLabel: {
    fontSize: fontSize.md + 1,
  },
  applyButton: {
    flex: 2,
    borderRadius: radius.lg,
  },
  applyButtonLabel: {
    fontSize: fontSize.md + 1,
    fontWeight: fontWeight.semibold,
  },
});
