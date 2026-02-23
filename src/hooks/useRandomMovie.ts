import { useCallback, useState } from "react";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import { SharedValue, useSharedValue, withRepeat, withTiming, withSequence, withSpring, Easing } from "react-native-reanimated";
import { Movie, MovieDetails } from "../../types";
import { useLazyGetMovieQuery, useLazyGetRandomSectionQuery } from "../redux/movie/movieApi";
import { useMediaFilters } from "../components/MediaFilters";
import { useBlockedMovies } from "./useBlockedMovies";
import { useSuperLikedMovies } from "./useSuperLikedMovies";

interface UseRandomMovieOptions {
  diceRotate: SharedValue<number>;
  onReveal: () => void;
  onReset: () => void;
}

export function useRandomMovie({ diceRotate, onReveal, onReset }: UseRandomMovieOptions) {
  const [getRandomSection] = useLazyGetRandomSectionQuery();
  const [getMovieDetails] = useLazyGetMovieQuery();
  const { getFilterParams } = useMediaFilters();
  const { getBlockedIds, blockMovie } = useBlockedMovies();
  const { superLikeMovie } = useSuperLikedMovies();

  const [movie, setMovie] = useState<Movie | null>(null);
  const [seenMovies, setSeenMovies] = useState<string[]>([]);
  const [details, setDetails] = useState<MovieDetails | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isRevealed, setIsRevealed] = useState(false);
  const superLikeIconScale = useSharedValue(1);

  const triggerHaptic = useCallback((type: "impact" | "notification") => {
    if (type === "impact") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  }, []);

  const resetCard = useCallback(() => {
    setIsRevealed(false);
    onReset();
  }, [onReset]);

  const revealCard = useCallback(() => {
    setIsRevealed(true);
    onReveal();
    triggerHaptic("notification");
  }, [onReveal, triggerHaptic]);

  const fetchRandomMovie = useCallback(async () => {
    if (isLoading) return;
    setIsLoading(true);
    superLikeIconScale.value = 1;

    if (isRevealed) {
      resetCard();
      setTimeout(async () => {
        startSearch();
      }, 400);
    } else {
      startSearch();
    }

    async function startSearch() {
      setMovie(null);
      setDetails(null);
      triggerHaptic("impact");

      diceRotate.value = withRepeat(withTiming(360, { duration: 800, easing: Easing.linear }), -1, false);

      try {
        const filterParams = getFilterParams();
        const blockedIds = getBlockedIds().map((m) => `${m.type === "tv" ? "t" : "m"}${m.id}`);
        const excludeIds = [...seenMovies, ...blockedIds];
        const response = await getRandomSection({ ...filterParams, notMovies: excludeIds.join(",") });

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
            const seenId = `${type === "tv" ? "t" : "m"}${selectedMovie.id}`;
            setSeenMovies((prev) => [...prev, seenId]);
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
  }, [
    isLoading,
    isRevealed,
    getRandomSection,
    getMovieDetails,
    resetCard,
    revealCard,
    triggerHaptic,
    diceRotate,
    getFilterParams,
    seenMovies,
    getBlockedIds,
    superLikeIconScale,
  ]);

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

  const handleSuperLike = useCallback(() => {
    if (!movie) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    superLikeMovie(movie);
    superLikeIconScale.value = withSequence(
      withSpring(1.8, { damping: 8, stiffness: 400 }),
      withSpring(1, { damping: 10, stiffness: 200 })
    );
  }, [movie, superLikeMovie, superLikeIconScale]);

  const handleBlock = useCallback(() => {
    if (!movie) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    blockMovie(movie);
    fetchRandomMovie();
  }, [movie, blockMovie, fetchRandomMovie]);

  return {
    movie,
    details,
    isLoading,
    isRevealed,
    superLikeIconScale,
    fetchRandomMovie,
    handleViewDetails,
    handleSuperLike,
    handleBlock,
    triggerHaptic,
  };
}
