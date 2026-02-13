import { useCallback, useEffect, useState } from "react";
import { useMovieInteractions } from "../context/DatabaseContext";
import type { MovieInteraction, MovieType } from "../database/types";
import type { Movie } from "../../types";

export function useBlockedMovies() {
  const { movieInteractions, isReady } = useMovieInteractions();
  const [blockedMovies, setBlockedMovies] = useState<MovieInteraction[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!movieInteractions) return;
    try {
      const blocked = await movieInteractions.getByInteractionType("blocked");
      setBlockedMovies(blocked);
    } catch (error) {
      console.error("Failed to fetch blocked movies:", error);
    } finally {
      setLoading(false);
    }
  }, [movieInteractions]);

  useEffect(() => {
    if (isReady) {
      refresh();
    }
  }, [isReady, refresh]);

  const blockMovie = useCallback(
    async (movie: Movie) => {
      if (!movieInteractions) return;
      const movieType: MovieType = movie.type ?? (movie.first_air_date ? "tv" : "movie");
      await movieInteractions.add({
        movie_id: movie.id,
        movie_type: movieType,
        interaction_type: "blocked",
        title: movie.title || movie.name || null,
        poster_path: movie.poster_path || null,
      });
      await refresh();
    },
    [movieInteractions, refresh]
  );

  const unblockMovie = useCallback(
    async (movieId: number, movieType: MovieType) => {
      if (!movieInteractions) return;
      await movieInteractions.remove(movieId, movieType, "blocked");
      await refresh();
    },
    [movieInteractions, refresh]
  );

  const isBlocked = useCallback(
    async (movieId: number, movieType: MovieType): Promise<boolean> => {
      if (!movieInteractions) return false;
      return movieInteractions.exists(movieId, movieType, "blocked");
    },
    [movieInteractions]
  );

  const getBlockedIds = useCallback(async (): Promise<{ id: number; type: MovieType }[]> => {
    if (!movieInteractions) return [];
    const blocked = await movieInteractions.getByInteractionType("blocked");
    return blocked.map((m) => ({ id: m.movie_id, type: m.movie_type }));
  }, [movieInteractions]);

  const clearAllBlocked = useCallback(async () => {
    if (!movieInteractions) return;
    await movieInteractions.clearByInteractionType("blocked");
    await refresh();
  }, [movieInteractions, refresh]);

  const filterBlocked = useCallback(
    <T extends { id: number }>(movies: T[]): T[] => {
      const blockedIds = new Set(blockedMovies.map((m) => m.movie_id));
      return movies.filter((movie) => !blockedIds.has(movie.id));
    },
    [blockedMovies]
  );

  return {
    blockedMovies,
    loading,
    isReady,
    blockMovie,
    unblockMovie,
    isBlocked,
    getBlockedIds,
    clearAllBlocked,
    filterBlocked,
    refresh,
  };
}
