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
  selectInteractionsLoading,
  selectInteractionsHydrated,
} from "../redux/movieInteractions/movieInteractionsSlice";
import {
  useGetListQuery,
  useAddItemMutation,
  useRemoveItemMutation,
} from "../redux/lists/listsApi";

export function useBlockedMovies() {
  const dispatch = useAppDispatch();
  const { movieInteractions, isReady } = useMovieInteractions();
  const user = useAppSelector((s) => s.auth.user);
  const isFullAccount = !!user && user.provider !== "anonymous";

  // Local selectors — always called to satisfy hook ordering rules
  const localBlockedMovies = useAppSelector(selectBlockedMovies);
  const localLoading = useAppSelector(selectInteractionsLoading);
  const localHydrated = useAppSelector(selectInteractionsHydrated);
  const sessionDisliked = useAppSelector((s) => s.movieInteractions.sessionDisliked);

  // Remote path — skipped when not signed in
  const { data: remoteData, isLoading: remoteLoading } = useGetListQuery("disliked", {
    skip: !isFullAccount,
  });
  const [addItem] = useAddItemMutation();
  const [removeItem] = useRemoveItemMutation();

  // Hydrate from local DB only when not authenticated
  useEffect(() => {
    if (!isFullAccount && isReady && movieInteractions && !localHydrated) {
      dispatch(loadInteractions(movieInteractions));
    }
  }, [isFullAccount, isReady, movieInteractions, localHydrated, dispatch]);

  const blockedMovies = useMemo(() => {
    if (isFullAccount) {
      const remoteItems = (remoteData?.items ?? []).map((item) => ({
        id: 0 as number,
        movie_id: item.contentId,
        movie_type: item.contentType as MovieType,
        interaction_type: "blocked" as const,
        title: item.content.title || null,
        poster_path: item.content.poster_path || null,
        created_at: item.createdAt,
      }));
      // Include un-migrated local items alongside remote (deduped by movie_id+type)
      const remoteIds = new Set(remoteItems.map((i) => `${i.movie_id}:${i.movie_type}`));
      const localOnly = localBlockedMovies.filter(
        (m) => !remoteIds.has(`${m.movie_id}:${m.movie_type}`)
      );
      return [...remoteItems, ...localOnly];
    }
    return localBlockedMovies;
  }, [isFullAccount, remoteData, localBlockedMovies]);

  const blockedIdSet = useMemo(() => {
    const sessionKeys = Object.keys(sessionDisliked);
    if (isFullAccount) {
      const remoteKeys = (remoteData?.items ?? []).map(
        (i) => `${i.contentType === "movie" ? "m" : "t"}${i.contentId}`
      );
      const localKeys = localBlockedMovies.map(
        (m) => `${m.movie_type === "movie" ? "m" : "t"}${m.movie_id}`
      );
      return new Set([...remoteKeys, ...localKeys, ...sessionKeys]);
    }
    const localKeys = localBlockedMovies.map(
      (m) => `${m.movie_type === "movie" ? "m" : "t"}${m.movie_id}`
    );
    return new Set([...localKeys, ...sessionKeys]);
  }, [isFullAccount, remoteData, localBlockedMovies, sessionDisliked]);

  const blockMovie = useCallback(
    async (movie: Movie) => {
      const movieType: MovieType = movie.type ?? (movie.first_air_date ? "tv" : "movie");
      if (isFullAccount) {
        await addItem({
          type: "disliked",
          contentId: movie.id,
          contentType: movieType,
          content: {
            title: movie.title || (movie as any).name || "",
            poster_path: movie.poster_path || null,
          },
        });
        return;
      }
      if (!movieInteractions) return;
      await dispatch(
        blockAction({
          repo: movieInteractions,
          interaction: {
            movie_id: movie.id,
            movie_type: movieType,
            interaction_type: "blocked",
            title: movie.title || (movie as any).name || null,
            poster_path: movie.poster_path || null,
          },
        })
      );
    },
    [isFullAccount, movieInteractions, dispatch, addItem]
  );

  const unblockMovie = useCallback(
    async (movieId: number, movieType: MovieType) => {
      if (isFullAccount) {
        const item = remoteData?.items.find(
          (i) => i.contentId === movieId && i.contentType === movieType
        );
        if (item) await removeItem({ itemId: item.id, listType: "disliked" });
        // Also clear the local entry — un-migrated items only exist locally,
        // and the DELETE is a no-op for remote-only items.
        if (movieInteractions) {
          await dispatch(unblockAction({ repo: movieInteractions, movieId, movieType }));
        }
        return;
      }
      if (!movieInteractions) return;
      await dispatch(unblockAction({ repo: movieInteractions, movieId, movieType }));
    },
    [isFullAccount, remoteData, movieInteractions, dispatch, removeItem]
  );

  const addDislikedMovie = useCallback(
    (movie: Movie) => {
      const movieType = movie.type ?? (movie.first_air_date ? "tv" : "movie");
      const key = `${movieType === "movie" ? "m" : "t"}${movie.id}`;
      dispatch(addSessionDisliked(key));
    },
    [dispatch]
  );

  const isBlocked = useCallback(
    (movieId: number, movieType: MovieType): boolean => {
      const key = `${movieType === "movie" ? "m" : "t"}${movieId}`;
      return blockedIdSet.has(key);
    },
    [blockedIdSet]
  );

  const getBlockedIds = useCallback((): { id: number; type: MovieType }[] => {
    if (isFullAccount) {
      const remoteIds = (remoteData?.items ?? []).map((i) => ({
        id: i.contentId,
        type: i.contentType as MovieType,
      }));
      const remoteSet = new Set(remoteIds.map((i) => `${i.id}:${i.type}`));
      const localOnly = localBlockedMovies
        .filter((m) => !remoteSet.has(`${m.movie_id}:${m.movie_type}`))
        .map((m) => ({ id: m.movie_id, type: m.movie_type }));
      return [...remoteIds, ...localOnly];
    }
    return localBlockedMovies.map((m) => ({ id: m.movie_id, type: m.movie_type }));
  }, [isFullAccount, remoteData, localBlockedMovies]);

  const clearAllBlocked = useCallback(async () => {
    if (isFullAccount) {
      const items = remoteData?.items ?? [];
      await Promise.all(items.map((item) => removeItem({ itemId: item.id, listType: "disliked" })));
      // Also clear local un-migrated items so they stop appearing after clear-all
      if (movieInteractions) {
        await dispatch(clearAllBlockedAction(movieInteractions));
      }
      return;
    }
    if (!movieInteractions) return;
    await dispatch(clearAllBlockedAction(movieInteractions));
  }, [isFullAccount, remoteData, movieInteractions, dispatch, removeItem]);

  const filterBlocked = useCallback(
    <T extends { id: number; type?: "movie" | "tv"; first_air_date?: string }>(movies: T[]): T[] => {
      return movies.filter((movie) => {
        const movieType = movie.type ?? (movie.first_air_date ? "tv" : "movie");
        const key = `${movieType === "movie" ? "m" : "t"}${movie.id}`;
        return !blockedIdSet.has(key);
      });
    },
    [blockedIdSet]
  );

  const refresh = useCallback(async () => {
    if (isFullAccount) return; // RTK Query refetches automatically on invalidation
    if (!movieInteractions) return;
    await dispatch(loadInteractions(movieInteractions));
  }, [isFullAccount, movieInteractions, dispatch]);

  return useMemo(
    () => ({
      blockedMovies,
      loading: isFullAccount ? remoteLoading : localLoading,
      isReady: isFullAccount ? !remoteLoading : localHydrated,
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
      isFullAccount,
      remoteLoading,
      localLoading,
      localHydrated,
      blockMovie,
      unblockMovie,
      addDislikedMovie,
      isBlocked,
      getBlockedIds,
      clearAllBlocked,
      filterBlocked,
      refresh,
    ]
  );
}
