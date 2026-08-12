import { useCallback, useEffect, useRef } from "react";
import { Dimensions, Platform, Pressable, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import Text from "../../components/Text";
import { colors, fontWeight, fontSize, radius, spacing } from "../../constants/design";
import Animated, {
  SlideInDown,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
  Easing,
  interpolate,
} from "react-native-reanimated";
import SafeIOSContainer from "../../components/SafeIOSContainer";
import useTranslation from "../../service/useTranslation";
import PageHeading from "../../components/PageHeading";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { FilterButton } from "../../components/MediaFilters";
import ShareTicketButton from "../../components/ShareTicketButton";
import { useRandomMovie } from "../../hooks/useRandomMovie";
import { ThumbnailSizes } from "../../components/Thumbnail";
import GenresView from "../../components/GenresView";
import RatingIcons from "../../components/RatingIcons";
import PlatformBlurView from "../../components/PlatformBlurView";
import { useShakeDetector } from "../../hooks/useShakeDetector";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");
const CARD_WIDTH = screenWidth * 0.85;
const CARD_HEIGHT = screenHeight * 0.6;
const PRIMARY_COLOR = colors.primary;

export default function RandomMovie() {
  const t = useTranslation();
  const insets = useSafeAreaInsets();

  const rotateY = useSharedValue(0);
  const scale = useSharedValue(1);
  const diceRotate = useSharedValue(0);
  const shakeIntensity = useSharedValue(0);
  const rumblePhase = useSharedValue(0);

  const { movie, details, isLoading, isRevealed, fetchRandomMovie, revealMovie, resetCard, handleViewDetails, handleSuperLike, handleBlock, superLikeIconScale } =
    useRandomMovie({
      diceRotate,
      onReveal: () => {
        shakeIntensity.value = withSequence(
          withTiming(1, { duration: 200 }),
          withTiming(0, { duration: 300, easing: Easing.out(Easing.cubic) }),
        );
        rotateY.value = withSequence(
          withTiming(0, { duration: 0 }),
          withTiming(180, { duration: 500, easing: Easing.out(Easing.back(1.5)) }),
        );
        scale.value = withSequence(
          withTiming(0.9, { duration: 100 }),
          withSpring(1, { damping: 6, stiffness: 100 }),
        );
      },
      onReset: () => {
        shakeIntensity.value = withTiming(0, { duration: 200 });
        rotateY.value = withTiming(0, { duration: 350, easing: Easing.out(Easing.cubic) });
      },
    });

  const frontAnimatedStyle = useAnimatedStyle(() => {
    const rotateValue = interpolate(rotateY.value, [0, 180], [0, 180]);
    return {
      transform: [{ perspective: 1000 }, { rotateY: `${rotateValue}deg` }, { scale: scale.value }],
      zIndex: rotateY.value < 90 ? 1 : 0,
      opacity: rotateY.value < 90 ? 1 : 0,
    };
  });

  const backAnimatedStyle = useAnimatedStyle(() => {
    const rotateValue = interpolate(rotateY.value, [0, 180], [180, 360]);
    return {
      transform: [{ perspective: 1000 }, { rotateY: `${rotateValue}deg` }, { scale: scale.value }],
      zIndex: rotateY.value >= 90 ? 1 : 0,
      opacity: rotateY.value >= 90 ? 1 : 0,
    };
  });

  const diceIconStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${diceRotate.value}deg` }],
  }));

  const isLoadingSV = useSharedValue(false);

  const shakeCardStyle = useAnimatedStyle(() => {
    const intensity = shakeIntensity.value;
    const phase = rumblePhase.value * Math.PI * 2;
    if (intensity > 0.01) {
      return {
        transform: [
          { translateX: Math.sin(phase * 4.3) * 7 * intensity },
          { translateY: Math.cos(phase * 5.7) * 4 * intensity },
          { rotate: `${Math.sin(phase * 3.1) * 3.5 * intensity}deg` },
        ],
      };
    }
    if (isLoadingSV.value) {
      return {
        transform: [
          { translateX: Math.sin(phase * 3.7) * 2.5 },
          { translateY: Math.cos(phase * 4.9) * 1.8 },
        ],
      };
    }
    return { transform: [] };
  });

  const progressCircleStyle = useAnimatedStyle(() => {
    const progress = shakeIntensity.value;
    const visualProgress = progress;
    const maxRadius = Math.max(CARD_WIDTH * 0.55, CARD_HEIGHT * 0.65);
    const size = visualProgress * maxRadius * 2;
    return {
      width: size,
      height: size,
      borderRadius: size / 2,
      opacity: progress > 0.01 ? 1 : 0,
      transform: [
        { translateX: -size / 2 },
        { translateY: -size / 2 },
      ],
    };
  });

  const COOLDOWN_MS = 1500;
  const hapticMilestoneRef = useRef(0);
  const prevShakingRef = useRef(false);
  const reshakeActiveRef = useRef(false);
  const lastRevealTimeRef = useRef(0);
  const isRevealedRef = useRef(isRevealed);
  isRevealedRef.current = isRevealed;
  const revealMovieRef = useRef(revealMovie);
  revealMovieRef.current = revealMovie;

  const handleShakeComplete = useCallback(() => {
    scale.value = withSequence(
      withTiming(1.05, { duration: 80 }),
      withSpring(1, { damping: 10, stiffness: 200 }),
    );
    hapticMilestoneRef.current = 0;
    if (reshakeActiveRef.current) {
      reshakeActiveRef.current = false;
      revealMovieRef.current();
      lastRevealTimeRef.current = Date.now();
    } else if (!isRevealedRef.current) {
      revealMovieRef.current();
      lastRevealTimeRef.current = Date.now();
    }
  }, [scale]);

  const { isShaking } = useShakeDetector({
    onShake: handleShakeComplete,
    onShakeProgress: (progress: number) => {
      shakeIntensity.value = progress;
      const milestone = Math.floor(progress * 10);
      if (milestone > hapticMilestoneRef.current) {
        hapticMilestoneRef.current = milestone;
        Haptics.impactAsync(
          milestone === 10
            ? Haptics.ImpactFeedbackStyle.Heavy
            : Haptics.ImpactFeedbackStyle.Medium,
        );
      }
    },
    enabled: !isLoading,
  });

  useEffect(() => {
    if (isShaking && !prevShakingRef.current && isRevealed && !isLoading) {
      if (Date.now() - lastRevealTimeRef.current < COOLDOWN_MS) return;
      shakeIntensity.value = 0;
      reshakeActiveRef.current = true;
      resetCard();
    }
    prevShakingRef.current = isShaking;
  }, [isShaking, isRevealed, isLoading, resetCard]);

  useEffect(() => {
    if (isShaking || isLoading) {
      rumblePhase.value = withRepeat(withTiming(1, { duration: 90 }), -1, true);
    } else {
      rumblePhase.value = 0;
    }
  }, [isShaking, isLoading]);

  useEffect(() => {
    isLoadingSV.value = isLoading;
  }, [isLoading, isLoadingSV]);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["#0f172a", "#1e1b4b", "#172554"]}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      <SafeIOSContainer style={[styles.safeArea, { paddingBottom: 0 }]}>
        <PageHeading showBackButton title={t("games.random.title")}>
          <PlatformBlurView style={styles.filterButtonWrapper}>
            <FilterButton />
          </PlatformBlurView>
        </PageHeading>

        <View style={styles.content}>
          <Animated.View style={[styles.cardContainer, shakeCardStyle]}>
            {/* FRONT FACE (Dice) */}
            <Animated.View style={[styles.cardFace, styles.frontFace, frontAnimatedStyle]}>
              <View style={styles.gradientContainer}>
                <LinearGradient
                  colors={["#2a4ec4", "#5578E8", "#3b6fd4"]}
                  start={{ x: 0.2, y: 0 }}
                  end={{ x: 0.8, y: 1 }}
                  style={StyleSheet.absoluteFill}
                />
                <LinearGradient
                  colors={["rgba(0,0,0,0.15)", "transparent", "rgba(0,0,0,0.1)"]}
                  locations={[0, 0.5, 1]}
                  start={{ x: 0, y: 1 }}
                  end={{ x: 0, y: 0 }}
                  style={StyleSheet.absoluteFill}
                  pointerEvents="none"
                />
              </View>
              <View style={styles.cardBorder} pointerEvents="none" />
              <View style={styles.frontFaceInner}>
                {/* Expanding circle progress */}
                <Animated.View style={[styles.progressCircle, progressCircleStyle]} />

                <View style={styles.frontContent}>
                  <View style={styles.diceContainer}>
                    <View style={styles.diceRing} />
                    <View style={styles.diceRing2} />
                    <View style={styles.diceRing3} />
                    <Animated.View style={diceIconStyle}>
                      <MaterialCommunityIcons name="movie-open" size={104} color="rgba(255,255,255,0.9)" />
                    </Animated.View>
                  </View>
                  <View style={styles.frontTextGroup}>
                    <Text style={styles.frontTitle}>
                      {isLoading ? t("games.random.revealing") : t("games.random.title")}
                    </Text>
                    <Text style={styles.frontSubtitle}>
                      Shake the phone to discover your next movie
                    </Text>
                  </View>
                </View>
              </View>
            </Animated.View>

            {/* BACK FACE (Movie) */}
            <Animated.View style={[styles.cardFace, styles.backFace, backAnimatedStyle]}>
              {movie && (
                <Pressable onPress={handleViewDetails} style={styles.cardPressable}>
                  <Image
                    placeholder={`https://image.tmdb.org/t/p/${ThumbnailSizes.poster.tiny}${movie.poster_path}`}
                    source={{ uri: `https://image.tmdb.org/t/p/w780${movie.poster_path}` }}
                    style={styles.poster}
                    contentFit="cover"
                  />
                  <LinearGradient
                    colors={["transparent", "rgba(0,0,0,0.6)", "rgba(0,0,0,0.95)", colors.appBackground]}
                    locations={[0, 0.4, 0.75, 1]}
                    style={styles.infoOverlay}
                  >
                    <Text style={styles.movieTitle} numberOfLines={2}>
                      {movie.title || movie.name}
                    </Text>

                    <View style={styles.rating}>
                      <RatingIcons size={20} vote={movie.vote_average} />
                    </View>

                    {details?.genres && details.genres.length > 0 && (
                      <View style={styles.genresRow}>
                        <GenresView genres={details.genres.slice(0, 3)} />
                      </View>
                    )}

                    {movie.overview && (
                      <Text style={styles.overview} numberOfLines={3}>
                        {movie.overview}
                      </Text>
                    )}
                  </LinearGradient>
                </Pressable>
              )}
            </Animated.View>
          </Animated.View>
        </View>

        <Animated.View style={[styles.bottomOverlay, { bottom: insets.bottom + spacing.lg }]}>
          {movie && isRevealed && details && (
            <Animated.View entering={SlideInDown.duration(400)} style={styles.shareWrapper}>
              <ShareTicketButton movie={{ ...movie, genres: details.genres, tagline: details.tagline }} providers={details.providers} />
            </Animated.View>
          )}
          <View style={styles.shakePromptRow}>
            <MaterialCommunityIcons name="vibrate" size={16} color={colors.placeholder} />
            <Text style={styles.shakePrompt}>Shake to discover</Text>
            <MaterialCommunityIcons name="vibrate" size={16} color={colors.placeholder} />
          </View>
        </Animated.View>
      </SafeIOSContainer>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.appBackground,
  },
  filterButtonWrapper: {
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    borderRadius: radius.pill,
    ...Platform.select({
      android: {
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: "#343434ff",
      },
    }),
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: spacing.xxl * 2,
  },
  cardContainer: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    alignItems: "center",
    justifyContent: "center",
  },
  cardFace: {
    width: "100%",
    height: "100%",
    position: "absolute",
    borderRadius: radius.lg + 4,
    overflow: "hidden",
    backfaceVisibility: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.6,
    shadowRadius: 24,
    elevation: 12,
  },
  frontFace: {
    backgroundColor: PRIMARY_COLOR,
  },
  backFace: {
    backgroundColor: "#1e1e1e",
  },
  cardBorder: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: radius.lg + 4,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.12)",
    zIndex: 10,
  },
  gradientContainer: {
    position: "absolute",
    top: 2,
    left: 2,
    right: 2,
    bottom: 2,
    overflow: "hidden",
    borderRadius: radius.lg + 2,
  },
  frontFaceInner: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xxl,
  },
  cardPressable: {
    flex: 1,
  },
  frontContent: {
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xxl + spacing.lg,
    zIndex: 2,
  },
  diceContainer: {
    width: 280,
    height: 280,
    alignItems: "center",
    justifyContent: "center",
    overflow: "visible",
  },
  diceRing: {
    position: "absolute",
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 2.5,
    borderColor: "rgba(255,255,255,0.25)",
  },
  diceRing2: {
    position: "absolute",
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.18)",
  },
  diceRing3: {
    position: "absolute",
    width: 269,
    height: 269,
    borderRadius: 134,
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.12)",
  },
  progressCircle: {
    position: "absolute",
    top: "40%",
    left: "50%",
    backgroundColor: "#2a4ec4",
    zIndex: 0,
  },
  frontTextGroup: {
    alignItems: "center",
    gap: spacing.xs,
    width: "75%",
  },
  frontTitle: {
    color: colors.text,
    fontSize: 36,
    fontFamily: "Bebas",
    letterSpacing: 0.5,
    textAlign: "center",
  },
  frontSubtitle: {
    color: colors.placeholder,
    fontSize: 18,
    fontWeight: fontWeight.normal,
    textAlign: "center",
  },
  poster: {
    width: "100%",
    height: "100%",
  },
  infoOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.xl,
    paddingTop: spacing.xl * 4,
    justifyContent: "flex-end",
  },
  movieTitle: {
    fontSize: 32,
    color: colors.text,
    marginBottom: spacing.xs,
    fontFamily: "Bebas",
    textShadowColor: "rgba(0,0,0,0.5)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  rating: {
    flexDirection: "row",
    marginBottom: spacing.sm + 2,
  },
  genresRow: {
    flexDirection: "row",
    flexWrap: "nowrap",
    overflow: "hidden",
    gap: spacing.sm - 2,
    marginBottom: spacing.sm + 2,
  },
  overview: {
    color: "rgba(255,255,255,0.85)",
    fontSize: fontSize.md - 1,
    lineHeight: 18,
    fontWeight: fontWeight.normal,
  },
  bottomOverlay: {
    position: "absolute",
    left: 0,
    right: 0,
    alignItems: "center",
    zIndex: 10,
  },
  shareWrapper: {
    marginBottom: spacing.sm,
  },
  shakePromptRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  shakePrompt: {
    color: colors.placeholder,
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
    textAlign: "center",
  },
});
