import { memo, useCallback, useEffect, useRef } from "react";
import { Dimensions, RefreshControl, View, VirtualizedList } from "react-native";
import { Text } from "react-native-paper";
import Animated, { FadeIn } from "react-native-reanimated";
import { useInfiniteLandingPageMovies } from "../../hooks/useInfiniteLandingPageMovies";
import useTranslation from "../../service/useTranslation";
import FeaturedSection from "./FeaturedSection";
import Section from "./Section";
import GameInviteSection from "./GameInviteSection";
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

const gameTypes: ("social" | "voter" | "fortune" | "all-games")[] = ["social", "voter", "fortune", "all-games"];

const CategoryPage = memo(({ categoryId }: CategoryPageProps) => {
  const t = useTranslation();

  const { data, isLoading, isError, hasMore, fetchNextPage, refetch, isRefreshing } = useInfiniteLandingPageMovies({ categoryId });

  const onEndReached = useCallback(() => {
    if (!isError && hasMore) {
      fetchNextPage();
    }
  }, [isError, hasMore, fetchNextPage]);

  const renderItem = useCallback(({ item }: { item: SectionData }) => {
    if (!item || typeof item !== "object") return null;
    return <Section group={item} />;
  }, []);

  const categoryKeyExtractor = useCallback((item: any) => `${categoryId}-section-${item.name || "unknown"}`, [categoryId]);

  const ItemSeparator = useCallback(
    ({ leadingItem }: { leadingItem: any }) => {
      const index = data.findIndex((item) => item === leadingItem);
      if ((index + 1) % 5 === 0) {
        const gameTypeIndex = Math.floor((index + 1) / 5) - 1;
        const gameType = gameTypes[gameTypeIndex % gameTypes.length];
        return <GameInviteSection type={gameType} />;
      }
      return null;
    },
    [data]
  );

  return (
    <View style={{ flex: 1 }}>
      <VirtualizedList
        overScrollMode={"never"}
        bounces={false}
        initialNumToRender={4}
        maxToRenderPerBatch={4}
        windowSize={3}
        data={data}
        renderItem={renderItem as any}
        keyExtractor={categoryKeyExtractor}
        getItemCount={getItemCount}
        getItem={getItem}
        onEndReached={onEndReached}
        onEndReachedThreshold={0.25}
        ListHeaderComponent={<FeaturedSection selectedChip={categoryId} />}
        contentContainerStyle={{ paddingTop: 100, paddingBottom: 50 }}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={refetch} />}
        ItemSeparatorComponent={ItemSeparator}
        style={{ flex: 1 }}
        ListFooterComponent={
          <View style={{ minHeight: 200 }}>
            {isLoading ? (
              <LoadingSkeleton />
            ) : hasMore ? (
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
    </View>
  );
});

function CategoryPageMemoized(props: CategoryPageProps) {
  return <CategoryPage {...props} />;
}

export default memo(CategoryPageMemoized);
