import { Pressable, StyleSheet, View } from "react-native";
import { router } from "expo-router";
import Icon from "./Icon";
import Text from "./Text";
import Thumbnail, { ThumbnailSizes } from "./Thumbnail";
import { useGetMyRatingsQuery } from "../redux/ratings/ratingsApi";
import { colors, fontSize, fontWeight, radius, spacing } from "../constants/design";

const POSTER_W = 38;
const POSTER_H = 56;

function StarRow({ rating }: { rating: number }) {
  return (
    <View style={styles.starRow}>
      {Array.from({ length: 10 }, (_, i) => (
        <Icon
          key={i}
          source={i < rating ? "star" : "star-outline"}
          size={9}
          color={i < rating ? "#FFD700" : colors.border}
        />
      ))}
      <Text style={styles.ratingNum}>{rating}/10</Text>
    </View>
  );
}

export default function RecentRatings() {
  const { data, isLoading } = useGetMyRatingsQuery({ limit: 5 });

  if (isLoading) {
    return (
      <View style={styles.placeholder}>
        <Icon source="loading" size={14} color={colors.textSecondary} />
        <Text style={styles.placeholderText}>Loading…</Text>
      </View>
    );
  }

  const ratings = data?.ratings ?? [];

  if (ratings.length === 0) {
    return (
      <View style={styles.placeholder}>
        <Text style={styles.placeholderText}>No ratings yet</Text>
      </View>
    );
  }

  return (
    <View style={styles.list}>
      {ratings.map((item, index) => (
        <Pressable
          key={item.id}
          style={[styles.row, index < ratings.length - 1 && styles.rowBorder]}
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
            container={{ width: POSTER_W, height: POSTER_H, borderRadius: radius.xs + 2 }}
            showsPlaceholder={false}
            priority="low"
          />
          <View style={styles.info}>
            <Text style={styles.title} numberOfLines={1}>
              {item.content?.title ?? `#${item.contentId}`}
            </Text>
            <StarRow rating={item.rating} />
            {!!item.review && (
              <Text style={styles.review} numberOfLines={1}>{item.review}</Text>
            )}
          </View>
          <Icon source="chevron-right" size={14} color={colors.textSecondary} />
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  placeholder: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingVertical: spacing.md + 2,
  },
  placeholderText: { fontSize: fontSize.sm + 1, color: colors.placeholder },

  list: {
    backgroundColor: colors.surface,
    borderRadius: radius.md + 2,
    overflow: "hidden",
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    padding: spacing.md + 2,
  },
  rowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },

  info: { flex: 1, gap: spacing.xs },
  title: { fontSize: fontSize.md, fontWeight: fontWeight.semibold, color: colors.text },

  starRow: { flexDirection: "row", alignItems: "center", gap: 2 },
  ratingNum: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    color: "#FFD700",
    marginLeft: spacing.xs,
  },

  review: { fontSize: fontSize.xs + 1, color: colors.placeholder },
});
