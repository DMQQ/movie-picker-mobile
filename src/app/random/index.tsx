import { useCallback, useState } from "react";
import { Dimensions, Platform, StyleSheet, View } from "react-native";
import { Button, Text, Chip, MD2DarkTheme } from "react-native-paper";
import Animated, {
  FadeIn,
  FadeOut,
  SlideInDown,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
  runOnJS,
  Easing,
  interpolate,
  withRepeat,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Movie, MovieDetails } from "../../../types";
import SafeIOSContainer from "../../components/SafeIOSContainer";
import { useLazyGetMovieQuery, useLazyGetRandomSectionQuery } from "../../redux/movie/movieApi";
import useTranslation from "../../service/useTranslation";
import PageHeading from "../../components/PageHeading";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import { Canvas, RadialGradient, Rect, vec } from "@shopify/react-native-skia";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");
const CARD_WIDTH = screenWidth * 0.9;
const CARD_HEIGHT = screenHeight * 0.65;
const PRIMARY_COLOR = MD2DarkTheme.colors.primary;

export default function RandomMovie() {
  const t = useTranslation();
  const insets = useSafeAreaInsets();
  const [getRandomSection] = useLazyGetRandomSectionQuery();
  const [getMovieDetails] = useLazyGetMovieQuery();

  const [movie, setMovie] = useState<Movie | null>(null);
  const [details, setDetails] = useState<MovieDetails | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isRevealed, setIsRevealed] = useState(false);

  const rotateY = useSharedValue(0);
  const scale = useSharedValue(1);
  const diceRotate = useSharedValue(0);

  const triggerHaptic = useCallback((type: "impact" | "notification") => {
    if (Platform.OS === "ios") {
      if (type === "impact") {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      } else {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    }
  }, []);

  const resetCard = useCallback(() => {
    setIsRevealed(false);
    rotateY.value = withTiming(0, { duration: 400, easing: Easing.out(Easing.cubic) });
  }, [rotateY]);

  const revealCard = useCallback(() => {
    setIsRevealed(true);
    rotateY.value = withSequence(withTiming(0, { duration: 0 }), withTiming(180, { duration: 600, easing: Easing.out(Easing.back(1.5)) }));
    scale.value = withSequence(withTiming(0.9, { duration: 100 }), withSpring(1, { damping: 12, stiffness: 100 }));
    runOnJS(triggerHaptic)("notification");
  }, [rotateY, scale, triggerHaptic]);

  const fetchRandomMovie = useCallback(async () => {
    if (isLoading) return;

    if (isRevealed) {
      resetCard();
      setTimeout(async () => {
        startSearch();
      }, 400);
    } else {
      startSearch();
    }

    async function startSearch() {
      setIsLoading(true);
      setMovie(null);
      setDetails(null);
      triggerHaptic("impact");

      diceRotate.value = withRepeat(withTiming(360, { duration: 800, easing: Easing.linear }), -1, false);

      try {
        const response = await getRandomSection("");
        if (response.data?.results?.length > 0) {
          const randomIndex = Math.floor(Math.random() * response.data.results.length);
          const selectedMovie = response.data.results[randomIndex];
          const type = selectedMovie.type === "tv" ? "tv" : "movie";

          const detailsResponse = await getMovieDetails({ id: selectedMovie.id, type });

          setTimeout(() => {
            setMovie(selectedMovie);
            if (detailsResponse.data) {
              setDetails(detailsResponse.data);
            }
            diceRotate.value = 0;
            setIsLoading(false);
            revealCard();
          }, 600);
        } else {
          setIsLoading(false);
          diceRotate.value = 0;
        }
      } catch (error) {
        setIsLoading(false);
        diceRotate.value = 0;
      }
    }
  }, [isLoading, isRevealed, getRandomSection, getMovieDetails, resetCard, revealCard, triggerHaptic, diceRotate]);

  const handleViewDetails = useCallback(() => {
    if (!movie) return;
    const type = movie.type === "tv" ? "tv" : "movie";
    router.push({
      pathname: "/movie/type/[type]/[id]",
      params: {
        id: movie.id,
        img: movie.poster_path,
        type: type,
      },
    });
  }, [movie]);

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

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["#0f172a", "#1e1b4b", "#172554"]}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      <SafeIOSContainer style={styles.safeArea}>
        <PageHeading
          showBackButton
          title={t("games.random.title")}
          styles={{ marginTop: Platform.OS === "android" ? insets.top + 20 : 0 }}
        />

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

                {/* Content stays on top */}
                <Animated.View style={diceIconStyle}>
                  <MaterialCommunityIcons name="dice-multiple" size={100} color="rgba(255,255,255,0.9)" />
                </Animated.View>
                <Text style={styles.frontText}>{isLoading ? t("games.random.revealing") : t("games.random.hint")}</Text>
              </View>
            </Animated.View>

            {/* BACK FACE (Movie) */}
            <Animated.View style={[styles.cardFace, styles.backFace, backAnimatedStyle]}>
              {movie && (
                <>
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
                        {details.genres.slice(0, 3).map((genre) => (
                          <Chip key={genre.id} style={styles.genreChip} textStyle={styles.genreText} compact>
                            {genre.name}
                          </Chip>
                        ))}
                      </View>
                    )}

                    {movie.overview && (
                      <Text style={styles.overview} numberOfLines={3}>
                        {movie.overview}
                      </Text>
                    )}
                  </LinearGradient>
                </>
              )}
            </Animated.View>
          </View>
        </View>

        <Animated.View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 24) }]} entering={SlideInDown.duration(400)}>
          <Button
            mode="contained"
            onPress={fetchRandomMovie}
            loading={isLoading}
            disabled={isLoading}
            style={styles.primaryButton}
            contentStyle={styles.buttonContent}
            labelStyle={styles.buttonLabel}
            icon={movie && isRevealed ? "refresh" : "dice-multiple"}
            buttonColor={PRIMARY_COLOR}
            textColor="#fff"
          >
            {movie && isRevealed ? t("games.random.try-again") : t("games.random.reveal")}
          </Button>

          {movie && isRevealed && (
            <Animated.View entering={FadeIn} style={{ flex: 1 }}>
              <Button
                mode="outlined"
                onPress={handleViewDetails}
                style={styles.secondaryButton}
                contentStyle={styles.buttonContent}
                labelStyle={styles.buttonLabel}
                icon="eye"
                textColor="#fff"
              >
                {t("games.random.view-details")}
              </Button>
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
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 60,
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
    borderRadius: 28,
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
  solidFrontBackground: {
    flex: 1,
    backgroundColor: PRIMARY_COLOR, // Solid Primary Color
    alignItems: "center",
    justifyContent: "center",
    gap: 24,
  },
  frontText: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "700",
    opacity: 0.9,
    letterSpacing: 0.5,
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
    padding: 20,
    paddingTop: 80,
    justifyContent: "flex-end",
  },
  movieTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: "#fff",
    marginBottom: 8,
    fontFamily: Platform.OS === "ios" ? "System" : "sans-serif-condensed",
    textShadowColor: "rgba(0,0,0,0.5)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 10,
  },
  ratingText: {
    color: "#e2e8f0",
    fontWeight: "600",
    fontSize: 14,
  },
  dotSeparator: {
    color: "#64748b",
    fontSize: 14,
  },
  genresRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginBottom: 10,
  },
  genreChip: {
    backgroundColor: "rgba(255,255,255,0.2)",
    height: 26,
  },
  genreText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "600",
    marginVertical: 0,
    marginHorizontal: 2,
  },
  overview: {
    color: "rgba(255,255,255,0.85)",
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "400",
  },
  bottomBar: {
    flexDirection: "row",
    paddingHorizontal: 24,
    paddingTop: 20,
    gap: 12,
    backgroundColor: "rgba(0,0,0,0.4)",
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.1)",
  },
  primaryButton: {
    flex: 1,
    borderRadius: 30,
  },
  secondaryButton: {
    flex: 1,
    borderRadius: 30,
    borderColor: "rgba(255,255,255,0.4)",
    borderWidth: 1,
  },
  buttonContent: {
    paddingVertical: 8,
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
});
