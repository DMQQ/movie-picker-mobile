import React, { memo, useCallback, useEffect, useRef, useState } from "react";
import Text from "../../Text";
import Touch from "../../Touch";
import { View, StyleSheet, LayoutChangeEvent, FlatList } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";

import {
  useGetMovieCategoriesWithThumbnailsQuery,
  useGetTVCategoriesWithThumbnailsQuery,
} from "../../../redux/movie/movieApi";
import PosterCard from "./PosterCard";
import SkeletonCard from "../SkeletonCard";
import useTranslation from "../../../service/useTranslation";
import { useAppDispatch, useAppSelector } from "../../../redux/store";
import { setCategory } from "../../../redux/roomBuilder/roomBuilderSlice";
import { moviePickerActions } from "../../../redux/moviePicker/moviePickerSlice";
import { colors, fontSize, fontWeight, radius, spacing, withAlpha } from "../../../constants/design";

const Step1GameType: React.FC = () => {
  const dispatch = useAppDispatch();
  const customMovies = useAppSelector((state) => state.builder.customMovies);
  // In-progress selection from a previous picker open (not yet confirmed)
  const pickerSelected = useAppSelector((state) => state.moviePicker.selected);
  const hasCustom = customMovies.length >= 10;

  const onSelectCategory = useCallback(
    (categoryId: string, categoryPath: string, gameType: "movie" | "tv") => {
      dispatch(setCategory({ id: categoryId, path: categoryPath, type: gameType }));
    },
    [dispatch],
  );

  const handlePickCustomMovies = useCallback(() => {
    // Prefer in-progress selection (swipe-away session) over last confirmed set
    const initial = pickerSelected.length > 0 ? pickerSelected : customMovies;
    dispatch(moviePickerActions.init({ initial }));
    router.push("/movie-picker");
  }, [dispatch, customMovies, pickerSelected]);

  return (
    <View style={styles.container}>
      <MoviesSection onSelectCategory={onSelectCategory} />
      <SeriesSection onSelectCategory={onSelectCategory} />
      <Touch scaleTo={0.97} onPress={handlePickCustomMovies} style={[styles.customBanner, hasCustom && styles.customBannerSelected]}>
        <View style={[styles.customBannerIcon, hasCustom && styles.customBannerIconSelected]}>
          <MaterialCommunityIcons name="movie-filter" size={20} color={hasCustom ? colors.primary : colors.placeholder} />
        </View>
        <View style={styles.customBannerText}>
          <Text style={[styles.customBannerTitle, hasCustom && styles.customBannerTitleSelected]}>Pick your own movies</Text>
          <Text style={styles.customBannerSubtitle}>
            {hasCustom ? `${customMovies.length} movies selected · tap to change` : "Choose exactly what gets swiped"}
          </Text>
        </View>
        <MaterialCommunityIcons name="chevron-right" size={22} color={hasCustom ? colors.primary : colors.placeholder} />
      </Touch>
    </View>
  );
};

interface SectionPrpos {
  onSelectCategory: (categoryId: string, categoryPath: string, gameType: "movie" | "tv") => void;
}

const MoviesSection = ({ onSelectCategory }: SectionPrpos) => {
  const t = useTranslation();
  const [listHeight, setListHeight] = useState(0);
  const selectedCategoryId = useAppSelector((state) => state.builder.categoryId);
  const hasCustomMovies = useAppSelector((state) => state.builder.customMovies.length > 0);
  const { data: movieCategories, isLoading: moviesLoading } = useGetMovieCategoriesWithThumbnailsQuery();
  const didAutoSelect = useRef(false);

  useEffect(() => {
    if (didAutoSelect.current || hasCustomMovies) return;
    if (movieCategories && movieCategories.length > 0 && !selectedCategoryId) {
      didAutoSelect.current = true;
      onSelectCategory(movieCategories[0].id, movieCategories[0].path, "movie");
    }
  }, [movieCategories, selectedCategoryId, hasCustomMovies, onSelectCategory]);

  const onListWrapperLayout = useCallback((e: LayoutChangeEvent) => {
    const h = e.nativeEvent.layout.height;
    if (h > 0) setListHeight(h);
  }, []);

  const cardWidth = Math.floor(listHeight * 0.7);

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{t("room.builder.step1.movies")}</Text>

      <View style={styles.listWrapper} onLayout={onListWrapperLayout}>
        {listHeight > 0 && (
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
            style={{ height: listHeight }}
            data={movieCategories}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item: category, index }) => (
              <PosterCard
                posterUrl={category.featured_poster}
                label={category.label}
                isSelected={!hasCustomMovies && selectedCategoryId === category.id}
                onPress={() => onSelectCategory(category.id, category.path, "movie")}
                delay={index * 50}
                large
                cardWidth={cardWidth}
                cardHeight={listHeight}
              />
            )}
            ListEmptyComponent={
              <View style={{ flexDirection: "row", gap: spacing.md }}>
                {moviesLoading && [1, 2, 3, 4].map((item) => <SkeletonCard key={item} width={cardWidth} height={listHeight} borderRadius={12} />)}
              </View>
            }
          />
        )}
      </View>
    </View>
  );
};

const SeriesSection = ({ onSelectCategory }: SectionPrpos) => {
  const [listHeight, setListHeight] = useState(0);
  const t = useTranslation();
  const selectedCategoryId = useAppSelector((state) => state.builder.categoryId);
  const hasCustomMovies = useAppSelector((state) => state.builder.customMovies.length > 0);
  const { data: tvCategories, isLoading: tvLoading } = useGetTVCategoriesWithThumbnailsQuery();

  const onListWrapperLayout = useCallback((e: LayoutChangeEvent) => {
    const h = e.nativeEvent.layout.height;
    if (h > 0) setListHeight(h);
  }, []);

  const cardWidth = Math.floor(listHeight * 0.7);

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{t("room.builder.step1.tv")}</Text>

      <View style={styles.listWrapper} onLayout={onListWrapperLayout}>
        {listHeight > 0 && (
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
            style={{ height: listHeight }}
            data={tvCategories}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item: category, index }) => (
              <PosterCard
                posterUrl={category.featured_poster}
                label={category.label}
                isSelected={!hasCustomMovies && selectedCategoryId === category.id}
                onPress={() => onSelectCategory(category.id, category.path, "tv")}
                delay={index * 50}
                large
                cardWidth={cardWidth}
                cardHeight={listHeight}
              />
            )}
            ListEmptyComponent={
              <View style={{ flexDirection: "row", gap: spacing.md }}>
                {tvLoading && [1, 2, 3, 4].map((item) => <SkeletonCard key={item} width={cardWidth} height={listHeight} borderRadius={12} />)}
              </View>
            }
          />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: spacing.xl,
    gap: spacing.lg,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: spacing.lg,
  },
  loadingText: {
    color: "#999",
    fontSize: fontSize.lg,
  },
  section: {
    flex: 1,
  },
  listWrapper: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 24,
    fontFamily: "Bebas",
    color: colors.text,
    marginBottom: spacing.md,
  },
  scrollContent: {
    paddingRight: spacing.lg,
  },
  customBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.card,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md + 2,
    marginTop: spacing.sm,
    borderWidth: 1,
    borderColor: "transparent",
  },
  customBannerSelected: {
    backgroundColor: withAlpha(colors.primary, 0.1),
    borderColor: withAlpha(colors.primary, 0.35),
  },
  customBannerIcon: {
    width: 38,
    height: 38,
    borderRadius: radius.sm,
    backgroundColor: colors.input,
    alignItems: "center",
    justifyContent: "center",
  },
  customBannerIconSelected: {
    backgroundColor: withAlpha(colors.primary, 0.15),
  },
  customBannerText: {
    flex: 1,
    gap: 2,
  },
  customBannerTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.text,
  },
  customBannerTitleSelected: {
    color: colors.primary,
  },
  customBannerSubtitle: {
    fontSize: fontSize.sm,
    color: colors.placeholder,
  },
});

export default memo(Step1GameType);
