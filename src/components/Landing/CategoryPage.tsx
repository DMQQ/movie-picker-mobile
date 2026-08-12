import { memo, useCallback, useMemo } from "react";
import Text from "../Text";
import { colors, fontWeight, fontSize, spacing} from "../../constants/design";
import {
  RefreshControl,
  StyleSheet,
  View,
  VirtualizedList,
} from "react-native";

import { useInfiniteLandingPageMovies } from "../../hooks/useInfiniteLandingPageMovies";
import useTranslation from "../../service/useTranslation";
import FeaturedSection from "./FeaturedSection";
import Section, { SECTION_HEIGHT } from "./Section";
import LoadingSkeleton from "./LoadingSkeleton";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { SectionData } from "../../types";

const getItemCount = (data: any) => data?.length || 0;
const getItem = (data: any, index: number) => data[index];

const styles = StyleSheet.create({
  listContent: {
    paddingTop: spacing.xl * 5,
  },
  footer: {
    height: 250,
  },
  noMoreContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: spacing.xxl + 16,
    paddingBottom: spacing.xl,
    paddingHorizontal: spacing.xl,
  },
  noMoreText: {
    color: colors.text,
    fontSize: fontSize.xl,
    fontWeight: fontWeight.semibold,
    textAlign: "center",
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  noMoreSubtitle: {
    color: "rgba(255, 255, 255, 0.6)",
    fontSize: fontSize.md,
    textAlign: "center",
  },
  flex: {
    flex: 1,
  },
});

interface CategoryPageProps {
  categoryId: string;
}

const getItemLayout = (_: any, index: number) => ({
  length: SECTION_HEIGHT,
  offset: SECTION_HEIGHT * index,
  index,
});

const categoryKeyExtractor = (item: any) => item.name.toString();

const renderItem = ({ item }: { item: SectionData }) => {
  if (!item || typeof item !== "object") return null;
  return <Section group={item} />;
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

  const refreshControl = useMemo(
    () => (
      <RefreshControl
        refreshing={isRefreshing}
        onRefresh={refetch}
        tintColor={colors.placeholder}
        colors={[colors.primary]}
      />
    ),
    [isRefreshing, refetch],
  );

  const featuredSection = useMemo(
    () => <FeaturedSection categoryId={categoryId} />,
    [categoryId],
  );

  const listFooterComponent = useMemo(
    () => (
      <View style={styles.footer}>
        {isLoading || hasMore ? (
          <LoadingSkeleton />
        ) : (
          <View style={styles.noMoreContainer}>
            <MaterialCommunityIcons
              name="check"
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
      ListFooterComponent={listFooterComponent}
    />
  );
});

function CategoryPageMemoized(props: CategoryPageProps) {
  return <CategoryPage categoryId={props.categoryId} />;
}

export default memo(CategoryPageMemoized);
