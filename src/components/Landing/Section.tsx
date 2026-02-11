import { memo, useCallback, useEffect, useState } from "react";
import { Platform, StyleSheet, View, VirtualizedList } from "react-native";
import { Text } from "react-native-paper";
import { Movie } from "../../../types";
import { useLazyGetSectionMoviesQuery } from "../../redux/movie/movieApi";
import SectionListItem, { SECTION_ITEM_WIDTH, SECTION_ITEM_HEIGHT } from "../SectionItem";
import Skeleton from "../Skeleton/Skeleton";
import uniqueBy from "../../utils/unique";

interface SectionProps {
  group: { name: string; results: Movie[] };
}

export const SECTION_HEIGHT = SECTION_ITEM_HEIGHT + 80;

const sectionStyles = StyleSheet.create({
  container: {
    paddingHorizontal: 15,
    height: SECTION_HEIGHT,
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

const getItemLayout = (_: Movie[] | null | undefined, index: number) => {
  return { length: SECTION_ITEM_WIDTH + 15, offset: (SECTION_ITEM_WIDTH + 15) * index, index };
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
  />
);

const movieKeyExtractor = (item: Movie) => `${item.id}-${item.type}`;

export const Section = memo(
  ({ group }: SectionProps) => {
    const [page, setPage] = useState(1);
    const [getSectionMovies, state] = useLazyGetSectionMoviesQuery();
    const [hasMore, setHasMore] = useState(true);
    const [movies, setSectionMovies] = useState<Movie[]>(group.results);

    const onEndReached = useCallback(() => {
      if (state.isLoading || !!state.error || !hasMore) return;
      setPage((prev) => prev + 1);
    }, [state.isLoading, state.error, hasMore]);

    useEffect(() => {
      if (page === 1) return;

      getSectionMovies({ name: group.name, page }, true).then((response) => {
        if (response.data && Array.isArray(response.data.results)) {
          setHasMore(page < response.data.totalPagesCount);
          setSectionMovies((prev) => uniqueBy(prev.concat(response?.data?.results || []), "id"));
        }
      });
    }, [page, group.name]);

    if (movies.length === 0) {
      return null;
    }

    return (
      <View style={sectionStyles.container}>
        <Text style={sectionStyles.title}>{group.name}</Text>

        <VirtualizedList
          removeClippedSubviews={Platform.OS === "android"}
          getItem={getItem}
          getItemCount={getItemCount}
          getItemLayout={getItemLayout}
          initialNumToRender={3}
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
                      <View style={{ width: SECTION_ITEM_WIDTH, height: SECTION_ITEM_HEIGHT, backgroundColor: "#333", borderRadius: 8 }} />
                    </Skeleton>
                  </View>
                ))}
              </View>
            ) : null
          }
        />
      </View>
    );
  },
  (prevProps, nextProps) => {
    return prevProps.group.name === nextProps.group.name && prevProps.group.results.length === nextProps.group.results.length;
  },
);

export default Section;
