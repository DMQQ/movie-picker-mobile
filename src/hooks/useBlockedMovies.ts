import { useCallback, useEffect } from "react";
import { useMovieInteractions } from "../context/DatabaseContext";
import type { MovieType } from "../database/types";
import type { Movie } from "../../types";
import { useAppDispatch, useAppSelector } from "../redux/store";
import {
  loadInteractions,
  blockMovie as blockAction,
  unblockMovie as unblockAction,
  clearAllBlocked as clearAllBlockedAction,
  selectBlockedMovies,
  selectBlockedIdSet,
  selectInteractionsLoading,
  selectInteractionsHydrated,
} from "../redux/movieInteractions/movieInteractionsSlice";

export function useBlockedMovies() {
  const dispatch = useAppDispatch();
  const { movieInteractions, isReady } = useMovieInteractions();

  const blockedMovies = useAppSelector(selectBlockedMovies);
  const blockedIdSet = useAppSelector(selectBlockedIdSet);
  const loading = useAppSelector(selectInteractionsLoading);
  const hydrated = useAppSelector(selectInteractionsHydrated);

  // Hydrate Redux on first load
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
        })
      );
    },
    [movieInteractions, dispatch]
  );

  const unblockMovie = useCallback(
    async (movieId: number, movieType: MovieType) => {
      if (!movieInteractions) return;
      await dispatch(unblockAction({ repo: movieInteractions, movieId, movieType }));
    },
    [movieInteractions, dispatch]
  );

  const isBlocked = useCallback(
    (movieId: number, movieType: MovieType): boolean => {
      return blockedMovies.some((m) => m.movie_id === movieId && m.movie_type === movieType);
    },
    [blockedMovies]
  );

  const getBlockedIds = useCallback((): { id: number; type: MovieType }[] => {
    return blockedMovies.map((m) => ({ id: m.movie_id, type: m.movie_type }));
  }, [blockedMovies]);

  const clearAllBlocked = useCallback(async () => {
    if (!movieInteractions) return;
    await dispatch(clearAllBlockedAction(movieInteractions));
  }, [movieInteractions, dispatch]);

  const filterBlocked = useCallback(
    <T extends { id: number }>(movies: T[]): T[] => {
      return movies.filter((movie) => !blockedIdSet.has(movie.id));
    },
    [blockedIdSet]
  );

  const refresh = useCallback(async () => {
    if (!movieInteractions) return;
    await dispatch(loadInteractions(movieInteractions));
  }, [movieInteractions, dispatch]);

  return {
    blockedMovies,
    loading,
    isReady: hydrated,
    blockMovie,
    unblockMovie,
    isBlocked,
    getBlockedIds,
    clearAllBlocked,
    filterBlocked,
    refresh,
  };
}
