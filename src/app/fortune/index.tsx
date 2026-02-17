import { useCallback, useEffect, useRef, useState } from "react";
import { Dimensions, Image, StyleSheet, useWindowDimensions, View } from "react-native";
import { Button, Text } from "react-native-paper";
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
import * as Haptics from "expo-haptics";
import MovieResultCard from "../../components/Random/MovieResultCard";

const { width: screenWidth } = Dimensions.get("screen");

export default function FortuneWheel() {
  const wheelRef = useRef<{ spin: Function }>(null);

  const params = useLocalSearchParams();

  const { getFilterParams } = useMediaFilters();
  const { blockedMovies, blockMovie } = useBlockedMovies();
  const { superLikeMovie } = useSuperLikedMovies();
  const [getMovieDetails] = useLazyGetMovieQuery();

  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [movieDetails, setMovieDetails] = useState<MovieDetails | null>(null);
  const prefetchedDetails = useRef<MovieDetails | null>(null);

  const handleWinnerPredicted = useCallback(
    async (item: Movie) => {
      if (!item) return;
      const type = item?.type === "tv" ? "tv" : "movie";
      const detailsResponse = await getMovieDetails({ id: item.id, type });
      if (detailsResponse.data) {
        prefetchedDetails.current = detailsResponse.data;
      }
    },
    [getMovieDetails],
  );

  const navigate = useCallback((item: Movie) => {
    setIsSpin(false);
    if (!item) return;

    setSelectedMovie(item);

    if (prefetchedDetails.current) {
      setMovieDetails(prefetchedDetails.current);
      prefetchedDetails.current = null;
    }

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, []);

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

  const [selectedCards, setSelectedCards] = useState<{
    results: Movie[];
    name: string;
  }>({
    results: [],
    name: "",
  });

  const [shouldSpin, setShouldSpin] = useState(false);

  useEffect(() => {
    if (shouldSpin && selectedCards.results.length > 0) {
      const timer = setTimeout(() => {
        wheelRef.current?.spin();
        setShouldSpin(false);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [shouldSpin, selectedCards.results]);

  const [getLazyRandomSection] = useLazyGetRandomSectionQuery();

  const [getLazySection] = useLazyGetSectionMoviesQuery();

  const handleThrowDice = useCallback(
    (value?: number | string) => {
      prefetchedDetails.current = null;

      const handleResponse = async (response: any) => {
        if (response.data && Array.isArray(response.data.results) && response.data.results.length > 0) {
          const movies = response.data.results as Movie[];

          const shuffled = shuffleInPlace([...movies]);

          const newSelectedCards = {
            results: fillMissing(shuffled.slice(0, 12), 12),
            name: response.data.name || "",
          };

          setSelectedCards(newSelectedCards);
          setShouldSpin(true);
        } else {
          console.log("No data or results in response:", response);
        }
      };

      const handleError = (error: any) => {
        console.error("Failed to fetch movies:", error);
      };

      if (value) {
        getLazySection({ name: value as string })
          .then(handleResponse)
          .catch(handleError);
        return;
      }

      const filterParams = getFilterParams();
      const blockedIds = blockedMovies.map((m) => `${m.movie_type === "tv" ? "t" : "m"}${m.movie_id}`);
      getLazyRandomSection({ not: selectedCards.name, notMovies: blockedIds.join(","), ...filterParams })
        .then(handleResponse)
        .catch(handleError);
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

        const shuffled = shuffleInPlace([...movies]);

        setSelectedCards({
          results: fillMissing(shuffled.slice(0, 12), 12),
          name: "",
        });
      }
    };

    bootstrap();
  }, [params?.category, params?.movies]);

  const { width, height } = useWindowDimensions();

  const t = useTranslation();

  return (
    <SafeIOSContainer style={{ overflow: "hidden", backgroundColor: "#000" }}>
      <PageHeading showBackButton title="" extraScreenPaddingTop={15}>
        <View style={fortuneStyles.filterButtonWrapper}>
          <FilterButton size={22} onApply={handleFiltersApplied} />
        </View>
      </PageHeading>

      {selectedMovie && (
        <Animated.View
          entering={FadeIn.duration(400).withInitialValues({ transform: [{ translateY: 50 }] })}
          exiting={FadeOut.duration(300)}
          style={fortuneStyles.cardOverlay}
        >
          <MovieResultCard
            movie={selectedMovie}
            details={movieDetails}
            onPress={handleViewDetails}
            onSuperLike={handleSuperLike}
            onBlock={handleBlock}
            superLikeLabel={t("swipe.super") as string}
            blockLabel={t("swipe.block") as string}
          />

          <View style={fortuneStyles.buttonsRow}>
            <Button mode="text" icon="refresh" onPress={throttle(() => handleThrowDice(), 200)}>
              {t("fortune-wheel.random-category")}
            </Button>
            <Button mode="text" icon="filter-variant" onPress={() => router.navigate("/fortune/filters")}>
              {t("filters.categories")}
            </Button>
          </View>
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
                  onPress={() => {
                    router.navigate("/fortune/filters");
                  }}
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
          onSpinStart={() => {
            setIsSpin(true);
            setSelectedMovie(null);
            setMovieDetails(null);
            prefetchedDetails.current = null;
          }}
          onSelectedItem={navigate}
          onWinnerPredicted={handleWinnerPredicted}
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
    top: 80,
    left: 0,
    right: 0,
    alignItems: "center",
    zIndex: -1,
  },
  buttonsRow: {
    flexDirection: "row",
    marginTop: 16,
  },
});
