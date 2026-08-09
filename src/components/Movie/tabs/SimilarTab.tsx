import { memo, useEffect, useState } from "react";
import Text from "../../Text";
import { colors, fontWeight, fontSize, radius, spacing} from "../../../constants/design";
import {
  Dimensions,
  StyleSheet,
  View,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { Movie } from "../../../../types";
import { useLazyGetSimilarQuery } from "../../../redux/movie/movieApi";
import SectionListItem from "../../SectionItem";

import useTranslation from "../../../service/useTranslation";
import uniqueBy from "../../../utils/unique";

const { width } = Dimensions.get("screen");

const imageWidth = (width - 45) / 2;

interface SimilarTabProps {
  id: number;
  type: "movie" | "tv";
  initialData?: { results: Movie[]; page: number; total_pages: number };
}

function SimilarTab({ id, type, initialData }: SimilarTabProps) {
  const [page, setPage] = useState(initialData?.page || 1);
  const [getSectionMovies, state] = useLazyGetSimilarQuery();
  const [movies, setSectionMovies] = useState<Movie[]>(
    initialData?.results || [],
  );
  const [hasMore, setHasMore] = useState(
    initialData ? initialData.page < initialData.total_pages : true,
  );

  const t = useTranslation();

  useEffect(() => {
    if (initialData && page === initialData.page) {
      return;
    }

    getSectionMovies({ id: id, type: type, page }).then((response) => {
      if (response.data && Array.isArray(response.data.results)) {
        setHasMore(
          response?.data
            ? response.data.page < response.data.total_pages
            : false,
        );

        setSectionMovies((prev) =>
          uniqueBy(prev.concat(response?.data?.results || []), "id"),
        );
      }
    });
  }, [page, id, type, initialData]);

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
            <SectionListItem {...item} type={type} imageWidth={imageWidth} />
          </View>
        ))}
      </View>

      {hasMore && (
        <View style={styles.footer}>
          {state.isLoading ? (
            <ActivityIndicator size="small" color={colors.text} />
          ) : (
            <TouchableOpacity
              style={styles.loadMoreButton}
              onPress={handleLoadMore}
              activeOpacity={0.7}
            >
              <Text style={styles.loadMoreText}>
                {t("movie.similar.load_more")}
              </Text>
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
    paddingHorizontal: spacing.screen,
    paddingTop: spacing.sm + 2,
  },
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: 15,
  },
  itemWrapper: {
    width: imageWidth,
  },
  emptyContainer: {
    padding: spacing.xl,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    color: "rgba(255,255,255,0.6)",
    fontSize: fontSize.lg,
  },
  footer: {
    paddingVertical: spacing.xl,
    alignItems: "center",
    justifyContent: "center",
  },
  loadMoreButton: {
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.xl,
    backgroundColor: colors.border,
    borderRadius: radius.sm,
  },
  loadMoreText: {
    color: colors.text,
    fontWeight: fontWeight.semibold,
  },
});
