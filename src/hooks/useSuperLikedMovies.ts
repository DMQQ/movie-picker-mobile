import { useCallback, useEffect, useState } from "react";
import { useMovieInteractions } from "../context/DatabaseContext";
import type { MovieInteraction, MovieType } from "../database/types";
import type { Movie } from "../../types";

export function useSuperLikedMovies() {
  const { movieInteractions, isReady } = useMovieInteractions();
  const [superLikedMovies, setSuperLikedMovies] = useState<MovieInteraction[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!movieInteractions) return;
    try {
      const superLiked = await movieInteractions.getByInteractionType("super_liked");
      setSuperLikedMovies(superLiked);
    } catch (error) {
      console.error("Failed to fetch super liked movies:", error);
    } finally {
      setLoading(false);
    }
  }, [movieInteractions]);

  useEffect(() => {
    if (isReady) {
      refresh();
    }
  }, [isReady, refresh]);

  const superLikeMovie = useCallback(
    async (movie: Movie) => {
      if (!movieInteractions) return;
      const movieType: MovieType = movie.type ?? (movie.first_air_date ? "tv" : "movie");
      await movieInteractions.add({
        movie_id: movie.id,
        movie_type: movieType,
        interaction_type: "super_liked",
        title: movie.title || movie.name || null,
        poster_path: movie.poster_path || null,
      });
      await refresh();
    },
    [movieInteractions, refresh],
  );

  const removeSuperLike = useCallback(
    async (movieId: number, movieType: MovieType) => {
      if (!movieInteractions) return;
      await movieInteractions.remove(movieId, movieType, "super_liked");
      await refresh();
    },
    [movieInteractions, refresh],
  );

  const isSuperLiked = useCallback(
    async (movieId: number, movieType: MovieType): Promise<boolean> => {
      if (!movieInteractions) return false;
      return movieInteractions.exists(movieId, movieType, "super_liked");
    },
    [movieInteractions],
  );

  const getSuperLikedIds = useCallback(async (): Promise<{ id: number; type: MovieType }[]> => {
    if (!movieInteractions) return [];
    const superLiked = await movieInteractions.getByInteractionType("super_liked");
    return superLiked.map((m) => ({ id: m.movie_id, type: m.movie_type }));
  }, [movieInteractions]);

  const clearAllSuperLiked = useCallback(async () => {
    if (!movieInteractions) return;
    await movieInteractions.clearByInteractionType("super_liked");
    await refresh();
  }, [movieInteractions, refresh]);

  return {
    superLikedMovies,
    loading,
    isReady,
    superLikeMovie,
    removeSuperLike,
    isSuperLiked,
    getSuperLikedIds,
    clearAllSuperLiked,
    refresh,
  };
}
