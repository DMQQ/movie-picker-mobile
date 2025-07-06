import React, { memo, useCallback, useEffect, useMemo, useState } from "react";
import { Dimensions, Pressable, StyleSheet, Text, View, VirtualizedList } from "react-native";
import { useNavigation } from "@react-navigation/native";

import { Movie } from "../../types";
import { useLazyGetSimilarQuery } from "../redux/movie/movieApi";
import ScoreRing from "./ScoreRing";
import useTranslation from "../service/useTranslation";
import Thumbnail, { prefetchThumbnail, ThumbnailSizes } from "./Thumbnail";

const { width, height } = Dimensions.get("window");

const Similar = memo(({ id, type }: { id: number; type: "movie" | "tv" }) => {
  const navigation = useNavigation<any>();
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
        if (response?.data) Promise.any(response.data.results.map((i) => prefetchThumbnail(i.poster_path, ThumbnailSizes.poster.xxlarge)));
      }
    });
  }, [page]);

  const renderItem = useCallback(
    ({ item }: { item: Movie & { type: string } }) => (
      <Pressable
        onPress={() =>
          navigation.push("MovieDetails", {
            id: item.id,
            type: type,
            img: item.poster_path,
          })
        }
        style={{
          position: "relative",
        }}
      >
        <Thumbnail contentFit="cover" container={sectionStyles.image} size={200} path={item.poster_path} />
        <View style={{ position: "absolute", right: 25, bottom: 5 }}>
          <ScoreRing score={item.vote_average} />
        </View>
      </Pressable>
    ),
    []
  );

  const t = useTranslation();

  if (!movies.length) return null;

  return (
    <View style={sectionStyles.container}>
      <Text style={sectionStyles.title}>{type === "movie" ? t("movie.details.similar-movies") : t("movie.details.similar-series")}</Text>
      <VirtualizedList
        initialNumToRender={5} // Increased from 3
        maxToRenderPerBatch={3} // Reduced from 5
        updateCellsBatchingPeriod={50} // Add this
        windowSize={2}
        removeClippedSubviews={true}
        getItem={getSectionItem}
        getItemCount={getSectionItemCount}
        onEndReached={onEndReached}
        data={(movies || []) as any}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={keySectionExtractor}
        style={sectionStyles.list}
        contentContainerStyle={sectionStyles.listContainer}
        renderItem={renderItem}
        onEndReachedThreshold={0.5}
        maintainVisibleContentPosition={{
          // Add this
          minIndexForVisible: 0,
          autoscrollToTopThreshold: 10,
        }}
      />
    </View>
  );
});

const sectionStyles = StyleSheet.create({
  container: { marginVertical: 10, height: height * 0.2 + 80, marginTop: 30 },
  title: { color: "#fff", fontSize: 45, marginBottom: 5, fontFamily: "Bebas" },
  list: {
    flex: 1,
    height: height * 0.2,
  },
  listContainer: {
    justifyContent: "flex-start",
    alignItems: "center",
  },

  image: {
    width: width * 0.3,
    height: height * 0.2,
    borderRadius: 15,
    marginRight: 20,
  },
});

const getSectionItem = (data: any, index: number) => data[index];
const getSectionItemCount = (data: any) => data.length;

const keySectionExtractor = (item: any, index: number) => item.id.toString() + "-" + index;

export default Similar;
