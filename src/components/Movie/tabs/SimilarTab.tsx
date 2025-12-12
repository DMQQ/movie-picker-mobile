import { memo, useCallback, useEffect, useState } from "react";
import { Dimensions, StyleSheet, View } from "react-native";
import { FlashList } from "@shopify/flash-list";
import { Movie } from "../../../../types";
import { useLazyGetSimilarQuery } from "../../../redux/movie/movieApi";
import SectionListItem from "../../SectionItem";
import { Text } from "react-native-paper";

const { width } = Dimensions.get("screen");

interface SimilarTabProps {
  id: number;
  type: "movie" | "tv";
}

function SimilarTab({ id, type }: SimilarTabProps) {
  const [page, setPage] = useState(1);
  const [getSectionMovies, state] = useLazyGetSimilarQuery();
  const [movies, setSectionMovies] = useState<Movie[]>([]);

  const onEndReached = useCallback(() => {
    if (state.isLoading || !!state.error) return;
    setPage((prev) => prev + 1);
  }, [state.isLoading, state.error]);

  useEffect(() => {
    getSectionMovies({ id: id, type: type, page }).then((response) => {
      if (response.data && Array.isArray(response.data.results)) {
        setSectionMovies((prev) => prev.concat(response?.data?.results || []));
      }
    });
  }, [page]);

  if (!movies.length) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No similar items found</Text>
      </View>
    );
  }

  return (
    <FlashList
      onEndReached={onEndReached}
      data={(movies || []) as any}
      numColumns={3}
      showsVerticalScrollIndicator={false}
      keyExtractor={keySectionExtractor}
      nestedScrollEnabled={true}
      renderItem={({ item }) => (
        <View style={styles.itemWrapper}>
          <SectionListItem
            href={{
              pathname: `/movie/type/[type]/[id]`,
              params: {
                id: item.id,
                type: item.type === "tv" ? "tv" : "movie",
                img: item.poster_path,
              },
            }}
            {...item}
          />
        </View>
      )}
      onEndReachedThreshold={0.5}
      contentContainerStyle={styles.listContent}
    />
  );
}

const keySectionExtractor = (item: any, index: number) =>
  item.id.toString() + "-" + item.type + "-" + index;

export default memo(SimilarTab);

const styles = StyleSheet.create({
  listContent: {
    paddingHorizontal: 10,
    paddingTop: 10,
  },
  itemWrapper: {
    width: (width - 20) / 3 - 7,
    marginHorizontal: 3.5,
    marginBottom: 10,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyText: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 16,
  },
});
