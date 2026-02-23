import { useCallback, useEffect, useMemo } from "react";
import { useMovieInteractions } from "../context/DatabaseContext";
import type { MovieType } from "../database/types";
import type { Movie } from "../../types";
import { Platform } from "react-native";
import ReviewManager from "../utils/rate";
import * as StoreReview from "expo-store-review";
import { useAppDispatch, useAppSelector } from "../redux/store";
import {
  loadInteractions,
  superLikeMovie as superLikeAction,
  removeSuperLike as removeSuperLikeAction,
  clearAllSuperLiked as clearAllSuperLikedAction,
  selectSuperLikedMovies,
  selectInteractionsLoading,
  selectInteractionsHydrated,
} from "../redux/movieInteractions/movieInteractionsSlice";

export function useSuperLikedMovies() {
  const dispatch = useAppDispatch();
  const { movieInteractions, isReady } = useMovieInteractions();

  const superLikedMovies = useAppSelector(selectSuperLikedMovies);
  const loading = useAppSelector(selectInteractionsLoading);
  const hydrated = useAppSelector(selectInteractionsHydrated);

  useEffect(() => {
    if (isReady && movieInteractions && !hydrated) {
      dispatch(loadInteractions(movieInteractions));
    }
  }, [isReady, movieInteractions, hydrated, dispatch]);

  const superLikeMovie = useCallback(
    async (movie: Movie) => {
      if (!movieInteractions) return;
      const movieType: MovieType = movie.type ?? (movie.first_air_date ? "tv" : "movie");

      const result = await dispatch(
        superLikeAction({
          repo: movieInteractions,
          interaction: {
            movie_id: movie.id,
            movie_type: movieType,
            interaction_type: "super_liked",
            title: movie.title || movie.name || null,
            poster_path: movie.poster_path || null,
          },
        }),
      ).unwrap();

      if (result.canReview) {
        if (Platform.OS !== "web" && (await StoreReview.hasAction()) && (await ReviewManager.canRequestReviewFromRating())) {
          await StoreReview.requestReview();
          await ReviewManager.recordReviewRequestFromRating();
        }
      }
    },
    [movieInteractions, dispatch],
  );

  const removeSuperLike = useCallback(
    async (movieId: number, movieType: MovieType) => {
      if (!movieInteractions) return;
      await dispatch(removeSuperLikeAction({ repo: movieInteractions, movieId, movieType }));
    },
    [movieInteractions, dispatch],
  );

  const isSuperLiked = useCallback(
    (movieId: number, movieType: MovieType): boolean => {
      return superLikedMovies.some((m) => m.movie_id === movieId && m.movie_type === movieType);
    },
    [superLikedMovies],
  );

  const getSuperLikedIds = useCallback((): { id: number; type: MovieType }[] => {
    return superLikedMovies.map((m) => ({ id: m.movie_id, type: m.movie_type }));
  }, [superLikedMovies]);

  const clearAllSuperLiked = useCallback(async () => {
    if (!movieInteractions) return;
    await dispatch(clearAllSuperLikedAction(movieInteractions));
  }, [movieInteractions, dispatch]);

  const refresh = useCallback(async () => {
    if (!movieInteractions) return;
    await dispatch(loadInteractions(movieInteractions));
  }, [movieInteractions, dispatch]);

  return useMemo(
    () => ({
      superLikedMovies,
      loading,
      isReady: hydrated,
      superLikeMovie,
      removeSuperLike,
      isSuperLiked,
      getSuperLikedIds,
      clearAllSuperLiked,
      refresh,
    }),
    [superLikedMovies, loading, hydrated, superLikeMovie, removeSuperLike, isSuperLiked, getSuperLikedIds, clearAllSuperLiked, refresh],
  );
}
