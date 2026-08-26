import React, { memo, useCallback, useEffect, useRef, useState } from "react";
import Text from "../../Text";
import { View, StyleSheet, LayoutChangeEvent, FlatList } from "react-native";
import { router } from "expo-router";

import { useGetCategoriesWithThumbnailsQuery } from "../../../redux/movie/movieApi";
import PosterCard from "./PosterCard";
import SkeletonCard from "../SkeletonCard";
import CustomMoviesBanner from "../../CustomMoviesBanner";
import useTranslation from "../../../service/useTranslation";
import { useAppDispatch, useAppSelector } from "../../../redux/store";
import { setCategory } from "../../../redux/roomBuilder/roomBuilderSlice";
import { moviePickerActions } from "../../../redux/moviePicker/moviePickerSlice";
import { colors, fontSize, spacing } from "../../../constants/design";

const MIN_CUSTOM_MOVIES = 20;

const Step1GameType: React.FC = () => {
  const dispatch = useAppDispatch();
  const customMovies = useAppSelector((state) => state.builder.customMovies);
  // In-progress selection from a previous picker open (not yet confirmed)
  const pickerSelected = useAppSelector((state) => state.moviePicker.selected);
  const hasCustom = customMovies.length >= MIN_CUSTOM_MOVIES;

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
    router.push({ pathname: "/movie-picker", params: { requiredCount: MIN_CUSTOM_MOVIES } });
  }, [dispatch, customMovies, pickerSelected]);

  return (
    <View style={styles.container}>
      <CategorySection type="movie" titleKey="room.builder.step1.movies" onSelectCategory={onSelectCategory} />
      <CategorySection type="tv" titleKey="room.builder.step1.tv" onSelectCategory={onSelectCategory} />
      <CustomMoviesBanner
        selected={hasCustom}
        moviesCount={customMovies.length}
        onPress={handlePickCustomMovies}
        style={styles.bannerSpacing}
      />
    </View>
  );
};

interface CategorySectionProps {
  type: "movie" | "tv";
  titleKey: string;
  onSelectCategory: (categoryId: string, categoryPath: string, gameType: "movie" | "tv") => void;
}

const CategorySection = ({ type, titleKey, onSelectCategory }: CategorySectionProps) => {
  const t = useTranslation();
  const [listHeight, setListHeight] = useState(0);
  const selectedCategoryId = useAppSelector((state) => state.builder.categoryId);
  const hasCustomMovies = useAppSelector((state) => state.builder.customMovies.length > 0);
  const { data: categories, isLoading } = useGetCategoriesWithThumbnailsQuery({ type });
  const didAutoSelect = useRef(false);

  useEffect(() => {
    // Only movies auto-select the first category; TV is picked manually
    if (type !== "movie") return;
    if (didAutoSelect.current || hasCustomMovies) return;
    if (categories && categories.length > 0 && !selectedCategoryId) {
      didAutoSelect.current = true;
      onSelectCategory(categories[0].id, categories[0].path, type);
    }
  }, [categories, selectedCategoryId, hasCustomMovies, onSelectCategory, type]);

  const onListWrapperLayout = useCallback((e: LayoutChangeEvent) => {
    const h = e.nativeEvent.layout.height;
    if (h > 0) setListHeight(h);
  }, []);

  const cardWidth = Math.floor(listHeight * 0.7);

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{t(titleKey)}</Text>

      <View style={styles.listWrapper} onLayout={onListWrapperLayout}>
        {listHeight > 0 && (
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
            style={{ height: listHeight }}
            data={categories}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item: category, index }) => (
              <PosterCard
                posterUrl={category.featured_poster}
                label={category.label}
                isSelected={!hasCustomMovies && selectedCategoryId === category.id}
                onPress={() => onSelectCategory(category.id, category.path, type)}
                delay={index * 50}
                large
                cardWidth={cardWidth}
                cardHeight={listHeight}
              />
            )}
            ListEmptyComponent={
              <View style={{ flexDirection: "row", gap: spacing.md }}>
                {isLoading && [1, 2, 3, 4].map((item) => <SkeletonCard key={item} width={cardWidth} height={listHeight} borderRadius={12} />)}
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
  bannerSpacing: {
    marginTop: spacing.sm,
  },
});

export default memo(Step1GameType);
