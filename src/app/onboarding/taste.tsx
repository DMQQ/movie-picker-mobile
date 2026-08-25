import { useCallback, useRef, useState } from "react";
import { Dimensions, StyleSheet, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  runOnJS,
  Easing,
} from "react-native-reanimated";
import { AsyncStorage } from "expo-sqlite/kv-store";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import Text from "../../components/Text";
import Touch from "../../components/Touch";
import Thumbnail, { ThumbnailSizes } from "../../components/Thumbnail";
import useTranslation from "../../service/useTranslation";
import { colors, spacing, radius, fontSize, fontWeight, withAlpha } from "../../constants/design";
import { posthog } from "../../constants/posthog";

const { width: W } = Dimensions.get("window");

const CARD_W = W - spacing.xl * 4;
const CARD_H = CARD_W * 1.5;

// Curated mix across genres — poster paths confirmed from production
const TASTE_MOVIES = [
  { poster: "/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg", title: "Inception", year: 2010, genres: [28, 878, 9648] },
  { poster: "/qJ2tW6WMUDux911r6m7haRef0WH.jpg", title: "The Dark Knight", year: 2008, genres: [18, 28, 80] },
  { poster: "/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg", title: "Interstellar", year: 2014, genres: [12, 18, 878] },
  { poster: "/q6y0Go1tsGEsmtFryDOJo3dEmqu.jpg", title: "The Shawshank Redemption", year: 1994, genres: [18, 80] },
  { poster: "/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg", title: "Pulp Fiction", year: 1994, genres: [53, 80] },
  { poster: "/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg", title: "Parasite", year: 2019, genres: [18, 35, 53] },
  { poster: "/7WsyChQLEftFiDOVTGkv3hFpyyt.jpg", title: "Mad Max: Fury Road", year: 2015, genres: [28, 12, 878] },
  { poster: "/iPOn6DinuVyLY17YM9mKuPofV08.jpg", title: "The Grand Budapest Hotel", year: 2014, genres: [35, 18] },
  { poster: "/1g0dhYtq4irTY1GPXvft6k4YLjm.jpg", title: "La La Land", year: 2016, genres: [18, 10402, 10749] },
  { poster: "/bRwnj8WEKBCvmfeUNOukJPwB43K.jpg", title: "Get Out", year: 2017, genres: [27, 9648, 53] },
  { poster: "/62HCnUTziyWcpDaBO2i1DX17ljH.jpg", title: "Avengers: Endgame", year: 2019, genres: [28, 12, 878] },
  { poster: "/iiZZdoQBEYBv6id8su7ImL0oCbD.jpg", title: "Titanic", year: 1997, genres: [18, 10749] },
];

export default function TasteScreen() {
  const t = useTranslation();
  const insets = useSafeAreaInsets();
  const { quickStart } = useLocalSearchParams<{ quickStart?: string }>();

  const [movieIndex, setMovieIndex] = useState(0);
  const indexRef = useRef(0);
  const likedGenres = useRef<number[]>([]);

  const translateX = useSharedValue(0);
  const opacity = useSharedValue(1);

  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
    opacity: opacity.value,
  }));

  const saveAndNavigate = useCallback(async () => {
    // Rank genres by frequency and store top 5
    const freq: Record<number, number> = {};
    for (const id of likedGenres.current) {
      freq[id] = (freq[id] ?? 0) + 1;
    }
    const top = Object.entries(freq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([id]) => Number(id));

    await AsyncStorage.setItem("user_taste_genres", JSON.stringify(top));
    posthog?.capture("onboarding_taste_done", { liked_count: likedGenres.current.length });
    router.push({ pathname: "/onboarding/providers", params: { quickStart } } as any);
  }, [quickStart]);

  const goNext = useCallback(() => {
    const next = indexRef.current + 1;
    if (next >= TASTE_MOVIES.length) {
      saveAndNavigate();
      return;
    }
    indexRef.current = next;
    translateX.value = 0;
    opacity.value = 0;
    setMovieIndex(next);
    opacity.value = withTiming(1, { duration: 250, easing: Easing.out(Easing.quad) });
  }, [saveAndNavigate]);

  const handleChoice = useCallback((isLike: boolean) => {
    if (isLike) {
      const movie = TASTE_MOVIES[indexRef.current];
      likedGenres.current.push(...movie.genres);
    }
    const dir = isLike ? W + 60 : -W - 60;
    translateX.value = withTiming(dir, { duration: 220, easing: Easing.in(Easing.cubic) });
    opacity.value = withTiming(0, { duration: 180 }, (finished) => {
      if (finished) runOnJS(goNext)();
    });
  }, [goNext]);

  const handleSkipAll = useCallback(() => {
    posthog?.capture("onboarding_taste_skipped");
    router.push({ pathname: "/onboarding/providers", params: { quickStart } } as any);
  }, [quickStart]);

  const movie = TASTE_MOVIES[movieIndex];
  const progress = movieIndex / TASTE_MOVIES.length;

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom + spacing.lg }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.stepDots}>
          <View style={[styles.dot, styles.dotActive]} />
          <View style={styles.dot} />
        </View>
        <Touch onPress={handleSkipAll} style={styles.skipBtn}>
          <Text style={styles.skipText}>{t("onboarding.taste.skipAll")}</Text>
        </Touch>
      </View>

      {/* Progress bar */}
      <View style={styles.progressTrack}>
        <Animated.View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
      </View>

      {/* Title */}
      <View style={styles.titleBlock}>
        <Text style={styles.title}>{t("onboarding.taste.title")}</Text>
        <Text style={styles.subtitle}>{t("onboarding.taste.subtitle")}</Text>
      </View>

      {/* Movie card */}
      <View style={styles.cardArea}>
        <Animated.View style={[styles.card, cardStyle]}>
          <Thumbnail
            path={movie.poster}
            size={ThumbnailSizes.poster.large}
            style={StyleSheet.absoluteFill}
            priority="high"
          />
          <LinearGradient
            colors={["transparent", "rgba(0,0,0,0.85)"]}
            style={styles.cardGradient}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 0, y: 1 }}
          />
          <View style={styles.cardFooter}>
            <Text style={styles.movieTitle}>{movie.title}</Text>
            <Text style={styles.movieYear}>{movie.year}</Text>
          </View>
        </Animated.View>

        {/* Step counter */}
        <Text style={styles.counter}>
          {t("onboarding.taste.progress")
            .replace("{current}", String(movieIndex + 1))
            .replace("{total}", String(TASTE_MOVIES.length))}
        </Text>
      </View>

      {/* Action buttons */}
      <View style={styles.actions}>
        <Touch onPress={() => handleChoice(false)} style={styles.actionBtn}>
          <View style={styles.skipAction}>
            <MaterialCommunityIcons name="close" size={28} color={withAlpha(colors.text, 0.5)} />
          </View>
          <Text style={styles.actionLabel}>{t("onboarding.taste.skip")}</Text>
        </Touch>

        <Touch onPress={() => handleChoice(true)} style={styles.actionBtn}>
          <View style={styles.likeAction}>
            <MaterialCommunityIcons name="heart" size={28} color={colors.text} />
          </View>
          <Text style={[styles.actionLabel, styles.actionLabelLike]}>{t("onboarding.taste.like")}</Text>
        </Touch>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.appBackground,
    paddingHorizontal: spacing.xl,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.md,
  },
  stepDots: {
    flexDirection: "row",
    gap: spacing.xs,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: withAlpha(colors.text, 0.2),
  },
  dotActive: {
    backgroundColor: colors.primary,
    width: 20,
  },
  skipBtn: {
    paddingVertical: spacing.xs,
    paddingLeft: spacing.sm,
  },
  skipText: {
    fontSize: fontSize.md,
    color: withAlpha(colors.text, 0.4),
  },
  progressTrack: {
    height: 2,
    backgroundColor: withAlpha(colors.text, 0.08),
    borderRadius: 1,
    marginBottom: spacing.xl,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: colors.primary,
    borderRadius: 1,
  },
  titleBlock: {
    marginBottom: spacing.xl,
    gap: spacing.xs,
  },
  title: {
    fontFamily: "Bebas",
    fontSize: 36,
    color: colors.text,
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: fontSize.md,
    color: withAlpha(colors.text, 0.5),
  },
  cardArea: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.md,
  },
  card: {
    width: CARD_W,
    height: CARD_H,
    borderRadius: radius.lg,
    overflow: "hidden",
    backgroundColor: colors.surface,
  },
  cardGradient: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: "50%",
  },
  cardFooter: {
    position: "absolute",
    bottom: spacing.lg,
    left: spacing.lg,
    right: spacing.lg,
  },
  movieTitle: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.text,
    lineHeight: 24,
  },
  movieYear: {
    fontSize: fontSize.md,
    color: withAlpha(colors.text, 0.6),
    marginTop: 2,
  },
  counter: {
    fontSize: fontSize.sm,
    color: withAlpha(colors.text, 0.35),
    letterSpacing: 0.5,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "center",
    gap: spacing.xxl * 2,
    marginTop: spacing.xl,
  },
  actionBtn: {
    alignItems: "center",
    gap: spacing.sm,
  },
  skipAction: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: withAlpha(colors.text, 0.08),
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: withAlpha(colors.text, 0.12),
  },
  likeAction: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  actionLabel: {
    fontSize: fontSize.sm,
    color: withAlpha(colors.text, 0.4),
    fontWeight: fontWeight.medium,
  },
  actionLabelLike: {
    color: colors.primary,
  },
});
