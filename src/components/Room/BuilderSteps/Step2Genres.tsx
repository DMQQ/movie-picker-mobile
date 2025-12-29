import React, { memo } from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import Animated, { useAnimatedScrollHandler, useSharedValue } from "react-native-reanimated";
import { useGetGenresWithThumbnailsQuery } from "../../../redux/movie/movieApi";
import SwipeableGenreCard from "./SwipeableGenreCard";
import SkeletonCard from "../SkeletonCard";
import { useAppDispatch, useAppSelector } from "../../../redux/store";
import { toggleGenre } from "../../../redux/roomBuilder/roomBuilderSlice";

interface Genre {
  id: number;
  name: string;
}

const cardWidth = Dimensions.get("window").width * 0.75;
const cardHeight = Dimensions.get("window").height * 0.65;

const Step2Genres: React.FC = () => {
  const dispatch = useAppDispatch();
  const gameType = useAppSelector((state) => state.builder.gameType);
  const selectedGenres = useAppSelector((state) => state.builder.genres);
  const { data: genres, isLoading } = useGetGenresWithThumbnailsQuery({ type: gameType });
  const scrollX = useSharedValue(0);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollX.value = event.contentOffset.x;
    },
  });

  const isGenreSelected = (genreId: number) => {
    return selectedGenres.some((g) => g.id === genreId);
  };

  const onToggleGenre = (genre: Genre) => {
    dispatch(toggleGenre(genre));
  };

  return (
    <View style={styles.container}>
      <Animated.FlatList
        initialNumToRender={2}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        onScroll={scrollHandler}
        snapToInterval={cardWidth + 16}
        data={genres}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item: genre, index }) => (
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
        )}
        ListEmptyComponent={
          isLoading ? (
            <>
              {[1, 2, 3].map((item) => (
                <SkeletonCard key={item} width={cardWidth} height={cardHeight} borderRadius={16} />
              ))}
            </>
          ) : null
        }
      />
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

export default memo(Step2Genres);
