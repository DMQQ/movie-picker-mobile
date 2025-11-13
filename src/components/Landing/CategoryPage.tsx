import { useNavigation } from "@react-navigation/native";
import { memo, useCallback, useEffect, useRef } from "react";
import { Dimensions, RefreshControl, View, VirtualizedList } from "react-native";
import { Text } from "react-native-paper";
import Animated, { FadeIn, useAnimatedScrollHandler, useSharedValue } from "react-native-reanimated";
import { useInfiniteLandingPageMovies } from "../../hooks/useInfiniteLandingPageMovies";
import { SectionData } from "../../service/useLanding";
import useTranslation from "../../service/useTranslation";
import FeaturedSection from "./FeaturedSection";
import Section from "./Section";
import GameInviteSection from "./GameInviteSection";
import LoadingSkeleton from "./LoadingSkeleton";
import FontAwesome from "@expo/vector-icons/FontAwesome";

const { width } = Dimensions.get("screen");

const AnimatedVirtualizedList = Animated.createAnimatedComponent(VirtualizedList);

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

  isBecomingActive?: boolean;
}

const CategoryPage = memo(({ categoryId }: CategoryPageProps) => {
  const navigation = useNavigation<any>();
  const t = useTranslation();

  const { data, isLoading, isError, hasMore, fetchNextPage, refetch, isRefreshing } = useInfiniteLandingPageMovies({ categoryId });

  const onEndReached = useCallback(() => {
    if (!isError && hasMore) {
      fetchNextPage();
    }
  }, [isError, hasMore, fetchNextPage]);

  const scrollY = useSharedValue(0);
  const onScroll = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  const getItemLayout = useCallback((data: SectionData[], index: number) => {
    const item = data?.[index];
    const isGame = item && "type" in item && item.type === "game";
    const itemHeight = isGame ? 210 : Math.min(width * 0.3, 200) * 1.75 + 50;

    let offset = 0;
    for (let i = 0; i < index; i++) {
      const prevItem = data?.[i];
      const prevIsGame = prevItem && "type" in prevItem && prevItem.type === "game";
      offset += prevIsGame ? 210 : Math.min(width * 0.3, 200) * 1.75 + 50;
    }

    return { length: itemHeight, offset, index };
  }, []);

  const renderItem = useCallback(
    ({ item }: { item: SectionData }) => {
      if (!item || typeof item !== "object") return null;

      if ("type" in item && item.type === "game") {
        return <GameInviteSection type={item.gameType} navigation={navigation} />;
      }

      return <Section group={item} categoryId={categoryId} />;
    },
    [navigation, categoryId]
  );

  const categoryKeyExtractor = useCallback(
    (item: any, index: number) => {
      if (!item || typeof item !== "object") return `${categoryId}-section-empty-${index}`;
      if (item?.type === "game") {
        return `${categoryId}-section-${item.gameType || "unknown"}-${index}`;
      }
      return `${categoryId}-section-${item.name || "unknown"}-${index}`;
    },
    [categoryId]
  );

  return (
    <View style={{ flex: 1 }}>
      <AnimatedVirtualizedList
        extraData={categoryId}
        overScrollMode={"never"}
        bounces={false}
        initialNumToRender={3}
        onScroll={onScroll}
        data={data}
        renderItem={renderItem as any}
        keyExtractor={categoryKeyExtractor}
        getItemCount={getItemCount}
        getItem={getItem}
        onEndReached={onEndReached}
        removeClippedSubviews
        onEndReachedThreshold={0.1}
        ListHeaderComponent={<FeaturedSection selectedChip={categoryId} navigate={navigation.navigate} />}
        contentContainerStyle={{ paddingTop: 100, paddingBottom: 50 }}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={refetch} />}
        getItemLayout={getItemLayout}
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
  const hasRendered = useRef(false);

  useEffect(() => {
    if (props.isBecomingActive) {
      hasRendered.current = true;
    }
  }, [props.isBecomingActive]);

  if (!props.isBecomingActive && !hasRendered.current) {
    return <View style={{ flex: 1 }} />;
  }

  return <CategoryPage {...props} />;
}

export default memo(CategoryPageMemoized);
