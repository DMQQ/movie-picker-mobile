import { Pressable, StyleSheet, View } from "react-native";
import { router } from "expo-router";
import Icon from "./Icon";
import Text from "./Text";
import Thumbnail, { ThumbnailSizes } from "./Thumbnail";
import { useGetMyRatingsQuery } from "../redux/ratings/ratingsApi";
import { colors, fontSize, fontWeight, radius, spacing } from "../constants/design";

const mutedText = "rgba(255,255,255,0.45)";

const FAN_COUNT = 3;
const POSTER_W = 42;
const POSTER_H = 62;
const FAN_OFFSET = 16;

function formatDate(unix: number) {
  return new Date(unix * 1000).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

export default function RecentRatings() {
  const { data, isLoading } = useGetMyRatingsQuery({ limit: 20 });

  const ratings = data?.ratings ?? [];
  const recent = [...ratings].reverse().slice(0, FAN_COUNT);
  const posterRatings = recent.filter((r) => !!r.content?.poster_path);

  if (isLoading) {
    return (
      <View style={styles.placeholder}>
        <Icon source="loading" size={14} color={colors.textSecondary} />
        <Text style={styles.placeholderText}>Loading…</Text>
      </View>
    );
  }

  if (ratings.length === 0) {
    return (
      <View style={styles.placeholder}>
        <Text style={styles.placeholderText}>No ratings yet</Text>
      </View>
    );
  }

  const avgRating = Math.round(
    ratings.reduce((s, r) => s + r.rating, 0) / ratings.length,
  );

  return (
    <Pressable
      style={styles.card}
      onPress={() => router.push("/ratings" as any)}
    >
      <View style={styles.fanWrap}>
        {posterRatings.map((r, i) => (
          <View
            key={r.id}
            style={[
              styles.fanCard,
              { left: i * FAN_OFFSET, zIndex: FAN_COUNT - i },
            ]}
          >
            <Thumbnail
              path={r.content!.poster_path!}
              size={ThumbnailSizes.poster.small}
              container={{
                width: POSTER_W,
                height: POSTER_H,
                borderRadius: radius.xs + 2,
              }}
              showsPlaceholder={false}
              priority="low"
            />
          </View>
        ))}
        {posterRatings.length === 0 && (
          <View style={[styles.fanCard, { left: 0, zIndex: 1 }]}>
            <View style={styles.noPoster}>
              <Icon source="star-outline" size={18} color={colors.textSecondary} />
            </View>
          </View>
        )}
      </View>

      <View style={styles.info}>
        <Text style={styles.title}>
          {ratings.length} {ratings.length === 1 ? "review" : "reviews"}
        </Text>
        <View style={styles.meta}>
          <View style={styles.stat}>
            {Array.from({ length: 10 }, (_, i) => (
              <Icon
                key={i}
                source={i < avgRating ? "star" : "star-outline"}
                size={10}
                color={i < avgRating ? "#FFD700" : colors.border}
              />
            ))}
            <Text style={styles.statValue}>{avgRating}/10 avg</Text>
          </View>
          <View style={styles.latestRow}>
            <Icon source="clock-outline" size={10} color={colors.textSecondary} />
            <Text style={styles.latest}>
              {formatDate(recent[recent.length - 1].createdAt)}
            </Text>
          </View>
        </View>
      </View>

      <Icon source="chevron-right" size={16} color={colors.textSecondary} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  placeholder: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingVertical: spacing.md + 2,
  },
  placeholderText: { fontSize: fontSize.sm + 1, color: mutedText },

  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md + 2,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.lg,
  },

  fanWrap: {
    width: POSTER_W + (FAN_COUNT - 1) * FAN_OFFSET,
    height: POSTER_H,
    position: "relative",
  },
  fanCard: {
    position: "absolute",
    top: 0,
    borderRadius: radius.xs + 2,
    overflow: "hidden",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 4,
  },
  noPoster: {
    width: POSTER_W,
    height: POSTER_H,
    borderRadius: radius.xs + 2,
    backgroundColor: colors.overlay,
    alignItems: "center",
    justifyContent: "center",
  },

  info: { flex: 1, gap: spacing.xs },
  title: { fontSize: fontSize.lg - 1, fontWeight: fontWeight.bold, color: colors.text },
  meta: { gap: spacing.xs - 2 },
  stat: { flexDirection: "row", alignItems: "center", gap: spacing.xs },
  statValue: { fontSize: fontSize.sm, fontWeight: fontWeight.semibold, color: "#FFD700" },
  latestRow: { flexDirection: "row", alignItems: "center", gap: spacing.xs },
  latest: { fontSize: fontSize.xs + 1, color: mutedText },
});
