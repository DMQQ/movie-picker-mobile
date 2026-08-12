import { useCallback, useEffect, useRef, useState } from "react";
import { Image } from "expo-image";
import * as Haptics from "expo-haptics";
import { SharedValue, useSharedValue, withRepeat, withTiming, withSequence, withSpring, Easing } from "react-native-reanimated";
import { Movie, MovieDetails } from "../../types";
import { useLazyGetMovieQuery, useLazyGetRandomSectionQuery } from "../redux/movie/movieApi";
import { useMediaFilters } from "../components/MediaFilters";
import { useBlockedMovies } from "./useBlockedMovies";
import { useSuperLikedMovies } from "./useSuperLikedMovies";
import { posthog } from "../constants/posthog";

type QueuedMovie = { movie: Movie; details: MovieDetails | null };

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

  const queueRef = useRef<QueuedMovie[]>([]);
  const prefetchingRef = useRef(false);

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

  const searchMovie = useCallback(async (): Promise<QueuedMovie | null> => {
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

        if (selectedMovie.poster_path) {
          Image.prefetch(`https://image.tmdb.org/t/p/w780${selectedMovie.poster_path}`).catch(() => {});
        }

        return { movie: selectedMovie, details: detailsResponse.data ?? null };
      }
      return null;
    } catch {
      return null;
    }
  }, [getRandomSection, getMovieDetails, getFilterParams, seenMovies, getBlockedIds]);

  const movieRef = useRef(movie);
  movieRef.current = movie;

  const fillQueue = useCallback(async () => {
    if (prefetchingRef.current) return;
    if (queueRef.current.length >= 2) return;

    prefetchingRef.current = true;

    while (queueRef.current.length < 2) {
      const result = await searchMovie();
      if (!result) break;
      const seenId = `${result.movie.type === "tv" ? "t" : "m"}${result.movie.id}`;
      setSeenMovies((prev) => [...prev, seenId]);

      if (!movieRef.current) {
        setMovie(result.movie);
        setDetails(result.details);
      } else {
        queueRef.current.push(result);
      }
    }

    prefetchingRef.current = false;
  }, [searchMovie]);

  const revealNext = useCallback(() => {
    if (queueRef.current.length === 0) return;
    const next = queueRef.current.shift()!;
    setMovie(next.movie);
    setDetails(next.details);
    revealCard();
    fillQueue();
  }, [revealCard, fillQueue]);

  // Prefetch on mount
  useEffect(() => {
    fillQueue();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchRandomMovie = useCallback(async () => {
    if (isLoading) return;
    posthog?.capture("random_picked", { reroll: isRevealed });
    setIsLoading(true);
    superLikeIconScale.value = 1;

    if (isRevealed) {
      resetCard();
      setTimeout(async () => {
        diceRotate.value = withRepeat(withTiming(360, { duration: 800, easing: Easing.linear }), -1, false);
        const result = await searchMovie();
        if (result) {
          const seenId = `${result.movie.type === "tv" ? "t" : "m"}${result.movie.id}`;
          setSeenMovies((prev) => [...prev, seenId]);
          setTimeout(() => {
            setMovie(result.movie);
            setDetails(result.details);
            diceRotate.value = 0;
            setIsLoading(false);
            revealCard();
            fillQueue();
          }, 600);
        } else {
          setIsLoading(false);
          diceRotate.value = 0;
        }
      }, 400);
    } else {
      diceRotate.value = withRepeat(withTiming(360, { duration: 800, easing: Easing.linear }), -1, false);
      const result = await searchMovie();
      if (result) {
        const seenId = `${result.movie.type === "tv" ? "t" : "m"}${result.movie.id}`;
        setSeenMovies((prev) => [...prev, seenId]);
        setTimeout(() => {
          setMovie(result.movie);
          setDetails(result.details);
          diceRotate.value = 0;
          setIsLoading(false);
          revealCard();
          fillQueue();
        }, 600);
      } else {
        setIsLoading(false);
        diceRotate.value = 0;
      }
    }
  }, [isLoading, isRevealed, resetCard, searchMovie, revealCard, diceRotate, superLikeIconScale, fillQueue]);

  const revealMovie = useCallback(() => {
    if (isLoading) return;
    if (isRevealed) {
      fetchRandomMovie();
    } else {
      revealNext();
    }
  }, [isLoading, isRevealed, revealNext, fetchRandomMovie]);

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
    revealMovie,
    resetCard,
    handleSuperLike,
    handleBlock,
    triggerHaptic,
  };
}
