import React from "react";
import { View, StyleSheet } from "react-native";
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

  const selectedCategory = useAppSelector((state) => state.builder.category);

  const onSelectCategory = (categoryPath: string, gameType: "movie" | "tv") => {
    dispatch(
      setCategory({
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
    <View style={styles.container}>
      {/* Movies Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t("room.builder.step1.movies")}</Text>
        <Animated.ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          onScroll={movieScrollHandler}
          scrollEventThrottle={16}
        >
          {moviesLoading ? (
            <>
              {[1, 2, 3, 4].map((item) => (
                <SkeletonCard key={item} width={200} height={300} borderRadius={12} />
              ))}
            </>
          ) : (
            movieCategories?.map((category, index) => (
              <PosterCard
                key={category.id}
                posterUrl={category.featured_poster}
                label={category.label}
                isSelected={selectedCategory === category.path}
                onPress={() => onSelectCategory(category.path, "movie")}
                delay={index * 50}
                large
                scrollX={movieScrollX}
                index={index}
                cardWidth={200}
              />
            ))
          )}
        </Animated.ScrollView>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t("room.builder.step1.tv")}</Text>
        <Animated.ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          onScroll={tvScrollHandler}
          scrollEventThrottle={16}
        >
          {tvLoading ? (
            <>
              {[1, 2, 3, 4].map((item) => (
                <SkeletonCard key={item} width={200} height={300} borderRadius={12} />
              ))}
            </>
          ) : (
            tvCategories?.map((category, index) => (
              <PosterCard
                key={category.id}
                posterUrl={category.featured_poster}
                label={category.label}
                isSelected={selectedCategory === category.path}
                onPress={() => onSelectCategory(category.path, "tv")}
                delay={index * 50}
                large
                scrollX={tvScrollX}
                index={index}
                cardWidth={200}
              />
            ))
          )}
        </Animated.ScrollView>
      </View>
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

export default Step1GameType;
