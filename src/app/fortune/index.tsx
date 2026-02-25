import { useCallback, useEffect, useRef, useState } from "react";
import { Dimensions, Platform, StyleSheet, useWindowDimensions, View } from "react-native";
import { Button, MD2DarkTheme, Text } from "react-native-paper";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import { Movie, MovieDetails } from "../../../types";
import FateText from "../../components/FateText";
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
import MovieResultCard, { CARD_HEIGHT } from "../../components/Random/MovieResultCard";
import PlatformBlurView from "../../components/PlatformBlurView";

const { width: screenWidth } = Dimensions.get("screen");

export default function FortuneWheel() {
  const wheelRef = useRef<{ spin: Function }>(null);

  const params = useLocalSearchParams();

  const { getFilterParams } = useMediaFilters();
  const { getBlockedIds, blockMovie } = useBlockedMovies();
  const { superLikeMovie } = useSuperLikedMovies();
  const [getMovieDetails] = useLazyGetMovieQuery();

  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [movieDetails, setMovieDetails] = useState<MovieDetails | null>(null);
  const [isSuperLiked, setIsSuperLiked] = useState(false);
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

  const navigate = useCallback(
    async (item: Movie) => {
      setIsSpin(false);
      if (!item?.id) return;

      setIsSuperLiked(false);

      let details = prefetchedDetails.current;
      prefetchedDetails.current = null;

      if (!details) {
        const type = item?.type === "tv" ? "tv" : "movie";
        const detailsResponse = await getMovieDetails({ id: item.id, type });
        details = detailsResponse.data || null;
      }

      if (details) {
        setSelectedMovie({ ...item, ...details } as Movie);
        setMovieDetails(details);
      } else {
        setSelectedMovie(item);
      }

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    },
    [getMovieDetails],
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
    setIsSuperLiked(true);
  }, [selectedMovie, superLikeMovie]);

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

  const handleThrowDice = (value?: number | string) => {
    prefetchedDetails.current = null;

    if (params?.movies) {
      try {
        const movies =
          typeof params.movies === "string"
            ? (JSON.parse(params.movies) as Movie[])
            : (JSON.parse((params.movies as string[])[0]) as Movie[]);

        const shuffled = shuffleInPlace([...movies]);

        setSelectedCards({
          results: fillMissing(shuffled.slice(0, 12), 12),
          name: (params.title as string) || "",
        });
        setShouldSpin(true);
      } catch (error) {}
      return;
    }

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
    const blockedIds = getBlockedIds().map((m) => `${m.type === "tv" ? "t" : "m"}${m.id}`);
    getLazyRandomSection({ not: selectedCards.name, notMovies: blockedIds.join(","), ...filterParams })
      .then(handleResponse)
      .catch(handleError);
  };

  const handleBlock = useCallback(() => {
    if (!selectedMovie) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    blockMovie(selectedMovie);
    setSelectedMovie(null);
    setMovieDetails(null);
    setIsSuperLiked(false);
    handleThrowDice();
  }, [selectedMovie, blockMovie]);

  const [isSpin, setIsSpin] = useState(false);

  const handleFiltersApplied = () => {
    handleThrowDice();
  };

  useEffect(() => {
    if (params?.movies) {
      try {
        const movies =
          typeof params.movies === "string"
            ? (JSON.parse(params.movies) as Movie[])
            : (JSON.parse((params.movies as string[])[0]) as Movie[]);

        const shuffled = shuffleInPlace([...movies]);

        setSelectedCards({
          results: fillMissing(shuffled.slice(0, 12), 12),
          name: (params?.title as string) || "",
        });
        setShouldSpin(true);
      } catch (error) {}
      return;
    }

    if (params?.category) {
      handleThrowDice(params.category as string);
      return;
    }

    handleThrowDice();
  }, [params?.category, params?.movies, params?.title]);

  const { width, height } = useWindowDimensions();

  const t = useTranslation();

  return (
    <SafeIOSContainer style={{ overflow: "hidden", backgroundColor: "#000" }}>
      <PageHeading showGradientBackground showBackButton title={(params?.title as string) || ""}>
        <PlatformBlurView style={fortuneStyles.filterButtonWrapper}>
          <FilterButton shouldAutoOpen size={25} onApply={handleFiltersApplied} onCategorySelect={handleThrowDice} showCategories />
        </PlatformBlurView>
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
            isSuperLiked={isSuperLiked}
          />
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
          {isSpin && <FateText />}

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
              <Button rippleColor={"#fff"} icon="refresh" onPress={throttle(() => handleThrowDice(), 200)}>
                {t("fortune-wheel.spin-again")}
              </Button>
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

      {selectedMovie && (
        <Animated.View
          style={{
            position: "absolute",
            top: height * 0.1 + CARD_HEIGHT - 15,
            left: 0,
            right: 0,
            justifyContent: "center",
            alignItems: "center",
          }}
          entering={FadeIn.delay(300)}
        >
          <Button mode="text" icon="refresh" onPress={throttle(() => handleThrowDice(), 200)}>
            {t("fortune-wheel.spin-again")}
          </Button>
        </Animated.View>
      )}
    </SafeIOSContainer>
  );
}

const fortuneStyles = StyleSheet.create({
  filterButtonWrapper: {
    borderRadius: 100,
    ...Platform.select({
      android: {
        backgroundColor: MD2DarkTheme.colors.surface,
        borderWidth: 1,
        borderColor: "#343434ff",
      },
    }),
  },
  cardOverlay: {
    position: "absolute",
    top: "10%",
    left: 0,
    right: 0,
    alignItems: "center",
    zIndex: -1,
  },
});
