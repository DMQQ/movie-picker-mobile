import { useCallback, useEffect, useMemo } from "react";
import { useMovieInteractions } from "../context/DatabaseContext";
import type { MovieType } from "../database/types";
import type { Movie } from "../../types";
import { useAppDispatch, useAppSelector } from "../redux/store";
import {
  loadInteractions,
  blockMovie as blockAction,
  unblockMovie as unblockAction,
  clearAllBlocked as clearAllBlockedAction,
  addSessionDisliked,
  selectBlockedMovies,
  selectBlockedIds,
  selectBlockedIdSet,
  selectInteractionsLoading,
  selectInteractionsHydrated,
} from "../redux/movieInteractions/movieInteractionsSlice";

export function useBlockedMovies() {
  const dispatch = useAppDispatch();
  const { movieInteractions, isReady } = useMovieInteractions();

  const blockedMovies = useAppSelector(selectBlockedMovies);
  const blockedIds = useAppSelector(selectBlockedIds);
  const blockedIdSet = useAppSelector(selectBlockedIdSet);
  const loading = useAppSelector(selectInteractionsLoading);
  const hydrated = useAppSelector(selectInteractionsHydrated);

  useEffect(() => {
    if (isReady && movieInteractions && !hydrated) {
      dispatch(loadInteractions(movieInteractions));
    }
  }, [isReady, movieInteractions, hydrated, dispatch]);

  const blockMovie = useCallback(
    async (movie: Movie) => {
      if (!movieInteractions) return;
      const movieType: MovieType = movie.type ?? (movie.first_air_date ? "tv" : "movie");

      await dispatch(
        blockAction({
          repo: movieInteractions,
          interaction: {
            movie_id: movie.id,
            movie_type: movieType,
            interaction_type: "blocked",
            title: movie.title || movie.name || null,
            poster_path: movie.poster_path || null,
          },
        }),
      );
    },
    [movieInteractions, dispatch],
  );

  const unblockMovie = useCallback(
    async (movieId: number, movieType: MovieType) => {
      if (!movieInteractions) return;
      await dispatch(unblockAction({ repo: movieInteractions, movieId, movieType }));
    },
    [movieInteractions, dispatch],
  );

  const addDislikedMovie = useCallback(
    (movie: Movie) => {
      const movieType = movie.type ?? (movie.first_air_date ? "tv" : "movie");
      const key = `${movieType === "movie" ? "m" : "t"}${movie.id}`;
      dispatch(addSessionDisliked(key));
    },
    [dispatch],
  );

  const isBlocked = useCallback(
    (movieId: number, movieType: MovieType): boolean => {
      const key = `${movieType === "movie" ? "m" : "t"}${movieId}`;
      return blockedIdSet.has(key);
    },
    [blockedIdSet],
  );

  const getBlockedIds = useCallback((): { id: number; type: MovieType }[] => {
    return blockedIds;
  }, [blockedIds]);

  const clearAllBlocked = useCallback(async () => {
    if (!movieInteractions) return;
    await dispatch(clearAllBlockedAction(movieInteractions));
  }, [movieInteractions, dispatch]);

  const filterBlocked = useCallback(
    <T extends { id: number; type?: "movie" | "tv"; first_air_date?: string }>(movies: T[]): T[] => {
      return movies.filter((movie) => {
        const movieType = movie.type ?? (movie.first_air_date ? "tv" : "movie");
        const key = `${movieType === "movie" ? "m" : "t"}${movie.id}`;
        return !blockedIdSet.has(key);
      });
    },
    [blockedIdSet],
  );

  const refresh = useCallback(async () => {
    if (!movieInteractions) return;
    await dispatch(loadInteractions(movieInteractions));
  }, [movieInteractions, dispatch]);

  return useMemo(
    () => ({
      blockedMovies,
      loading,
      isReady: hydrated,
      blockMovie,
      unblockMovie,
      addDislikedMovie,
      isBlocked,
      getBlockedIds,
      clearAllBlocked,
      filterBlocked,
      refresh,
    }),
    [
      blockedMovies,
      loading,
      hydrated,
      blockMovie,
      unblockMovie,
      addDislikedMovie,
      isBlocked,
      getBlockedIds,
      clearAllBlocked,
      filterBlocked,
      refresh,
    ],
  );
}
