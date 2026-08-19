import { useEffect } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { router } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import Text from "../Text";
import Thumbnail, { ThumbnailSizes } from "../Thumbnail";
import { prefetchThumbnails } from "../../utils/prefetchImages";
import type { Movie } from "../../../types";
import { colors, fontSize, radius, spacing, withAlpha } from "../../constants/design";

const RANK_COLORS = ["#FFD166", "#C7CDD9", "#D18A5C"];
const STEP_HEIGHTS = [72, 44, 24];
const TROPHY_SIZES = [18, 14, 12];
const ORDINALS = ["1st", "2nd", "3rd"];

const TIMING: Record<number, { step: number; content: number; trophy: number }> = {
  2: { step: 100,  content: 500,  trophy: 750  },
  1: { step: 650,  content: 1050, trophy: 1300 },
  0: { step: 1200, content: 1600, trophy: 1800 },
};

function openMovie(movie: Movie) {
  router.push({
    pathname: "/movie/type/[type]/[id]",
    params: { id: movie.id, type: movie.title ? "movie" : "tv", img: movie.poster_path },
  });
}

function PodiumColumn({ movie, rank }: { movie: Movie; rank: number }) {
  const { step: stepDelay, content: contentDelay, trophy: trophyDelay } = TIMING[rank];

  const fillH = useSharedValue(0);
  const contentScale = useSharedValue(0.75);
  const contentOpacity = useSharedValue(0);
  const trophyScale = useSharedValue(0);

  useEffect(() => {
    fillH.value = withDelay(
      stepDelay,
      withTiming(STEP_HEIGHTS[rank], { duration: 380, easing: Easing.out(Easing.quad) })
    );
    contentScale.value = withDelay(
      contentDelay,
      withTiming(1, { duration: 300, easing: Easing.out(Easing.cubic) })
    );
    contentOpacity.value = withDelay(contentDelay, withTiming(1, { duration: 280 }));
    trophyScale.value = withDelay(
      trophyDelay,
      withSequence(
        withSpring(rank === 0 ? 1.35 : 1.2, { damping: 10, stiffness: 260 }),
        withSpring(1, { damping: 18, stiffness: 220 })
      )
    );
  }, []);

  const fillStyle = useAnimatedStyle(() => ({ height: fillH.value }));
  const contentStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
    transform: [{ scale: contentScale.value }],
  }));
  const trophyStyle = useAnimatedStyle(() => ({ transform: [{ scale: trophyScale.value }] }));

  return (
    <Pressable
      onPress={() => openMovie(movie)}
      style={[styles.column, rank === 0 && styles.columnChampion]}
    >
      <Animated.View style={contentStyle}>
        <View style={[styles.posterWrap, { borderColor: RANK_COLORS[rank] }, rank === 0 && styles.posterWrapChampion]}>
          <Thumbnail
            path={movie.poster_path}
            size={rank === 0 ? ThumbnailSizes.poster.xlarge : ThumbnailSizes.poster.medium}
            container={{ width: "100%", aspectRatio: 2 / 3, borderRadius: radius.card }}
            style={{ borderRadius: radius.card }}
          />
          <View style={[styles.rankBadge, { backgroundColor: RANK_COLORS[rank] }]}>
            <Text style={styles.rankNumber}>{rank + 1}</Text>
          </View>
        </View>

        <Text numberOfLines={2} style={[styles.title, rank === 0 && styles.titleChampion]}>
          {movie.title || movie.name}
        </Text>
        <Text style={[styles.ordinal, { color: RANK_COLORS[rank] }]}>{ORDINALS[rank]}</Text>
      </Animated.View>

      <View style={[styles.stepWrapper, { height: STEP_HEIGHTS[rank] }]}>
        <Animated.View
          style={[
            styles.stepFill,
            fillStyle,
            {
              backgroundColor: withAlpha(RANK_COLORS[rank], 0.16),
              borderColor: withAlpha(RANK_COLORS[rank], 0.5),
            },
          ]}
        >
          <Animated.View style={trophyStyle}>
            <MaterialCommunityIcons name="trophy" size={TROPHY_SIZES[rank]} color={RANK_COLORS[rank]} />
          </Animated.View>
        </Animated.View>
      </View>
    </Pressable>
  );
}

export default function Podium({ top3 }: { top3: Movie[] }) {
  const [champion, runnerUp, third] = top3;
  const order: [Movie | undefined, number][] = [
    [runnerUp, 1],
    [champion, 0],
    [third, 2],
  ];

  useEffect(() => {
    const posterPaths = top3.map((m) => m.poster_path).filter(Boolean);
    if (posterPaths.length) {
      prefetchThumbnails(posterPaths, 'xlarge');
    }
  }, [top3.map((m) => m.id).join()]);

  return (
    <View style={styles.row}>
      {order.map(([movie, rank]) =>
        movie ? (
          <PodiumColumn key={movie.id} movie={movie} rank={rank} />
        ) : (
          <View key={`empty-${rank}`} style={styles.column} />
        )
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: spacing.sm,
  },
  column: {
    flex: 1,
    alignItems: "center",
  },
  columnChampion: {
    flex: 1.15,
  },
  posterWrap: {
    width: "100%",
    borderRadius: radius.card,
    borderWidth: 2,
  },
  posterWrapChampion: {
    borderWidth: 3,
  },
  rankBadge: {
    position: "absolute",
    top: spacing.xs,
    left: spacing.xs,
    width: 22,
    height: 22,
    borderRadius: radius.pill,
    alignItems: "center",
    justifyContent: "center",
  },
  rankNumber: {
    fontFamily: "Bebas",
    fontSize: fontSize.sm,
    color: colors.appBackground,
  },
  title: {
    fontFamily: "Bebas",
    fontSize: fontSize.md,
    color: colors.text,
    textAlign: "center",
    marginTop: spacing.xs,
    marginBottom: spacing.sm,
  },
  titleChampion: {
    fontSize: fontSize.lg,
  },
  ordinal: {
    fontFamily: "Bebas",
    fontSize: fontSize.sm,
    textAlign: "center",
    letterSpacing: 1,
    marginBottom: spacing.xs,
  },
  stepWrapper: {
    width: "100%",
    justifyContent: "flex-end",
  },
  stepFill: {
    width: "100%",
    borderRadius: radius.sm,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
});
