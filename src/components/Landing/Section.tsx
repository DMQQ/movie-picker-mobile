import { router } from "expo-router";
import { FlashList } from "@shopify/flash-list";
import { memo, useCallback, useEffect, useState } from "react";
import { Dimensions, StyleSheet, View, VirtualizedList } from "react-native";
import { Text } from "react-native-paper";
import Animated, { FadeIn } from "react-native-reanimated";
import { Movie } from "../../../types";
import { useLazyGetSectionMoviesQuery } from "../../redux/movie/movieApi";
import SectionListItem from "../SectionItem";
import Skeleton from "../Skeleton/Skeleton";
import uniqueBy from "../../utils/unique";

const { width } = Dimensions.get("screen");

interface SectionProps {
  group: { name: string; results: Movie[] };
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

const getItem = (data: Movie[], index: number) => data[index];

const getItemCount = (data: Movie[]) => data.length;

const getItemLayout = (data: Movie[] | null | undefined, index: number) => {
  const movieWidth = Math.min(width * 0.25, 120);
  return { length: movieWidth + 15, offset: (movieWidth + 15) * index, index };
};

const renderItem = ({ item }: { item: Movie }) => (
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
    // isFlashListItem
  />
);

export const Section = memo(
  ({ group }: SectionProps) => {
    const [page, setPage] = useState(1);
    const [getSectionMovies, state] = useLazyGetSectionMoviesQuery();

    const [movies, setSectionMovies] = useState<Movie[]>(() => group.results);

    const movieKeyExtractor = useCallback((item: any) => `section-${item.id}-${item.type}`, []);

    const onEndReached = useCallback(() => {
      if (state.isLoading || !!state.error) return;
      setPage((prev) => prev + 1);
    }, [state.isLoading, state.error]);

    useEffect(() => {
      if (page === 1) return;

      getSectionMovies({ name: group.name, page }).then((response) => {
        if (response.data && Array.isArray(response.data.results)) {
          setSectionMovies((prev) => uniqueBy(prev.concat(response?.data?.results || []), "id"));
        }
      });
    }, [page]);

    if (movies.length === 0 && !state.isLoading) {
      return null;
    }

    const movieWidth = Math.min(width * 0.25, 120);
    const movieHeight = movieWidth * 1.5;

    return (
      <Animated.View style={sectionStyles.container} entering={FadeIn}>
        <Text style={sectionStyles.title}>{group.name}</Text>

        <VirtualizedList
          getItem={getItem}
          getItemCount={getItemCount}
          getItemLayout={getItemLayout}
          initialNumToRender={4}
          onEndReached={onEndReached}
          data={(movies || []) as any}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={movieKeyExtractor}
          renderItem={renderItem}
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
      </Animated.View>
    );
  },
  (prevProps, nextProps) => {
    return prevProps.group.name === nextProps.group.name && prevProps.group.results.length === nextProps.group.results.length;
  }
);

export default Section;
