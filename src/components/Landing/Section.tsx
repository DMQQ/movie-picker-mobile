import { router } from "expo-router";
import { FlashList } from "@shopify/flash-list";
import { memo, useCallback, useEffect, useState } from "react";
import { Dimensions, StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";
import Animated, { FadeIn } from "react-native-reanimated";
import { Movie } from "../../../types";
import { useLazyGetSectionMoviesQuery } from "../../redux/movie/movieApi";
import SectionListItem from "../SectionItem";
import Skeleton from "../Skeleton/Skeleton";
import { prefetchThumbnail } from "../Thumbnail";

const { width } = Dimensions.get("screen");

interface SectionProps {
  group: { name: string; results: Movie[] };
  categoryId?: string;
}

const sectionStyles = StyleSheet.create({
  container: {
    paddingHorizontal: 15,
    paddingBottom: 50,
    height: Math.min(width * 0.25, 200) * 1.75 + 75,
  },
  title: {
    color: "#fff",
    fontSize: 35,
    fontFamily: "Bebas",
    marginBottom: 10,
  },
  list: {
    flex: 1,
  },
  listContainer: {
    justifyContent: "flex-start",
    alignItems: "center",
  },
});

const skeletonStyles = StyleSheet.create({
  moviesList: {
    flexDirection: "row",
    gap: 10,
    marginTop: 15,
  },
  movieCard: {
    alignItems: "center",
  },
});

export const Section = memo(({ group, categoryId }: SectionProps) => {
  const [page, setPage] = useState(1);
  const [getSectionMovies, state] = useLazyGetSectionMoviesQuery();

  const [movies, setSectionMovies] = useState<Movie[]>(() => group.results);

  const movieKeyExtractor = useCallback(
    (item: any, index: number) => `${categoryId || "default"}-${group.name}-${item.id}-${item.type || "movie"}`,
    [categoryId, group.name]
  );

  const onEndReached = useCallback(() => {
    if (state.isLoading || !!state.error) return;
    setPage((prev) => prev + 1);
  }, [state.isLoading, state.error]);

  useEffect(() => {
    if (page === 1) return;

    getSectionMovies({ name: group.name, page }).then((response) => {
      if (response.data && Array.isArray(response.data.results)) {
        Promise.allSettled(response.data.results.map((i) => prefetchThumbnail(i.poster_path, 185)));

        setSectionMovies((prev) => prev.concat(response?.data?.results || []));
      }
    });
  }, [page]);

  if (movies.length === 0 && !state.isLoading) return null;

  const movieWidth = Math.min(width * 0.25, 120);
  const movieHeight = movieWidth * 1.5;

  return (
    <Animated.View style={sectionStyles.container} entering={FadeIn}>
      <Text style={sectionStyles.title}>{group.name}</Text>
      {movies.length > 0 && (
        <FlashList
          onEndReached={onEndReached}
          data={(movies || []) as any}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={movieKeyExtractor}
          renderItem={({ item }) => (
            <SectionListItem
              href={{
                pathname: "/movie/type/[type]/[id]",
                params: {
                  id: item.id,
                  type: item.type === "tv" ? "tv" : "movie",
                  img: item.poster_path,
                },
              }}
              {...item}
            />
          )}
          ListFooterComponent={
            state.isLoading ? (
              <View style={skeletonStyles.moviesList}>
                {[...Array(2)].map((_, index) => (
                  <View style={skeletonStyles.movieCard} key={index}>
                    <Skeleton>
                      <View style={{ width: movieWidth, height: movieHeight, backgroundColor: "#333", borderRadius: 8 }} />
                    </Skeleton>
                  </View>
                ))}
              </View>
            ) : null
          }
        />
      )}
    </Animated.View>
  );
});

export default Section;
