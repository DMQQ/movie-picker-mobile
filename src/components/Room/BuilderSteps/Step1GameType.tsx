import React, { memo, useCallback, useEffect } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { Text } from "react-native-paper";
import Animated, { useAnimatedScrollHandler, useSharedValue } from "react-native-reanimated";
import { useGetMovieCategoriesWithThumbnailsQuery, useGetTVCategoriesWithThumbnailsQuery } from "../../../redux/movie/movieApi";
import PosterCard from "./PosterCard";
import SkeletonCard from "../SkeletonCard";
import useTranslation from "../../../service/useTranslation";
import { useAppDispatch, useAppSelector } from "../../../redux/store";
import { setCategory } from "../../../redux/roomBuilder/roomBuilderSlice";

const Step1GameType: React.FC = () => {
  const dispatch = useAppDispatch();

  const onSelectCategory = useCallback(
    (categoryId: string, categoryPath: string, gameType: "movie" | "tv") => {
      dispatch(
        setCategory({
          id: categoryId,
          path: categoryPath,
          type: gameType,
        })
      );
    },
    [dispatch]
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <MoviesSection onSelectCategory={onSelectCategory} />

      <SeriesSection onSelectCategory={onSelectCategory} />
    </ScrollView>
  );
};

interface SectionPrpos {
  onSelectCategory: (categoryId: string, categoryPath: string, gameType: "movie" | "tv") => void;
}

const MoviesSection = ({ onSelectCategory }: SectionPrpos) => {
  const t = useTranslation();
  const selectedCategoryId = useAppSelector((state) => state.builder.categoryId);
  const movieScrollX = useSharedValue(0);
  const { data: movieCategories, isLoading: moviesLoading } = useGetMovieCategoriesWithThumbnailsQuery();

  // Pre-select first movie category as default
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
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{t("room.builder.step1.movies")}</Text>

      <Animated.FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        onScroll={movieScrollHandler}
        data={movieCategories}
        keyExtractor={(item, index) => item.id.toString()}
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
            cardWidth={200}
          />
        )}
        ListEmptyComponent={
          <View style={{ flexDirection: "row", gap: 12 }}>
            {moviesLoading && [1, 2, 3, 4].map((item) => <SkeletonCard key={item} width={200} height={300} borderRadius={12} />)}
          </View>
        }
      />
    </View>
  );
};

const SeriesSection = ({ onSelectCategory }: SectionPrpos) => {
  const tvScrollX = useSharedValue(0);

  const tvScrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      tvScrollX.value = event.contentOffset.x;
    },
  });
  const t = useTranslation();
  const selectedCategoryId = useAppSelector((state) => state.builder.categoryId);
  const { data: tvCategories, isLoading: tvLoading } = useGetTVCategoriesWithThumbnailsQuery();

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{t("room.builder.step1.tv")}</Text>

      <Animated.FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        onScroll={tvScrollHandler}
        data={tvCategories}
        keyExtractor={(item, index) => item.id.toString()}
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
            cardWidth={200}
          />
        )}
        ListEmptyComponent={
          <View
            style={{
              flexDirection: "row",
              gap: 12,
            }}
          >
            {tvLoading && [1, 2, 3, 4].map((item) => <SkeletonCard key={item} width={200} height={300} borderRadius={12} />)}
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
  },
  loadingText: {
    color: "#999",
    fontSize: 16,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 24,
    fontFamily: "Bebas",
    color: "#fff",
    marginBottom: 16,
  },
  scrollContent: {
    paddingRight: 16,
  },
});

export default memo(Step1GameType);
