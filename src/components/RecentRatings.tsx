import { Pressable, StyleSheet, View } from "react-native";
import { router } from "expo-router";
import Icon from "./Icon";
import Text from "./Text";
import Thumbnail, { ThumbnailSizes } from "./Thumbnail";
import { useGetMyRatingsQuery } from "../redux/ratings/ratingsApi";
import { colors, fontSize, fontWeight, radius, spacing } from "../constants/design";
import useTranslation from "../service/useTranslation";

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
  const t = useTranslation();

  const ratings = data?.ratings ?? [];
  const recent = [...ratings].reverse().slice(0, FAN_COUNT);
  const posterRatings = recent.filter((r) => !!r.content?.poster_path);

  if (isLoading) {
    return (
      <View style={styles.placeholder}>
        <Icon source="loading" size={14} color={colors.textSecondary} />
        <Text style={styles.placeholderText}>{t("room.builder.loading") as string}</Text>
      </View>
    );
  }

  if (ratings.length === 0) {
    return (
      <View style={styles.emptyCard}>
        <View style={styles.emptyIconWrap}>
          <Icon source="star-outline" size={22} color={colors.placeholder} />
        </View>
        <View style={styles.emptyText}>
          <Text style={styles.emptyTitle}>{t("ratings.noRatingsYet") as string}</Text>
          <Text style={styles.emptySub}>{t("ratings.emptyHint") as string}</Text>
        </View>
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
          {t("ratings.reviewCount", {
            count: ratings.length,
            plural: ratings.length === 1 ? "" : "s",
          }) as string}
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
            <Text style={styles.statValue}>{t("ratings.avgLabel", { avg: avgRating }) as string}</Text>
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

  emptyCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.xl,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  emptyIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.overlay,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: { flex: 1, gap: spacing.xs - 2 },
  emptyTitle: { fontSize: fontSize.md, fontWeight: fontWeight.semibold, color: colors.text },
  emptySub: { fontSize: fontSize.sm, color: mutedText },

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
