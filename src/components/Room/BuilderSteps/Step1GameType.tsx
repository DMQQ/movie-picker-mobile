import React, { memo } from "react";
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
  const { data: movieCategories, isLoading: moviesLoading } = useGetMovieCategoriesWithThumbnailsQuery();
  const { data: tvCategories, isLoading: tvLoading } = useGetTVCategoriesWithThumbnailsQuery();
  const t = useTranslation();

  const selectedCategoryId = useAppSelector((state) => state.builder.categoryId);

  const onSelectCategory = (categoryId: string, categoryPath: string, gameType: "movie" | "tv") => {
    dispatch(
      setCategory({
        id: categoryId,
        path: categoryPath,
        type: gameType,
      })
    );
  };

  const movieScrollX = useSharedValue(0);
  const tvScrollX = useSharedValue(0);

  const movieScrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      movieScrollX.value = event.contentOffset.x;
    },
  });

  const tvScrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      tvScrollX.value = event.contentOffset.x;
    },
  });

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t("room.builder.step1.movies")}</Text>

        <Animated.FlatList
          initialNumToRender={2}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          onScroll={movieScrollHandler}
          data={movieCategories}
          keyExtractor={(item, index) => (moviesLoading ? index.toString() : item.id.toString())}
          renderItem={({ item: category, index }) => (
            <PosterCard
              key={category.id}
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

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t("room.builder.step1.tv")}</Text>

        <Animated.FlatList
          initialNumToRender={2}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          onScroll={tvScrollHandler}
          data={tvCategories}
          keyExtractor={(item, index) => (tvLoading ? index.toString() : item.id.toString())}
          renderItem={({ item: category, index }) => (
            <PosterCard
              key={category.id}
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
    </ScrollView>
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
