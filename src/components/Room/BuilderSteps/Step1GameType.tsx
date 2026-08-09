import React, { memo, useCallback, useEffect, useState } from "react";
import Text from "../../Text";
import { View, StyleSheet, LayoutChangeEvent } from "react-native";

import Animated, {
  useAnimatedScrollHandler,
  useSharedValue,
} from "react-native-reanimated";
import {
  useGetMovieCategoriesWithThumbnailsQuery,
  useGetTVCategoriesWithThumbnailsQuery,
} from "../../../redux/movie/movieApi";
import PosterCard from "./PosterCard";
import SkeletonCard from "../SkeletonCard";
import useTranslation from "../../../service/useTranslation";
import { useAppDispatch, useAppSelector } from "../../../redux/store";
import { setCategory } from "../../../redux/roomBuilder/roomBuilderSlice";
import { colors, fontSize, spacing} from "../../../constants/design";

const Step1GameType: React.FC = () => {
  const dispatch = useAppDispatch();

  const onSelectCategory = useCallback(
    (categoryId: string, categoryPath: string, gameType: "movie" | "tv") => {
      dispatch(
        setCategory({
          id: categoryId,
          path: categoryPath,
          type: gameType,
        }),
      );
    },
    [dispatch],
  );

  return (
    <View style={styles.container}>
      <MoviesSection onSelectCategory={onSelectCategory} />
      <SeriesSection onSelectCategory={onSelectCategory} />
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
  const movieScrollX = useSharedValue(0);
  const { data: movieCategories, isLoading: moviesLoading } = useGetMovieCategoriesWithThumbnailsQuery();

  useEffect(() => {
    if (movieCategories && movieCategories.length > 0 && !selectedCategoryId) {
      const firstCategory = movieCategories[0];
      onSelectCategory(firstCategory.id, firstCategory.path, "movie");
    }
  }, [movieCategories, selectedCategoryId, onSelectCategory]);

  const movieScrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      movieScrollX.value = event.contentOffset.x;
    },
  });

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
          <Animated.FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
            style={{ height: listHeight }}
            onScroll={movieScrollHandler}
            data={movieCategories}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item: category, index }) => (
              <PosterCard
                posterUrl={category.featured_poster}
                label={category.label}
                isSelected={selectedCategoryId === category.id}
                onPress={() => onSelectCategory(category.id, category.path, "movie")}
                delay={index * 50}
                large
                scrollX={movieScrollX}
                index={index}
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
  const tvScrollX = useSharedValue(0);

  const tvScrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      tvScrollX.value = event.contentOffset.x;
    },
  });
  const t = useTranslation();
  const selectedCategoryId = useAppSelector((state) => state.builder.categoryId);
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
          <Animated.FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
            style={{ height: listHeight }}
            onScroll={tvScrollHandler}
            data={tvCategories}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item: category, index }) => (
              <PosterCard
                posterUrl={category.featured_poster}
                label={category.label}
                isSelected={selectedCategoryId === category.id}
                onPress={() => onSelectCategory(category.id, category.path, "tv")}
                delay={index * 50}
                large
                scrollX={tvScrollX}
                index={index}
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
});

export default memo(Step1GameType);
