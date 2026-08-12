import { useCallback } from "react";
import { Dimensions, Platform, Pressable, StyleSheet, View } from "react-native";
import Text from "../../components/Text";
import { colors, fontWeight, fontSize, radius, spacing, withAlpha } from "../../constants/design";
import PrimaryButton from "../../components/PrimaryButton";
import Animated, {
  FadeIn,
  SlideInDown,
  useAnimatedStyle,
  useSharedValue,
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
import { Canvas, RadialGradient, Rect, vec } from "@shopify/react-native-skia";
import { FilterButton } from "../../components/MediaFilters";
import ShareTicketButton from "../../components/ShareTicketButton";
import { useRandomMovie } from "../../hooks/useRandomMovie";
import { RandomQuestionMarks } from "../../components/Random/shared";
import { ThumbnailSizes } from "../../components/Thumbnail";
import GenresView from "../../components/GenresView";
import RatingIcons from "../../components/RatingIcons";
import PlatformBlurView from "../../components/PlatformBlurView";
import { useShakeDetector } from "../../hooks/useShakeDetector";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");
const CARD_WIDTH = screenWidth * 0.9;
const CARD_HEIGHT = screenHeight * 0.65;
const PRIMARY_COLOR = colors.primary;

export default function RandomMovie() {
  const t = useTranslation();

  const rotateY = useSharedValue(0);
  const scale = useSharedValue(1);
  const diceRotate = useSharedValue(0);
  const shakeX = useSharedValue(0);

  const { movie, details, isLoading, isRevealed, fetchRandomMovie, handleViewDetails, handleSuperLike, handleBlock, superLikeIconScale } =
    useRandomMovie({
      diceRotate,
      onReveal: () => {
        rotateY.value = withSequence(
          withTiming(0, { duration: 0 }),
          withTiming(180, { duration: 600, easing: Easing.out(Easing.back(1.5)) }),
        );
        scale.value = withSequence(
          withTiming(0.9, { duration: 100 }),
          withSpring(1, { damping: 12, stiffness: 100 }),
        );
      },
      onReset: () => {
        rotateY.value = withTiming(0, { duration: 400, easing: Easing.out(Easing.cubic) });
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

  const shakeCardStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shakeX.value }],
  }));

  const triggerShakeAnimation = useCallback(() => {
    shakeX.value = withSequence(
      withTiming(14, { duration: 50 }),
      withTiming(-14, { duration: 50 }),
      withTiming(10, { duration: 50 }),
      withTiming(-10, { duration: 50 }),
      withTiming(0, { duration: 50 }),
    );
  }, [shakeX]);

  const handleShake = useCallback(() => {
    triggerShakeAnimation();
    fetchRandomMovie();
  }, [triggerShakeAnimation, fetchRandomMovie]);

  useShakeDetector(handleShake, !isLoading);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["#0f172a", "#1e1b4b", "#172554"]}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      <SafeIOSContainer style={styles.safeArea}>
        <PageHeading showBackButton title={t("games.random.title")}>
          <PlatformBlurView style={styles.filterButtonWrapper}>
            <FilterButton />
          </PlatformBlurView>
        </PageHeading>

        <View style={styles.content}>
          <Animated.View style={[styles.cardContainer, shakeCardStyle]}>
            {/* FRONT FACE (Dice) */}
            <Animated.View style={[styles.cardFace, styles.frontFace, frontAnimatedStyle]}>
              <View style={styles.solidFrontBackground}>
                <Canvas style={StyleSheet.absoluteFill}>
                  <Rect x={0} y={0} width={CARD_WIDTH} height={CARD_HEIGHT}>
                    <RadialGradient
                      c={vec(CARD_WIDTH / 2, CARD_HEIGHT / 2)}
                      r={CARD_WIDTH * 0.8}
                      colors={[colors.primary, withAlpha(colors.primary, 0.5)]}
                    />
                  </Rect>
                </Canvas>

                <Animated.View style={diceIconStyle}>
                  <MaterialCommunityIcons name="dice-multiple" size={100} color="rgba(255,255,255,0.9)" />
                </Animated.View>
                <Text style={styles.frontText}>
                  {isLoading ? t("games.random.revealing") : t("games.random.hint")}
                </Text>

                <RandomQuestionMarks cardWidth={CARD_WIDTH} cardHeight={CARD_HEIGHT} />
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

                    <View style={styles.ratingRow}>
                      {movie.vote_average > 0 && (
                        <RatingIcons size={13} vote={movie.vote_average} showText />
                      )}
                      {details?.runtime ? (
                        <>
                          <Text style={styles.dotSeparator}>•</Text>
                          <Text style={styles.ratingText}>{details.runtime} min</Text>
                        </>
                      ) : null}
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

        <Animated.View style={styles.bottomBar} entering={SlideInDown.duration(400)}>
          <PrimaryButton
            onPress={fetchRandomMovie}
            disabled={isLoading}
            loading={isLoading}
            style={styles.primaryButton}
            buttonColor={PRIMARY_COLOR}
            icon={!isLoading ? ({ color }) => <MaterialCommunityIcons name={movie && isRevealed ? "refresh" : "dice-multiple"} size={16} color={color} /> : undefined}
          >
            {movie && isRevealed ? t("games.random.try-again") : t("games.random.reveal")}
          </PrimaryButton>

          {movie && isRevealed && details && (
            <Animated.View entering={FadeIn} style={styles.shareButtonWrapper}>
              <ShareTicketButton movie={{ ...movie, genres: details.genres, tagline: details.tagline }} providers={details.providers} />
            </Animated.View>
          )}
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
    paddingTop: spacing.xl * 3,
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
    borderWidth: 3,
    borderColor: "rgba(255,255,255,0.2)",
  },
  backFace: {
    backgroundColor: "#1e1e1e",
  },
  cardPressable: {
    flex: 1,
  },
  solidFrontBackground: {
    flex: 1,
    backgroundColor: PRIMARY_COLOR,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xxl,
  },
  frontText: {
    color: colors.text,
    fontSize: 22,
    fontWeight: fontWeight.bold,
    opacity: 0.9,
    letterSpacing: 0.5,
    textAlign: "center",
    width: "80%",
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
    marginBottom: spacing.sm,
    fontFamily: "Bebas",
    textShadowColor: "rgba(0,0,0,0.5)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm - 2,
    marginBottom: spacing.sm + 2,
    flexWrap: "wrap",
  },
  ratingText: {
    color: "#e2e8f0",
    fontWeight: fontWeight.semibold,
    fontSize: fontSize.md,
  },
  dotSeparator: {
    color: "#64748b",
    fontSize: fontSize.md,
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
  bottomBar: {
    flexDirection: "row",
    padding: spacing.screen,
    paddingTop: spacing.xl,
    gap: spacing.md,
    backgroundColor: "rgba(0,0,0,0.4)",
    borderTopWidth: 1,
    borderTopColor: colors.border,
    justifyContent: "center",
    alignItems: "center",
  },
  primaryButton: {
    borderRadius: radius.pill,
    paddingHorizontal: spacing.xl,
  },
  shareButtonWrapper: {
    justifyContent: "center",
  },
});
