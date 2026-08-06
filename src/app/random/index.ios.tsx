import { Dimensions, Platform, Pressable, StyleSheet, View } from "react-native";
import { Text, Chip } from "react-native-paper";
import { colors, fontWeight, fontSize, radius, spacing } from "../../constants/design";
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
import { RandomQuestionMarks, ActionButtons } from "../../components/Random/shared";
import GenresView from "../../components/GenresView";
import PlatformBlurView from "../../components/PlatformBlurView";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");
const CARD_WIDTH = screenWidth * 0.9;
const CARD_HEIGHT = screenHeight * 0.65;
const PRIMARY_COLOR = colors.primary;

export default function RandomMovie() {
  const t = useTranslation();

  const frontOpacity = useSharedValue(1);
  const frontScale = useSharedValue(1);
  const backOpacity = useSharedValue(0);
  const backScale = useSharedValue(0.8);
  const diceRotate = useSharedValue(0);

  const { movie, details, isLoading, isRevealed, superLikeIconScale, fetchRandomMovie, handleViewDetails, handleSuperLike, handleBlock } =
    useRandomMovie({
      diceRotate,
      onReveal: () => {
        frontOpacity.value = withTiming(0, { duration: 400, easing: Easing.out(Easing.cubic) });
        frontScale.value = withTiming(0.8, { duration: 400, easing: Easing.out(Easing.cubic) });
        backOpacity.value = withTiming(1, { duration: 400, easing: Easing.out(Easing.cubic) });
        backScale.value = withSequence(
          withTiming(1.05, { duration: 300, easing: Easing.out(Easing.cubic) }),
          withSpring(1, { damping: 12, stiffness: 100 }),
        );
      },
      onReset: () => {
        frontOpacity.value = withTiming(1, { duration: 300, easing: Easing.out(Easing.cubic) });
        frontScale.value = withTiming(1, { duration: 300, easing: Easing.out(Easing.cubic) });
        backOpacity.value = withTiming(0, { duration: 300, easing: Easing.out(Easing.cubic) });
        backScale.value = withTiming(0.8, { duration: 300, easing: Easing.out(Easing.cubic) });
      },
    });

  const frontAnimatedStyle = useAnimatedStyle(() => ({
    opacity: frontOpacity.value,
    transform: [{ scale: frontScale.value }],
    zIndex: frontOpacity.value > 0.5 ? 1 : 0,
  }));

  const backAnimatedStyle = useAnimatedStyle(() => ({
    opacity: backOpacity.value,
    transform: [{ scale: backScale.value }],
    zIndex: backOpacity.value > 0.5 ? 1 : 0,
  }));

  const diceIconStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${diceRotate.value}deg` }],
  }));

  return (
    <View style={styles.container}>
      <SafeIOSContainer style={styles.safeArea}>
        <PageHeading showBackButton title={t("games.random.title")}>
          <PlatformBlurView style={styles.filterButtonWrapper}>
            <FilterButton size={25} />
          </PlatformBlurView>
        </PageHeading>

        <View style={styles.content}>
          <View style={styles.cardContainer}>
            {/* FRONT FACE (Dice) */}
            <Animated.View style={[styles.cardFace, styles.frontFace, frontAnimatedStyle]}>
              <View style={styles.solidFrontBackground}>
                <Canvas style={StyleSheet.absoluteFill}>
                  <Rect x={0} y={0} width={CARD_WIDTH} height={CARD_HEIGHT}>
                    <RadialGradient c={vec(CARD_WIDTH / 2, CARD_HEIGHT / 2)} r={CARD_WIDTH * 0.8} colors={["#9370DB", "#4B0082"]} />
                  </Rect>
                </Canvas>

                <Animated.View style={diceIconStyle}>
                  <MaterialCommunityIcons name="dice-multiple" size={100} color="rgba(255,255,255,0.9)" />
                </Animated.View>
                <Text style={styles.frontText}>{isLoading ? t("games.random.revealing") : t("games.random.hint")}</Text>

                <RandomQuestionMarks cardWidth={CARD_WIDTH} cardHeight={CARD_HEIGHT} />
              </View>
            </Animated.View>

            {/* BACK FACE (Movie) */}
            <Animated.View style={[styles.cardFace, styles.backFace, backAnimatedStyle]}>
              {movie && (
                <Pressable onPress={handleViewDetails} style={styles.cardPressable}>
                  <Image source={{ uri: `https://image.tmdb.org/t/p/w780${movie.poster_path}` }} style={styles.poster} contentFit="cover" />
                  <LinearGradient
                    colors={["transparent", "rgba(0,0,0,0.6)", "rgba(0,0,0,0.95)", "#000"]}
                    locations={[0, 0.4, 0.75, 1]}
                    style={styles.infoOverlay}
                  >
                    <Text style={styles.movieTitle} numberOfLines={2}>
                      {movie.title || movie.name}
                    </Text>

                    <View style={styles.ratingRow}>
                      <MaterialCommunityIcons name="star" size={16} color="#fbbf24" />
                      <Text style={styles.ratingText}>{movie.vote_average.toFixed(1)}</Text>
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

                    <View style={styles.actions}>
                      <View style={styles.hintRow}>
                        <Text style={styles.hintText}>{t("fortune-wheel.tap-for-details")}</Text>
                        <MaterialCommunityIcons name="chevron-right" size={14} color="rgba(255,255,255,0.5)" />
                      </View>
                      <ActionButtons
                        onSuperLike={handleSuperLike}
                        onBlock={handleBlock}
                        superLikeLabel={t("swipe.super")}
                        blockLabel={t("swipe.block")}
                        superLikeIconScale={superLikeIconScale}
                      />
                    </View>
                  </LinearGradient>
                </Pressable>
              )}
            </Animated.View>
          </View>
        </View>

        <Animated.View style={[styles.bottomBar]} entering={SlideInDown.duration(400)}>
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
              <ShareTicketButton movie={{ ...movie, genres: details.genres, tagline: details.tagline }} />
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
    backgroundColor: "#000",
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
    color: "#fff",
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
    color: "#fff",
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
    flexWrap: "wrap",
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
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.xl,
    gap: spacing.md,
    backgroundColor: "rgba(0,0,0,0.4)",
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.1)",
  },
  primaryButton: {
    flex: 1,
    borderRadius: 30,
  },
  buttonContent: {
    paddingVertical: spacing.sm,
  },
  buttonLabel: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    letterSpacing: 0.5,
  },
  shareButtonWrapper: {
    justifyContent: "center",
  },
  actions: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },

  hintRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: spacing.md,
  },
  hintText: {
    color: "rgba(255,255,255,0.5)",
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
  },
});
