import { Dimensions, ScrollView, StyleSheet, View } from "react-native";
import { Icon, Text } from "react-native-paper";
import { LinearGradient } from "expo-linear-gradient";
import { Image } from "expo-image";
import { Link } from "expo-router";
import Thumbnail, { ThumbnailSizes } from "./Thumbnail";
import Touch from "./Touch";
import { useGetGamesQuery, type GameMember, type UserGame } from "../redux/lists/listsApi";
import { formatGameType } from "../utils/formatGameType";

const CARD_WIDTH = Dimensions.get("window").width * 0.72;
const CARD_HEIGHT = 190;
const AVATAR_SIZE = 20;
const AVATAR_OVERLAP = 8;
const PREVIEW_LIMIT = 3;

function formatDate(unix: number) {
  return new Date(unix * 1000).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function MemberAvatarStack({ members }: { members: GameMember[] }) {
  if (members.length <= 1) return null;
  const visible = members.slice(0, 3);
  const extraCount = members.length - 1 - visible.length + 1;
  return (
    <View style={ma.wrap}>
      {visible.map((m, i) => (
        <View key={m.id} style={[ma.circle, { marginLeft: i === 0 ? 0 : -AVATAR_OVERLAP }]}>
          {m.avatarUrl ? (
            <Image style={ma.img} source={{ uri: m.avatarUrl }} cachePolicy="memory-disk" />
          ) : (
            <Text style={ma.letter}>{m.name.charAt(0).toUpperCase()}</Text>
          )}
        </View>
      ))}
      {extraCount > 0 && (
        <View style={[ma.circle, ma.extra, { marginLeft: -AVATAR_OVERLAP }]}>
          <Text style={ma.extraText}>+{extraCount}</Text>
        </View>
      )}
      <Text style={ma.label}>
        {members.length - 1 === 1 ? "you + 1 other" : `you + ${members.length - 1} others`}
      </Text>
    </View>
  );
}

function GameCard({ game }: { game: UserGame }) {
  return (
    <Link href={`/games/${game.id}` as any} asChild>
      <Touch style={card.wrap}>
        <View style={{ flex: 1 }}>
          <Link.AppleZoom>
            {game.posterPath ? (
              <Thumbnail
                path={game.posterPath}
                size={ThumbnailSizes.poster.large}
                container={card.image}
                showsPlaceholder={false}
                priority="normal"
              />
            ) : (
              <View style={[card.image, card.placeholder]}>
                <Icon source="movie-open-outline" size={36} color="rgba(255,255,255,0.12)" />
              </View>
            )}
          </Link.AppleZoom>

          <LinearGradient
            colors={["transparent", "rgba(0,0,0,0.45)", "rgba(0,0,0,0.95)"]}
            locations={[0, 0.45, 1]}
            style={card.gradient}
          />

          <View style={card.meta}>
            <Text style={card.title}>{formatGameType(game.session?.gameType ?? null)}</Text>
            <Text style={card.date}>{formatDate(game.createdAt)}</Text>
            <View style={card.stats}>
              <View style={card.statBadge}>
                <Icon source="heart" size={11} color="#BB86FC" />
                <Text style={card.statText}>{game.matchCount} matches</Text>
              </View>
              {game.session && (
                <View style={card.statBadge}>
                  <Icon source="gesture-swipe" size={11} color="rgba(255,255,255,0.5)" />
                  <Text style={card.statText}>{game.session.totalSwipes} swipes</Text>
                </View>
              )}
            </View>
            <MemberAvatarStack members={game.members ?? []} />
          </View>
        </View>
      </Touch>
    </Link>
  );
}

export default function RecentGames() {
  const { data, isLoading } = useGetGamesQuery();
  const allGames = data?.games ?? [];
  const games = [...allGames].reverse().slice(0, PREVIEW_LIMIT);

  if (isLoading) {
    return (
      <View style={styles.placeholder}>
        <Icon source="loading" size={16} color="rgba(255,255,255,0.3)" />
        <Text style={styles.placeholderText}>Loading games…</Text>
      </View>
    );
  }

  if (games.length === 0) {
    return (
      <View style={styles.placeholder}>
        <Icon source="controller-classic-outline" size={22} color="rgba(255,255,255,0.15)" />
        <Text style={styles.placeholderText}>No games yet — start swiping!</Text>
      </View>
    );
  }

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      decelerationRate="fast"
      snapToInterval={CARD_WIDTH + 12}
      snapToAlignment="start"
      contentContainerStyle={styles.list}
    >
      {games.map((g) => (
        <GameCard key={g.id} game={g} />
      ))}
    </ScrollView>
  );
}

const card = StyleSheet.create({
  wrap: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "rgba(255,255,255,0.05)",
  },
  image: { width: CARD_WIDTH, height: CARD_HEIGHT },
  placeholder: { alignItems: "center", justifyContent: "center" },
  gradient: { ...StyleSheet.absoluteFill },
  meta: { position: "absolute", bottom: 12, left: 14, right: 14, gap: 2 },
  title: { fontSize: 16, fontWeight: "700", color: "#fff", marginBottom: 2 },
  date: { fontSize: 11, color: "rgba(255,255,255,0.45)", marginBottom: 4 },
  stats: { flexDirection: "row", gap: 6, marginTop: 2 },
  statBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  statText: { fontSize: 11, color: "rgba(255,255,255,0.7)" },
});

const ma = StyleSheet.create({
  wrap: { flexDirection: "row", alignItems: "center", marginTop: 6 },
  circle: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    backgroundColor: "#333",
    borderWidth: 1.5,
    borderColor: "rgba(0,0,0,0.6)",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  img: { width: AVATAR_SIZE, height: AVATAR_SIZE },
  letter: { fontSize: 9, fontWeight: "700", color: "#fff" },
  extra: { backgroundColor: "#444" },
  extraText: { fontSize: 8, fontWeight: "700", color: "rgba(255,255,255,0.7)" },
  label: { fontSize: 10, color: "rgba(255,255,255,0.4)", marginLeft: 6 },
});

const styles = StyleSheet.create({
  list: { gap: 12, paddingVertical: 2, paddingRight: 4 },
  placeholder: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 18,
  },
  placeholderText: { fontSize: 13, color: "rgba(255,255,255,0.3)" },
});
