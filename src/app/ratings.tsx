import { FlatList, Pressable, StyleSheet, View } from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Icon from "../components/Icon";
import Text from "../components/Text";
import PageHeading from "../components/PageHeading";
import Thumbnail, { ThumbnailSizes } from "../components/Thumbnail";
import { useGetMyRatingsQuery, type UserRating } from "../redux/ratings/ratingsApi";
import { colors, fontSize, fontWeight, radius, spacing } from "../constants/design";

const POSTER_W = 42;
const POSTER_H = 62;

function formatRatingDate(unix: number) {
  return new Date(unix * 1000).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function RatingRow({ item }: { item: UserRating }) {
  return (
    <Pressable
      style={styles.row}
      onPress={() =>
        router.push({
          pathname: "/movie/type/[type]/[id]",
          params: { type: item.contentType, id: String(item.contentId) },
        } as any)
      }
    >
      <Thumbnail
        path={item.content?.poster_path ?? ""}
        size={ThumbnailSizes.poster.small}
        container={{
          width: POSTER_W,
          height: POSTER_H,
          borderRadius: radius.xs + 2,
        }}
        showsPlaceholder={false}
        priority="low"
      />
      <View style={styles.rowInfo}>
        <Text style={styles.rowTitle} numberOfLines={1}>
          {item.content?.title ?? `#${item.contentId}`}
        </Text>
        <View style={styles.starRow}>
          {Array.from({ length: 10 }, (_, i) => (
            <Icon
              key={i}
              source={i < item.rating ? "star" : "star-outline"}
              size={10}
              color={i < item.rating ? "#FFD700" : colors.border}
            />
          ))}
          <Text style={styles.ratingNum}>{item.rating}/10</Text>
        </View>
        {item.review ? (
          <Text style={styles.reviewText} numberOfLines={2}>
            {item.review}
          </Text>
        ) : null}
        <Text style={styles.dateText}>
          {formatRatingDate(item.createdAt)}
        </Text>
      </View>
      <Icon source="chevron-right" size={14} color={colors.textSecondary} />
    </Pressable>
  );
}

export default function AllRatingsScreen() {
  const { data, isLoading } = useGetMyRatingsQuery({ limit: 100 });
  const ratings = [...(data?.ratings ?? [])].reverse();
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <PageHeading title="My Reviews" />

      <FlatList
        data={ratings}
        showsVerticalScrollIndicator={false}
        keyExtractor={(r) => r.id}
        renderItem={({ item }) => <RatingRow item={item} />}
        contentContainerStyle={{
          paddingBottom: insets.bottom + 24,
          paddingHorizontal: spacing.lg,
        }}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListHeaderComponent={
          ratings.length > 0 ? (
            <Text style={styles.countLabel}>
              {data?.total ?? ratings.length} reviews
            </Text>
          ) : null
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            {isLoading ? (
              <Icon source="loading" size={28} color="rgba(255,255,255,0.2)" />
            ) : (
              <>
                <Icon
                  source="star-outline"
                  size={44}
                  color="rgba(255,255,255,0.07)"
                />
                <Text style={styles.emptyText}>No reviews yet</Text>
                <Text style={styles.emptyHint}>
                  Rate movies you've watched to see them here
                </Text>
              </>
            )}
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.appBackground },

  countLabel: {
    fontSize: fontSize.sm - 1,
    color: "rgba(255,255,255,0.25)",
    paddingTop: spacing.xxl * 5,
    paddingBottom: spacing.xs,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingVertical: spacing.md,
  },
  rowInfo: { flex: 1, gap: spacing.xs },
  rowTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.text,
  },

  starRow: { flexDirection: "row", alignItems: "center", gap: 2 },
  ratingNum: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    color: "#FFD700",
    marginLeft: spacing.xs,
  },

  reviewText: {
    fontSize: fontSize.sm + 1,
    color: "rgba(255,255,255,0.45)",
    lineHeight: fontSize.sm + 6,
  },
  dateText: {
    fontSize: fontSize.xs,
    color: "rgba(255,255,255,0.25)",
  },

  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
  },

  empty: { alignItems: "center", gap: spacing.sm + 2, paddingTop: spacing.xxl * 3 },
  emptyText: {
    fontSize: fontSize.md + 1,
    fontWeight: fontWeight.semibold,
    color: "rgba(255,255,255,0.25)",
  },
  emptyHint: {
    fontSize: fontSize.md - 1,
    color: "rgba(255,255,255,0.15)",
    textAlign: "center",
    paddingHorizontal: spacing.xxl + 16,
  },
});
