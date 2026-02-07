import { Fragment, memo, useCallback } from "react";
import { RefreshControl, View, VirtualizedList } from "react-native";
import { Text } from "react-native-paper";
import Animated, { FadeIn } from "react-native-reanimated";
import { useInfiniteLandingPageMovies } from "../../hooks/useInfiniteLandingPageMovies";
import useTranslation from "../../service/useTranslation";
import FeaturedSection from "./FeaturedSection";
import Section, { SECTION_HEIGHT } from "./Section";
import GameInviteSection, { GAME_SECTION_HEIGHT } from "./GameInviteSection";
import LoadingSkeleton from "./LoadingSkeleton";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { SectionData } from "../../types";

const getItemCount = (data: any) => data?.length || 0;
const getItem = (data: any, index: number) => data[index];

const noMoreResultsStyles = {
  container: {
    alignItems: "center" as const,
    justifyContent: "center" as const,
    paddingTop: 40,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  text: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600" as const,
    textAlign: "center" as const,
    marginTop: 12,
    marginBottom: 4,
  },
  subtitle: {
    color: "rgba(255, 255, 255, 0.6)",
    fontSize: 14,
    textAlign: "center" as const,
  },
};

interface CategoryPageProps {
  categoryId: string;
}

const GAME_SECTION_EXTRA_HEIGHT = GAME_SECTION_HEIGHT;

const getItemLayout = (_: any, index: number) => {
  const gameItemsBefore = Math.ceil(index / 5);
  const offset = index * SECTION_HEIGHT + gameItemsBefore * GAME_SECTION_EXTRA_HEIGHT;
  const isGameItem = index % 5 === 0;
  const length = isGameItem ? SECTION_HEIGHT + GAME_SECTION_EXTRA_HEIGHT : SECTION_HEIGHT;

  return { length, offset, index };
};

const categoryKeyExtractor = (item: any) => item.name.toString();

const gameTypes: ("social" | "quick" | "voter" | "fortune" | "all-games")[] = ["social", "quick", "voter", "fortune", "all-games"];

const CategoryPage = memo(({ categoryId }: CategoryPageProps) => {
  const t = useTranslation();

  const { data, isLoading, isError, hasMore, fetchNextPage, refetch, isRefreshing } = useInfiniteLandingPageMovies({ categoryId });

  const onEndReached = useCallback(() => {
    if (!isError && hasMore) {
      fetchNextPage();
    }
  }, [isError, hasMore, fetchNextPage]);

  const renderItem = useCallback(({ item, index }: { item: SectionData; index: number }) => {
    if (!item || typeof item !== "object") return null;
    const showGameSection = index % 5 === 0;
    const gameTypeIndex = index === 0 ? 0 : Math.floor(index / 5);
    return (
      <View>
        {showGameSection ? <GameInviteSection type={gameTypes[gameTypeIndex % gameTypes.length]} /> : null}

        <Section group={item} />
      </View>
    );
  }, []);

  return (
    <VirtualizedList
      removeClippedSubviews={false}
      overScrollMode={"never"}
      bounces={false}
      windowSize={5}
      initialNumToRender={5}
      data={data}
      renderItem={renderItem}
      keyExtractor={categoryKeyExtractor}
      getItemCount={getItemCount}
      getItem={getItem}
      getItemLayout={getItemLayout}
      onEndReached={onEndReached}
      onEndReachedThreshold={0.25}
      ListHeaderComponent={<FeaturedSection selectedChip={categoryId} />}
      contentContainerStyle={{ paddingTop: 100, paddingBottom: 50 }}
      refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={refetch} />}
      style={{ flex: 1 }}
      ListFooterComponent={
        <View style={{ height: 250 }}>
          {isLoading || hasMore ? (
            <LoadingSkeleton />
          ) : (
            <Animated.View style={noMoreResultsStyles.container} entering={FadeIn.duration(400)}>
              <FontAwesome name="check-circle" size={32} color="rgba(255, 255, 255, 0.6)" />
              <Text style={noMoreResultsStyles.text}>{t("landing.no_more_results")}</Text>
              <Text style={noMoreResultsStyles.subtitle}>{t("landing.reached_end")}</Text>
            </Animated.View>
          )}
        </View>
      }
    />
  );
});

function CategoryPageMemoized(props: CategoryPageProps) {
  return <CategoryPage {...props} />;
}

export default memo(CategoryPageMemoized);
