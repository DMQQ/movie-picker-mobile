import { FlatList, Pressable, StyleSheet, View } from "react-native";
import Icon from "../../components/Icon";
import Text from "../../components/Text";
import { colors, fontWeight, fontSize, radius, spacing} from "../../constants/design";

import { useSafeAreaInsets } from "react-native-safe-area-context";
import PageHeading from "../../components/PageHeading";
import Thumbnail, { ThumbnailSizes } from "../../components/Thumbnail";
import { useAppSelector } from "../../redux/store";
import { useGetGamesQuery, type UserGame } from "../../redux/lists/listsApi";
import { formatGameType } from "../../utils/formatGameType";
import { router } from "expo-router";
import useTranslation from "../../service/useTranslation";

const POSTER_W = 42;
const POSTER_H = 62;

function MatchCount({ count }: { count: number }) {
  const t = useTranslation();
  const key = count !== 1 ? "games.matchCountPlural" : "games.matchCountSingular";
  return <Text style={styles.chipText}>{t(key).replace("{count}", String(count))}</Text>;
}

function formatDate(unix: number) {
  return new Date(unix * 1000).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function GameRow({ item }: { item: UserGame }) {
  return (
    <Pressable
      style={styles.row}
      onPress={() =>
        router.push({
          pathname: "/games/[id]",
          params: { id: item.id, poster: item.posterPath ?? "" },
        } as any)
      }
    >
      <Thumbnail
        path={item.posterPath ?? ""}
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
          {formatGameType(item.session?.gameType ?? null)}
        </Text>
        <View style={styles.rowMeta}>
          {item.matchCount > 0 && (
            <View style={styles.chip}>
              <Icon source="heart" size={10} color={colors.primary} />
              <MatchCount count={item.matchCount} />
            </View>
          )}
          <Text style={styles.dateText}>{formatDate(item.createdAt)}</Text>
        </View>
      </View>
      <Icon source="chevron-right" size={14} color={colors.textSecondary} />
    </Pressable>
  );
}

export default function AllGamesScreen() {
  const user = useAppSelector((s) => s.auth.user);
  const isFullAccount = !!user && user.provider !== "anonymous";
  const { data, isLoading } = useGetGamesQuery(undefined, { skip: !isFullAccount });
  const games = [...(data?.games ?? [])].reverse();
  const insets = useSafeAreaInsets();
  const t = useTranslation();

  return (
    <View style={styles.container}>
      <PageHeading title={t("games.categories.all")} />

      <FlatList
        data={games}
        showsVerticalScrollIndicator={false}
        keyExtractor={(g) => g.id}
        renderItem={({ item }) => <GameRow item={item} />}
        contentContainerStyle={{
          paddingBottom: insets.bottom + 24,
          paddingHorizontal: spacing.lg,
        }}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListHeaderComponent={
          games.length > 0 ? (
            <Text style={styles.countLabel}>
              {t("games.sessionsPlayed").replace("{count}", String(games.length))}
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
                  source="controller-classic-outline"
                  size={44}
                  color="rgba(255,255,255,0.07)"
                />
                <Text style={styles.emptyText}>{t("games.empty") as string}</Text>
                <Text style={styles.emptyHint}>
                  {t("games.emptyHint")}
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
  rowMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    backgroundColor: "rgba(65,105,225,0.12)",
    borderRadius: radius.pill,
    paddingHorizontal: spacing.xs + 2,
    paddingVertical: spacing.xs - 2,
  },
  chipText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
    color: colors.primary,
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
  emptyText: { fontSize: fontSize.md + 1, fontWeight: fontWeight.semibold, color: "rgba(255,255,255,0.25)" },
  emptyHint: {
    fontSize: fontSize.md - 1,
    color: "rgba(255,255,255,0.15)",
    textAlign: "center",
    paddingHorizontal: spacing.xxl + 16,
  },
});
