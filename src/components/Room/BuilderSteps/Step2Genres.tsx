import React from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import { Text } from "react-native-paper";
import Animated, { useAnimatedScrollHandler, useSharedValue } from "react-native-reanimated";
import { useGetGenresWithThumbnailsQuery } from "../../../redux/movie/movieApi";
import SwipeableGenreCard from "./SwipeableGenreCard";
import SkeletonCard from "../SkeletonCard";
import useTranslation from "../../../service/useTranslation";

interface Genre {
  id: number;
  name: string;
}

interface Step2GenresProps {
  gameType: "movie" | "tv";
  selectedGenres: Genre[];
  onToggleGenre: (genre: Genre) => void;
}

const Step2Genres: React.FC<Step2GenresProps> = ({ gameType, selectedGenres, onToggleGenre }) => {
  const { data: genres, isLoading } = useGetGenresWithThumbnailsQuery({ type: gameType });
  const t = useTranslation();
  const scrollX = useSharedValue(0);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollX.value = event.contentOffset.x;
    },
  });

  const isGenreSelected = (genreId: number) => {
    return selectedGenres.some((g) => g.id === genreId);
  };

  const cardWidth = Dimensions.get("window").width * 0.75;
  const cardHeight = Dimensions.get("window").height * 0.65;

  return (
    <View style={styles.container}>
      <Animated.ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        snapToInterval={cardWidth + 16}
        decelerationRate="fast"
      >
        {isLoading ? (
          <>
            {[1, 2, 3].map((item) => (
              <SkeletonCard key={item} width={cardWidth} height={cardHeight} borderRadius={16} />
            ))}
          </>
        ) : (
          genres?.map((genre, index) => (
            <SwipeableGenreCard
              key={genre.id}
              genreName={genre.name}
              posterUrl={genre.representative_poster}
              isSelected={isGenreSelected(genre.id)}
              onPress={() => onToggleGenre({ id: genre.id, name: genre.name })}
              delay={index * 50}
              vertical={false}
              scrollX={scrollX}
              index={index}
            />
          ))
        )}
      </Animated.ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    height: Dimensions.get("window").height * 0.75,
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
  scrollContent: {
    alignItems: "center",
  },
});

export default Step2Genres;
