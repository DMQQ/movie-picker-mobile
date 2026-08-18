import { useEffect, useMemo } from "react";
import { Dimensions, StyleSheet, View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { FlashList, ListRenderItemInfo } from "@shopify/flash-list";
import { Movie } from "../../types";
import SectionListItem from "../components/SectionItem";
import Skeleton from "../components/Skeleton/Skeleton";
import SafeIOSContainer from "../components/SafeIOSContainer";
import PageHeading from "../components/PageHeading";
import { colors, radius, spacing } from "../constants/design";
import {
  useLazyGetSectionMoviesQuery,
  useGetSectionMoviesPagesInfiniteQuery,
} from "../redux/movie/movieApi";

const { width: screenWidth } = Dimensions.get("screen");

const NUM_COLS = 3;
const SIDE_PAD = spacing.screen;
const GAP = spacing.sm;
const ITEM_W = Math.floor((screenWidth - SIDE_PAD * 2 - GAP * (NUM_COLS - 1)) / NUM_COLS);
const ITEM_H = Math.round(ITEM_W * 1.5);

const HEADER_OFFSET = spacing.xxl * 3 + spacing.lg;

export default function SectionMoviesScreen() {
  const { name } = useLocalSearchParams<{ name: string }>();

  const [fetchPage1, page1] = useLazyGetSectionMoviesQuery();

  const { data: infiniteData, isFetching, fetchNextPage, hasNextPage } =
    useGetSectionMoviesPagesInfiniteQuery({ name });

  useEffect(() => {
    if (name) fetchPage1({ name, page: 1 });
  }, [name]);

  const movies = useMemo<Movie[]>(() => {
    const page1Results = page1.data?.results ?? [];
    const extraPages = infiniteData?.pages?.flatMap((p) => p.results) ?? [];
    const seen = new Set<number>(page1Results.map((m) => m.id));
    return [...page1Results, ...extraPages.filter((m) => !seen.has(m.id))];
  }, [page1.data, infiniteData]);

  const renderItem = ({ item }: ListRenderItemInfo<Movie>) => (
    <View style={styles.cell}>
      <SectionListItem {...item} imageWidth={ITEM_W} hideTitle={true} />
    </View>
  );

  const listHeader = <View style={styles.listHeader} />;

  return (
    <SafeIOSContainer style={styles.container}>
      <PageHeading title={name ?? ""} />

      {page1.isLoading ? (
        <View style={styles.skeletonWrap}>
          {Array.from({ length: 9 }).map((_, i) => (
            <Skeleton key={i}>
              <View style={styles.skeletonCell} />
            </Skeleton>
          ))}
        </View>
      ) : (
        <FlashList
          data={movies}
          keyExtractor={(item) => `${item.id}-${item.type}`}
          renderItem={renderItem}
          numColumns={NUM_COLS}
          estimatedItemSize={ITEM_H + GAP}
          ListHeaderComponent={listHeader}
          contentContainerStyle={styles.list}
          onEndReached={() => {
            if (!isFetching && hasNextPage) fetchNextPage();
          }}
          onEndReachedThreshold={0.4}
          ListFooterComponent={
            isFetching ? (
              <View style={styles.footerRow}>
                {Array.from({ length: NUM_COLS }).map((_, i) => (
                  <Skeleton key={i}>
                    <View style={[styles.skeletonCell, i > 0 && { marginLeft: GAP }]} />
                  </Skeleton>
                ))}
              </View>
            ) : null
          }
        />
      )}
    </SafeIOSContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.appBackground,
    paddingBottom: 0,
  },
  list: {
    paddingLeft: SIDE_PAD,
    paddingRight: SIDE_PAD - GAP,
    paddingBottom: spacing.xxl,
  },
  listHeader: {
    height: HEADER_OFFSET,
  },
  cell: {
    marginRight: GAP,
    marginBottom: GAP,
  },
  skeletonWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingLeft: SIDE_PAD,
    paddingRight: SIDE_PAD - GAP,
    paddingTop: HEADER_OFFSET,
  },
  skeletonCell: {
    width: ITEM_W,
    height: ITEM_H,
    borderRadius: radius.xs + 1,
    backgroundColor: colors.surfaceElevated,
    marginRight: GAP,
    marginBottom: GAP,
  },
  footerRow: {
    flexDirection: "row",
    paddingLeft: SIDE_PAD,
    paddingTop: GAP,
  },
});
