import { LinearGradient } from "expo-linear-gradient";
import Icon from "./Icon";
import Text from "./Text";
import { Image } from "expo-image";
import { Link } from "expo-router";
import { StyleSheet, View } from "react-native";

import Thumbnail, { ThumbnailSizes } from "./Thumbnail";
import Touch from "./Touch";
import { type GameMember, type UserGame } from "../redux/lists/listsApi";
import { formatGameType } from "../utils/formatGameType";
import { getUserAvatarColor } from "../utils/avatar";
import { colors, fontSize, fontWeight, radius, spacing } from "../constants/design";

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
        <View key={m.id} style={[av.circle, { marginLeft: i === 0 ? 0 : -AVATAR_OVERLAP, backgroundColor: getUserAvatarColor(m.name) }]}>
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
    <Link href={`/games/${game.id}?poster=${encodeURIComponent(game.posterPath ?? '')}` as any} asChild>
      <Touch style={StyleSheet.flatten([styles.card, { width, height }])}>
        <View style={{ flex: 1 }}>
          <Link.AppleZoom>
            {game.posterPath ? (
              <Thumbnail
                path={game.posterPath}
                size={ThumbnailSizes.poster.xlarge}
                container={{ width, height }}
                showsPlaceholder={false}
                priority="normal"
              />
            ) : (
              <View style={[{ width, height }, styles.placeholder]}>
                <Icon source="movie-open-outline" size={44} color={colors.overlay} />
              </View>
            )}
          </Link.AppleZoom>

          <LinearGradient
            colors={["transparent", "rgba(0,0,0,0.3)", "rgba(0,0,0,0.92)"]}
            locations={[0, 0.4, 1]}
            style={StyleSheet.absoluteFill}
          />

          <View style={styles.meta}>
            <Text style={styles.title} numberOfLines={1}>
              {formatGameType(game.session?.gameType ?? null)}
            </Text>
            <Text style={styles.date}>{formatDate(game.createdAt)}</Text>

            <View style={styles.chips}>
              {game.matchCount > 0 && (
                <View style={[styles.chip, styles.chipAccent]}>
                  <Icon source="heart" size={10} color={colors.primary} />
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

            <AvatarStack members={game.members ?? []} />
          </View>
        </View>
      </Touch>
    </Link>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.card,
    overflow: "hidden",
    backgroundColor: "rgba(255,255,255,0.05)",
  },
  placeholder: { alignItems: "center", justifyContent: "center" },

  meta: { position: "absolute", bottom: spacing.md, left: 14, right: 14, gap: spacing.xs },

  title: { fontSize: fontSize.lg, fontWeight: fontWeight.bold, color: colors.text },
  date: { fontSize: fontSize.xs, color: "rgba(255,255,255,0.45)" },

  chips: { flexDirection: "row", gap: spacing.sm - 2, flexWrap: "wrap" },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: radius.modal,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs - 1,
  },
  chipAccent: {
    backgroundColor: "rgba(187,134,252,0.12)",
    borderColor: "rgba(187,134,252,0.25)",
  },
  chipLabel: { fontSize: fontSize.xs, fontWeight: fontWeight.medium, color: "rgba(255,255,255,0.65)" },
  chipLabelAccent: { color: colors.primary },
});

const av = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center" },
  circle: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    borderWidth: 1.5,
    borderColor: "rgba(0,0,0,0.6)",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  img: { width: AVATAR_SIZE, height: AVATAR_SIZE },
  letter: { fontSize: fontSize.xs - 1, fontWeight: fontWeight.bold, color: colors.text },
  extra: { backgroundColor: colors.overlay },
  extraText: { fontSize: fontSize.xs - 2, fontWeight: fontWeight.bold, color: "rgba(255,255,255,0.7)" },
});
