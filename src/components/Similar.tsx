import { useNavigation } from "@react-navigation/native";
import { memo, useCallback, useEffect, useState } from "react";
import { Dimensions, StyleSheet, Text, View } from "react-native";

import { FlashList } from "@shopify/flash-list";
import { Movie } from "../../types";
import { useLazyGetSimilarQuery } from "../redux/movie/movieApi";
import useTranslation from "../service/useTranslation";
import SectionListItem from "./SectionItem";
import { prefetchThumbnail, ThumbnailSizes } from "./Thumbnail";

const { width } = Dimensions.get("screen");

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
      <SectionListItem
        {...item}
        onPress={() =>
          navigation.push("MovieDetails", {
            id: item.id,
            type: type,
            img: item.poster_path,
          })
        }
      />
    ),
    []
  );

  const t = useTranslation();

  if (!movies.length) return null;

  return (
    <View style={sectionStyles.container}>
      <Text style={sectionStyles.title}>{type === "movie" ? t("movie.details.similar-movies") : t("movie.details.similar-series")}</Text>
      <FlashList
        onEndReached={onEndReached}
        data={(movies || []) as any}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={keySectionExtractor}
        renderItem={renderItem}
        onEndReachedThreshold={0.5}
        estimatedItemSize={width * 0.3 + 15}
      />
    </View>
  );
});

const sectionStyles = StyleSheet.create({
  container: { marginVertical: 10, height: Math.min(width * 0.3, 200) * 1.5 + 30, marginTop: 30 },
  title: { color: "#fff", fontSize: 35, marginBottom: 10, fontFamily: "Bebas" },
  list: {
    flex: 1,
    height: Math.min(width * 0.3, 200) * 1.42,
  },
  listContainer: {
    justifyContent: "flex-start",
    alignItems: "center",
  },

  image: {
    width: Math.min(width * 0.3, 200),
    height: Math.min(width * 0.3, 200) * 1.42,
    borderRadius: 7.5,
    marginRight: 15,
  },
});

const keySectionExtractor = (item: any, index: number) => item.id.toString() + "-" + item.type + "-" + index;

export default Similar;
