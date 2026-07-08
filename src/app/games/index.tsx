import { router } from "expo-router";
import { FlatList, Pressable, StyleSheet, View } from "react-native";
import { Icon, Text } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import PageHeading from "../../components/PageHeading";
import Thumbnail, { ThumbnailSizes } from "../../components/Thumbnail";
import { useGetGamesQuery, type UserGame } from "../../redux/lists/listsApi";

const POSTER_W = 46;
const POSTER_H = 68;

function formatDate(unix: number) {
  return new Date(unix * 1000).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatGameType(raw: string | null) {
  if (!raw) return "Swipe Game";
  if (raw.includes("/tv")) return "TV Shows";
  if (raw.includes("/movie")) return "Movies";
  return "Swipe Game";
}

function GameRow({ game }: { game: UserGame }) {
  return (
    <Pressable
      style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
      onPress={() => router.push(`/games/${game.id}` as any)}
    >
      <View style={styles.posterWrap}>
        {game.posterPath ? (
          <Thumbnail
            path={game.posterPath}
            size={ThumbnailSizes.poster.small}
            container={styles.poster}
            showsPlaceholder={false}
            priority="normal"
          />
        ) : (
          <View style={[styles.poster, styles.posterPlaceholder]}>
            <Icon
              source="movie-open-outline"
              size={20}
              color="rgba(255,255,255,0.15)"
            />
          </View>
        )}
      </View>

      <View style={styles.info}>
        <Text style={styles.sessionId} numberOfLines={1}>
          {formatGameType(game.session?.gameType ?? null)}
        </Text>
        <Text style={styles.sub}>{formatDate(game.createdAt)}</Text>
        {game.session && (
          <Text style={styles.swipes}>{game.session.totalSwipes} swipes</Text>
        )}
      </View>

      <View style={styles.right}>
        <View style={styles.matchBadge}>
          <Icon source="heart" size={11} color="#BB86FC" />
          <Text style={styles.matchCount}>{game.matchCount}</Text>
        </View>
        <Icon source="chevron-right" size={18} color="rgba(255,255,255,0.2)" />
      </View>
    </Pressable>
  );
}

export default function AllGamesScreen() {
  const { data, isLoading } = useGetGamesQuery();
  const games = [...(data?.games ?? [])].reverse();
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <PageHeading title="All Games" />

      <FlatList
        data={games}
        keyExtractor={(g) => g.id}
        renderItem={({ item }) => <GameRow game={item} />}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        contentContainerStyle={{
          paddingTop: 120,
          paddingBottom: insets.bottom + 24,
        }}
        ListHeaderComponent={
          games.length > 0 ? (
            <Text style={styles.countLabel}>
              {games.length} sessions played
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
                <Text style={styles.emptyText}>No games yet</Text>
                <Text style={styles.emptyHint}>
                  Start a swipe session to see your history here
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
  container: { flex: 1, backgroundColor: "#000" },

  countLabel: {
    fontSize: 12,
    color: "rgba(255,255,255,0.3)",
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: "#000",
  },
  rowPressed: { backgroundColor: "rgba(255,255,255,0.04)" },

  posterWrap: { borderRadius: 8, overflow: "hidden" },
  poster: { width: POSTER_W, height: POSTER_H, borderRadius: 8 },
  posterPlaceholder: {
    backgroundColor: "rgba(255,255,255,0.06)",
    alignItems: "center",
    justifyContent: "center",
  },

  info: { flex: 1, gap: 3 },
  sessionId: { fontSize: 14, fontWeight: "600", color: "#fff" },
  sub: { fontSize: 12, color: "rgba(255,255,255,0.4)" },
  swipes: { fontSize: 11, color: "rgba(255,255,255,0.25)", marginTop: 1 },

  right: { alignItems: "center", gap: 8 },
  matchBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(187,134,252,0.12)",
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  matchCount: { fontSize: 12, fontWeight: "700", color: "#BB86FC" },

  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: "rgba(255,255,255,0.06)",
    marginLeft: 20 + POSTER_W + 14,
  },

  empty: { alignItems: "center", gap: 10, paddingTop: 72 },
  emptyText: {
    fontSize: 15,
    fontWeight: "600",
    color: "rgba(255,255,255,0.25)",
  },
  emptyHint: {
    fontSize: 13,
    color: "rgba(255,255,255,0.15)",
    textAlign: "center",
    paddingHorizontal: 40,
  },
});
