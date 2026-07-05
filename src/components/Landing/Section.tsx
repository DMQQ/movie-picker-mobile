import { memo } from "react";
import { StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";
import { FlashList, ListRenderItemInfo } from "@shopify/flash-list";
import { Movie } from "../../../types";
import SectionListItem, {
  SECTION_ITEM_WIDTH,
  SECTION_ITEM_HEIGHT,
} from "../SectionItem";
import Skeleton from "../Skeleton/Skeleton";
import { useInfiniteSectionMovies } from "../../hooks/useInfiniteSectionMovies";

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

const renderItem = ({ item }: ListRenderItemInfo<Movie>) => (
  <SectionListItem {...item} />
);

const movieKeyExtractor = (item: Movie) => `${item.id}-${item.type}`;

export const Section = memo(
  ({ group }: SectionProps) => {
    const { movies, isFetching, fetchNextPage } = useInfiniteSectionMovies(group.name, group.results);

    if (movies.length === 0) return null;

    return (
      <View style={sectionStyles.container}>
        <Text style={sectionStyles.title}>{group.name}</Text>

        <FlashList
          data={movies}
          extraData={movies.length}
          renderItem={renderItem}
          keyExtractor={movieKeyExtractor}
          horizontal
          showsHorizontalScrollIndicator={false}
          onEndReached={fetchNextPage}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            isFetching ? (
              <View style={skeletonStyles.moviesList}>
                {[...Array(2)].map((_, index) => (
                  <View style={skeletonStyles.movieCard} key={index}>
                    <Skeleton>
                      <View
                        style={{
                          width: SECTION_ITEM_WIDTH,
                          height: SECTION_ITEM_HEIGHT,
                          backgroundColor: "#333",
                          borderRadius: 8,
                        }}
                      />
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
  (prevProps, nextProps) =>
    prevProps.group.name === nextProps.group.name &&
    prevProps.group.results.length === nextProps.group.results.length,
);

export default Section;
