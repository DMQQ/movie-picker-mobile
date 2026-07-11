import { LinearGradient } from "expo-linear-gradient";
import { Image } from "expo-image";
import { Link } from "expo-router";
import { StyleSheet, View } from "react-native";
import { Icon, Text } from "react-native-paper";
import Thumbnail, { ThumbnailSizes } from "./Thumbnail";
import Touch from "./Touch";
import { type GameMember, type UserGame } from "../redux/lists/listsApi";
import { formatGameType } from "../utils/formatGameType";

const AVATAR_SIZE = 20;
const AVATAR_OVERLAP = 8;

function formatDate(unix: number) {
  return new Date(unix * 1000).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function AvatarStack({ members }: { members: GameMember[] }) {
  if (members.length <= 1) return null;
  const visible = members.slice(0, 4);
  const extra = members.length - visible.length;
  return (
    <View style={av.row}>
      {visible.map((m, i) => (
        <View key={m.id} style={[av.circle, { marginLeft: i === 0 ? 0 : -AVATAR_OVERLAP }]}>
          {m.avatarUrl ? (
            <Image style={av.img} source={{ uri: m.avatarUrl }} cachePolicy="memory-disk" />
          ) : (
            <Text style={av.letter}>{m.name.charAt(0).toUpperCase()}</Text>
          )}
        </View>
      ))}
      {extra > 0 && (
        <View style={[av.circle, av.extra, { marginLeft: -AVATAR_OVERLAP }]}>
          <Text style={av.extraText}>+{extra}</Text>
        </View>
      )}
    </View>
  );
}

interface GameCardProps {
  game: UserGame;
  width: number | "100%";
  height: number;
}

export default function GameCard({ game, width, height }: GameCardProps) {
  return (
    <Link href={`/games/${game.id}` as any} asChild>
      <Touch style={StyleSheet.flatten([styles.card, { width, height }])}>
        <View style={{ flex: 1 }}>
          <Link.AppleZoom>
            {game.posterPath ? (
              <Thumbnail
                path={game.posterPath}
                size={ThumbnailSizes.poster.large}
                container={{ width, height }}
                showsPlaceholder={false}
                priority="normal"
              />
            ) : (
              <View style={[{ width, height }, styles.placeholder]}>
                <Icon source="movie-open-outline" size={44} color="rgba(255,255,255,0.08)" />
              </View>
            )}
          </Link.AppleZoom>

          <LinearGradient
            colors={["transparent", "rgba(0,0,0,0.3)", "rgba(0,0,0,0.92)"]}
            locations={[0, 0.4, 1]}
            style={StyleSheet.absoluteFill}
          />

          <View style={styles.meta}>
            <View style={styles.topRow}>
              <AvatarStack members={game.members ?? []} />
            </View>

            <Text style={styles.title} numberOfLines={1}>
              {formatGameType(game.session?.gameType ?? null)}
            </Text>
            <Text style={styles.date}>{formatDate(game.createdAt)}</Text>

            <View style={styles.chips}>
              {game.matchCount > 0 && (
                <View style={[styles.chip, styles.chipAccent]}>
                  <Icon source="heart" size={10} color="#BB86FC" />
                  <Text style={[styles.chipLabel, styles.chipLabelAccent]}>
                    {game.matchCount} {game.matchCount !== 1 ? "matches" : "match"}
                  </Text>
                </View>
              )}
              {game.session && (
                <View style={styles.chip}>
                  <Icon source="gesture-swipe" size={10} color="rgba(255,255,255,0.55)" />
                  <Text style={styles.chipLabel}>{game.session.totalSwipes} swipes</Text>
                </View>
              )}
            </View>
          </View>
        </View>
      </Touch>
    </Link>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "rgba(255,255,255,0.05)",
  },
  placeholder: { alignItems: "center", justifyContent: "center" },

  meta: { position: "absolute", bottom: 12, left: 14, right: 14, gap: 2 },
  topRow: { flexDirection: "row", justifyContent: "flex-end", marginBottom: 6 },

  title: { fontSize: 16, fontWeight: "700", color: "#fff", marginBottom: 2 },
  date: { fontSize: 11, color: "rgba(255,255,255,0.45)", marginBottom: 6 },

  chips: { flexDirection: "row", gap: 6, flexWrap: "wrap" },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 20,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255,255,255,0.12)",
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  chipAccent: {
    backgroundColor: "rgba(187,134,252,0.12)",
    borderColor: "rgba(187,134,252,0.25)",
  },
  chipLabel: { fontSize: 11, fontWeight: "500", color: "rgba(255,255,255,0.65)" },
  chipLabelAccent: { color: "#BB86FC" },
});

const av = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center" },
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
});
