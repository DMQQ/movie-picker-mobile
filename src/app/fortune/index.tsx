import { useCallback, useEffect, useRef, useState } from "react";
import { Dimensions, Image, Platform, Pressable, StyleSheet, useWindowDimensions, View } from "react-native";
import { Button, Text, Chip } from "react-native-paper";
import Animated, { FadeIn, FadeOut, SlideInDown, SlideOutDown } from "react-native-reanimated";
import { Movie, MovieDetails } from "../../../types";
import { FancySpinner } from "../../components/FancySpinner";
import FortuneWheelComponent from "../../components/FortuneWheelComponent";
import SafeIOSContainer from "../../components/SafeIOSContainer";
import { useLazyGetMovieQuery, useLazyGetRandomSectionQuery, useLazyGetSectionMoviesQuery } from "../../redux/movie/movieApi";
import useTranslation from "../../service/useTranslation";
import fillMissing from "../../utils/fillMissing";
import { shuffleInPlace } from "../../utils/shuffle";
import { throttle } from "../../utils/throttle";
import PageHeading from "../../components/PageHeading";
import { router, useLocalSearchParams } from "expo-router";
import { FilterButton, useMediaFilters } from "../../components/MediaFilters";
import { useBlockedMovies } from "../../hooks/useBlockedMovies";
import { useSuperLikedMovies } from "../../hooks/useSuperLikedMovies";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Image as ExpoImage } from "expo-image";
import { ActionButtons } from "../../components/Random/shared";
import { ThumbnailSizes } from "../../components/Thumbnail";
import * as Haptics from "expo-haptics";

const { width: screenWidth, height: screenHeight } = Dimensions.get("screen");
const CARD_WIDTH = screenWidth * 0.85;
const CARD_HEIGHT = screenHeight * 0.55;

export default function FortuneWheel() {
  const [signatures, setSignatures] = useState("");

  const wheelRef = useRef<{ spin: Function }>(null);

  const params = useLocalSearchParams();

  const { getFilterParams } = useMediaFilters();
  const { blockedMovies, blockMovie } = useBlockedMovies();
  const { superLikeMovie } = useSuperLikedMovies();
  const [getMovieDetails] = useLazyGetMovieQuery();

  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [movieDetails, setMovieDetails] = useState<MovieDetails | null>(null);

  const navigate = useCallback(
    async (item: Movie) => {
      setIsSpin(false);
      if (!item) return;

      setSelectedMovie(item);

      const type = item?.type === "tv" ? "tv" : "movie";
      const detailsResponse = await getMovieDetails({ id: item.id, type });
      if (detailsResponse.data) {
        setMovieDetails(detailsResponse.data);
      }

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    },
    [getMovieDetails]
  );

  const handleViewDetails = useCallback(() => {
    if (!selectedMovie) return;
    const type = selectedMovie.type === "tv" ? "tv" : "movie";
    router.push({
      pathname: "/movie/type/[type]/[id]",
      params: {
        id: selectedMovie.id,
        img: selectedMovie.poster_path,
        type: type,
      },
    });
  }, [selectedMovie]);

  const handleSuperLike = useCallback(() => {
    if (!selectedMovie) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    superLikeMovie(selectedMovie);
  }, [selectedMovie, superLikeMovie]);

  const handleBlock = useCallback(() => {
    if (!selectedMovie) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    blockMovie(selectedMovie);
    setSelectedMovie(null);
    setMovieDetails(null);
  }, [selectedMovie, blockMovie]);

  const handleCloseCard = useCallback(() => {
    setSelectedMovie(null);
    setMovieDetails(null);
  }, []);

  const [selectedCards, setSelectedCards] = useState<{
    results: Movie[];
    name: string;
  }>({
    results: [],
    name: "",
  });

  const [getLazyRandomSection] = useLazyGetRandomSectionQuery();

  const [getLazySection] = useLazyGetSectionMoviesQuery();

  const handleThrowDice = useCallback(
    (value?: number | string) => {
      const handleResponse = async (response: any) => {
        if (response.data && Array.isArray(response.data.results)) {
          const movies = response.data.results as Movie[];

          await Promise.allSettled(movies.map((movie) => Image.prefetch("https://image.tmdb.org/t/p/w200" + movie.poster_path)));

          const shuffled = shuffleInPlace([...movies]);

          const newSelectedCards = {
            results: fillMissing(shuffled.slice(0, 10), 12),
            name: response.data.name || "",
          };

          setSelectedCards(newSelectedCards);
          setSignatures(shuffled.map(({ id }) => id).join("-"));
        } else {
          console.log("No data or results in response:", response);
        }
      };

      if (value) {
        getLazySection({ name: value as string })
          .then(handleResponse)
          .catch(console.error);
        return;
      }

      const filterParams = getFilterParams();
      const blockedIds = blockedMovies.map((m) => `${m.movie_type === "tv" ? "t" : "m"}${m.movie_id}`);
      getLazyRandomSection({ not: selectedCards.name, notMovies: blockedIds.join(","), ...filterParams })
        .then(handleResponse)
        .catch(console.error);
    },
    [selectedCards.name, getLazySection, getLazyRandomSection, getFilterParams, blockedMovies],
  );

  const [isSpin, setIsSpin] = useState(false);

  const handleFiltersApplied = useCallback(() => {
    if (!params?.category && !params?.movies) {
      handleThrowDice();
    }
  }, [handleThrowDice, params?.category, params?.movies]);

  useEffect(() => {
    if (params?.category) {
      handleThrowDice(params.category as string);
    }
  }, [params?.category, handleThrowDice]);

  useEffect(() => {
    const bootstrap = async () => {
      if (!params?.category && !params?.movies) {
        handleThrowDice();
      } else if (params?.category && params?.movies) {
        handleThrowDice();
      } else if (params?.movies) {
        const movies =
          typeof params.movies === "string"
            ? (JSON.parse(params.movies) as Movie[])
            : (JSON.parse((params.movies as string[])[0]) as Movie[]);

        Promise.allSettled(movies.map((movie) => Image.prefetch("https://image.tmdb.org/t/p/w200" + movie.poster_path)));

        const shuffled = shuffleInPlace([...movies]);

        setSelectedCards({
          results: fillMissing(shuffled.slice(0, 12), 12),
          name: "",
        });
        setSignatures(shuffled.map(({ id }) => id).join("-"));
      }
    };

    bootstrap();
  }, [params?.category, params?.movies]);

  const { width, height } = useWindowDimensions();

  const t = useTranslation();

  return (
    <SafeIOSContainer style={{ overflow: "hidden", backgroundColor: "#000" }}>
      <PageHeading showBackButton title="">
        <View style={fortuneStyles.filterButtonWrapper}>
          <FilterButton size={22} onApply={handleFiltersApplied} />
        </View>
      </PageHeading>

      {/* Movie Card - shown behind wheel when selected */}
      {selectedMovie && (
        <Animated.View entering={FadeIn.duration(400).withInitialValues({ transform: [{ translateY: 50 }] })} exiting={FadeOut.duration(300)} style={fortuneStyles.cardOverlay}>
          <Pressable onPress={handleViewDetails} style={fortuneStyles.card}>
            <ExpoImage
              placeholder={`https://image.tmdb.org/t/p/${ThumbnailSizes.poster.tiny}${selectedMovie.poster_path}`}
              source={{ uri: `https://image.tmdb.org/t/p/w780${selectedMovie.poster_path}` }}
              style={fortuneStyles.poster}
              contentFit="cover"
            />
            <LinearGradient
              colors={["transparent", "rgba(0,0,0,0.6)", "rgba(0,0,0,0.95)", "#000"]}
              locations={[0, 0.4, 0.75, 1]}
              style={fortuneStyles.infoOverlay}
            >
              <Text style={fortuneStyles.movieTitle} numberOfLines={2}>
                {selectedMovie.title || selectedMovie.name}
              </Text>

              <View style={fortuneStyles.ratingRow}>
                <MaterialCommunityIcons name="star" size={16} color="#fbbf24" />
                <Text style={fortuneStyles.ratingText}>{selectedMovie.vote_average.toFixed(1)}</Text>
                {movieDetails?.runtime ? (
                  <>
                    <Text style={fortuneStyles.dotSeparator}>•</Text>
                    <Text style={fortuneStyles.ratingText}>{movieDetails.runtime} min</Text>
                  </>
                ) : null}

                {movieDetails?.genres && movieDetails.genres.length > 0 && (
                  <>
                    <Text style={fortuneStyles.dotSeparator}>•</Text>
                    {movieDetails.genres.slice(0, 2).map((genre) => (
                      <Chip key={genre.id} style={fortuneStyles.genreChip} textStyle={fortuneStyles.genreText} compact>
                        {genre.name}
                      </Chip>
                    ))}
                  </>
                )}
              </View>

              {selectedMovie.overview && (
                <Text style={fortuneStyles.overview} numberOfLines={3}>
                  {selectedMovie.overview}
                </Text>
              )}

              <ActionButtons
                onSuperLike={handleSuperLike}
                onBlock={handleBlock}
                superLikeLabel={t("swipe.super")}
                blockLabel={t("swipe.block")}
              />
            </LinearGradient>
          </Pressable>

          <Button mode="text" onPress={handleCloseCard} textColor="#fff" style={fortuneStyles.spinAgainButton}>
            {t("games.random.try-again")}
          </Button>
        </Animated.View>
      )}

      {!selectedMovie && (
        <Animated.View
          entering={FadeIn}
          exiting={FadeOut}
          style={{
            justifyContent: "center",
            alignItems: "center",
            height: height - 350,
            position: "absolute",
            top: 0,
            width,
          }}
        >
          {isSpin && <FancySpinner size={150} />}

          {!isSpin && (
            <>
              <Text
                style={{
                  fontSize: params?.movies ? (params?.title.length > 10 ? 55 : 70) : 70,
                  fontFamily: "Bebas",
                  textAlign: "center",
                }}
              >
                {params?.movies ? params?.title : t("fortune-wheel.pick-a-movie")}
              </Text>
              <View style={{ flexDirection: "row" }}>
                <Button rippleColor={"#fff"} onPress={throttle(() => handleThrowDice(), 200)}>
                  {t("fortune-wheel.random-category")}
                </Button>

                <Button
                  rippleColor={"#fff"}
                  onPress={throttle(() => {
                    router.push("/fortune/filters");
                  }, 500)}
                >
                  {t("filters.categories")}
                </Button>
              </View>
            </>
          )}
        </Animated.View>
      )}

      {selectedCards?.results?.length > 0 && (
        <FortuneWheelComponent
          ref={wheelRef as any}
          style={{}}
          key={signatures}
          onSpinStart={() => {
            setIsSpin(true);
            setSelectedMovie(null);
            setMovieDetails(null);
          }}
          onSelectedItem={navigate}
          size={screenWidth * 2}
          items={selectedCards.results as any}
        />
      )}
    </SafeIOSContainer>
  );
}

const fortuneStyles = StyleSheet.create({
  filterButtonWrapper: {
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    borderRadius: 100,
  },
  cardOverlay: {
    position: "absolute",
    top: 60,
    left: 0,
    right: 0,
    alignItems: "center",
    zIndex: -1,
  },
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 20,
    overflow: "hidden",
    backgroundColor: "#1e1e1e",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 10,
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
    padding: 16,
    paddingTop: 60,
    justifyContent: "flex-end",
  },
  movieTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#fff",
    marginBottom: 6,
    fontFamily: Platform.OS === "ios" ? "System" : "sans-serif-condensed",
    textShadowColor: "rgba(0,0,0,0.5)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 8,
    flexWrap: "wrap",
  },
  ratingText: {
    color: "#e2e8f0",
    fontWeight: "600",
    fontSize: 13,
  },
  dotSeparator: {
    color: "#64748b",
    fontSize: 13,
  },
  genreChip: {
    backgroundColor: "rgba(255,255,255,0.3)",
    height: 24,
  },
  genreText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "600",
    marginVertical: 0,
    marginHorizontal: 2,
  },
  overview: {
    color: "rgba(255,255,255,0.85)",
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "400",
  },
  spinAgainButton: {
    marginTop: 12,
  },
});
