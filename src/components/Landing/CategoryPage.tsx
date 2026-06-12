import { memo, useCallback, useMemo } from "react";
import {
  RefreshControl,
  StyleSheet,
  View,
  VirtualizedList,
} from "react-native";
import { Text } from "react-native-paper";
import { useInfiniteLandingPageMovies } from "../../hooks/useInfiniteLandingPageMovies";
import useTranslation from "../../service/useTranslation";
import FeaturedSection from "./FeaturedSection";
import Section, { SECTION_HEIGHT } from "./Section";
import GameInviteSection, { GAME_SECTION_HEIGHT } from "./GameInviteSection";
import LoadingSkeleton from "./LoadingSkeleton";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { SectionData } from "../../types";
import { useGetFeaturedQuery } from "../../redux/movie/movieApi";

const getItemCount = (data: any) => data?.length || 0;
const getItem = (data: any, index: number) => data[index];

const styles = StyleSheet.create({
  listContent: {
    paddingTop: 100,
    paddingBottom: 50,
  },
  footer: {
    height: 250,
  },
  noMoreContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 40,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  noMoreText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
    marginTop: 12,
    marginBottom: 4,
  },
  noMoreSubtitle: {
    color: "rgba(255, 255, 255, 0.6)",
    fontSize: 14,
    textAlign: "center",
  },
  flex: {
    flex: 1,
  },
});

interface CategoryPageProps {
  categoryId: string;
}

const GAME_SECTION_EXTRA_HEIGHT = GAME_SECTION_HEIGHT;

const getItemLayout = (_: any, index: number) => {
  const gameItemsBefore = Math.ceil(index / 5);
  const offset =
    index * SECTION_HEIGHT + gameItemsBefore * GAME_SECTION_EXTRA_HEIGHT;
  const isGameItem = index % 5 === 0;
  const length = isGameItem
    ? SECTION_HEIGHT + GAME_SECTION_EXTRA_HEIGHT
    : SECTION_HEIGHT;

  return { length, offset, index };
};

const categoryKeyExtractor = (item: any) => item.name.toString();

const gameTypes: (
  | "social"
  | "quick"
  | "voter"
  | "fortune"
  | "random"
  | "all-games"
)[] = ["social", "quick", "voter", "fortune", "random", "all-games"];

const renderItem = ({ item, index }: { item: SectionData; index: number }) => {
  if (!item || typeof item !== "object") return null;
  const showGameSection = index % 5 === 0;
  const gameTypeIndex = index === 0 ? 0 : Math.floor(index / 5);
  return (
    <>
      {showGameSection ? (
        <GameInviteSection type={gameTypes[gameTypeIndex % gameTypes.length]} />
      ) : null}

      <Section group={item} />
    </>
  );
};

const CategoryPage = memo(({ categoryId }: CategoryPageProps) => {
  const t = useTranslation();

  const {
    data,
    isLoading,
    isError,
    hasMore,
    fetchNextPage,
    refetch,
    isRefreshing,
  } = useInfiniteLandingPageMovies({
    categoryId,
    pageSize: 4,
  });

  const onEndReached = useCallback(() => {
    if (!isError && hasMore) {
      fetchNextPage();
    }
  }, [isError, hasMore, fetchNextPage]);

  const { data: featured, isLoading: isFeaturedLoading } = useGetFeaturedQuery(
    useMemo(
      () => ({
        selectedChip: categoryId || "all",
      }),
      [categoryId],
    ),
  );

  const refreshControl = useMemo(
    () => <RefreshControl refreshing={isRefreshing} onRefresh={refetch} />,
    [isRefreshing, refetch],
  );

  const featuredSection = useMemo(
    () => (
      <FeaturedSection
        isLoading={isFeaturedLoading}
        featured={featured || null}
      />
    ),
    [isFeaturedLoading, featured],
  );

  const listFooterComponent = useMemo(
    () => (
      <View style={styles.footer}>
        {isLoading || hasMore ? (
          <LoadingSkeleton />
        ) : (
          <View style={styles.noMoreContainer}>
            <FontAwesome
              name="check-circle"
              size={32}
              color="rgba(255, 255, 255, 0.6)"
            />
            <Text style={styles.noMoreText}>
              {t("landing.no_more_results")}
            </Text>
            <Text style={styles.noMoreSubtitle}>
              {t("landing.reached_end")}
            </Text>
          </View>
        )}
      </View>
    ),
    [isLoading, hasMore, t],
  );

  return (
    <VirtualizedList
      overScrollMode="never"
      bounces={false}
      initialNumToRender={3}
      data={data}
      renderItem={renderItem}
      keyExtractor={categoryKeyExtractor}
      getItemCount={getItemCount}
      getItem={getItem}
      getItemLayout={getItemLayout}
      onEndReached={onEndReached}
      onEndReachedThreshold={0.25}
      ListHeaderComponent={featuredSection}
      contentContainerStyle={styles.listContent}
      refreshControl={refreshControl}
      style={styles.flex}
      ListFooterComponent={listFooterComponent}
    />
  );
});

function CategoryPageMemoized(props: CategoryPageProps) {
  return <CategoryPage categoryId={props.categoryId} />;
}

export default memo(CategoryPageMemoized);
