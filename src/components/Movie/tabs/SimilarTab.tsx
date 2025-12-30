import { memo, useEffect, useState } from "react";
import { Dimensions, StyleSheet, View, TouchableOpacity, ActivityIndicator } from "react-native";
import { Movie } from "../../../../types";
import { useLazyGetSimilarQuery } from "../../../redux/movie/movieApi";
import SectionListItem from "../../SectionItem";
import { Text } from "react-native-paper";
import useTranslation from "../../../service/useTranslation";
import uniqueBy from "../../../utils/unique";

const { width } = Dimensions.get("screen");

const imageWidth = (width - 60) / 3;

interface SimilarTabProps {
  id: number;
  type: "movie" | "tv";
}

function SimilarTab({ id, type }: SimilarTabProps) {
  const [page, setPage] = useState(1);
  const [getSectionMovies, state] = useLazyGetSimilarQuery();
  const [movies, setSectionMovies] = useState<Movie[]>([]);
  const [hasMore, setHasMore] = useState(true);

  const t = useTranslation();

  useEffect(() => {
    getSectionMovies({ id: id, type: type, page }).then((response) => {
      if (response.data && Array.isArray(response.data.results)) {
        setHasMore(response?.data ? response.data.page < response.data.total_pages : false);

        setSectionMovies((prev) => uniqueBy(prev.concat(response?.data?.results || []), "id"));
      }
    });
  }, [page, id, type]);

  const handleLoadMore = () => {
    if (!state.isLoading) {
      setPage((prev) => prev + 1);
    }
  };

  if (!movies.length && !state.isLoading) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No similar items found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.gridContainer}>
        {movies.map((item, index) => (
          <View key={`${item.id}-${type}-${index}`} style={styles.itemWrapper}>
            <SectionListItem
              href={{
                pathname: `/movie/type/[type]/[id]`,
                params: {
                  id: item.id,
                  type: type,
                  img: item.poster_path,
                },
              }}
              {...item}
              imageWidth={imageWidth}
            />
          </View>
        ))}
      </View>

      {hasMore && (
        <View style={styles.footer}>
          {state.isLoading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <TouchableOpacity style={styles.loadMoreButton} onPress={handleLoadMore} activeOpacity={0.7}>
              <Text style={styles.loadMoreText}>{t("movie.similar.load_more")}</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
}

export default memo(SimilarTab);

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 15,
    paddingTop: 10,
  },
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-start",
    gap: 15,
  },
  itemWrapper: {
    width: imageWidth,
  },
  emptyContainer: {
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 16,
  },
  footer: {
    paddingVertical: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  loadMoreButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 8,
  },
  loadMoreText: {
    color: "#fff",
    fontWeight: "600",
  },
});
