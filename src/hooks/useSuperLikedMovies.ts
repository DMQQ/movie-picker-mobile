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
import {
  useGetListQuery,
  useAddItemMutation,
  useRemoveItemMutation,
} from "../redux/lists/listsApi";

export function useSuperLikedMovies() {
  const dispatch = useAppDispatch();
  const { movieInteractions, isReady } = useMovieInteractions();
  const user = useAppSelector((s) => s.auth.user);
  const isFullAccount = !!user && user.provider !== "anonymous";

  // Local selectors — always called to satisfy hook ordering rules
  const localSuperLikedMovies = useAppSelector(selectSuperLikedMovies);
  const localLoading = useAppSelector(selectInteractionsLoading);
  const localHydrated = useAppSelector(selectInteractionsHydrated);

  // Remote path — skipped when not signed in
  const { data: remoteData, isLoading: remoteLoading } = useGetListQuery("superliked", {
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

  const superLikedMovies = useMemo(() => {
    if (isFullAccount) {
      const remoteItems = (remoteData?.items ?? []).map((item) => ({
        id: 0 as number,
        movie_id: item.contentId,
        movie_type: item.contentType as MovieType,
        interaction_type: "super_liked" as const,
        title: item.content.title || null,
        poster_path: item.content.poster_path || null,
        created_at: item.createdAt,
      }));
      // Include un-migrated local items alongside remote (deduped by movie_id+type)
      const remoteIds = new Set(remoteItems.map((i) => `${i.movie_id}:${i.movie_type}`));
      const localOnly = localSuperLikedMovies.filter(
        (m) => !remoteIds.has(`${m.movie_id}:${m.movie_type}`)
      );
      return [...remoteItems, ...localOnly];
    }
    return localSuperLikedMovies;
  }, [isFullAccount, remoteData, localSuperLikedMovies]);

  const superLikeMovie = useCallback(
    async (movie: Movie) => {
      const movieType: MovieType = movie.type ?? (movie.first_air_date ? "tv" : "movie");

      if (isFullAccount) {
        await addItem({
          type: "superliked",
          contentId: movie.id,
          contentType: movieType,
          content: {
            title: movie.title || (movie as any).name || "",
            poster_path: movie.poster_path || null,
          },
        });

        const countAfterAdd = (remoteData?.items.length ?? 0) + 1;
        const canReview =
          countAfterAdd === 3 || (countAfterAdd > 3 && countAfterAdd % 10 === 0);

        if (canReview) {
          if (
            Platform.OS !== "web" &&
            (await StoreReview.hasAction()) &&
            (await ReviewManager.canRequestReviewFromRating())
          ) {
            await StoreReview.requestReview();
            await ReviewManager.recordReviewRequestFromRating();
          }
        }
        return;
      }

      if (!movieInteractions) return;

      const result = await dispatch(
        superLikeAction({
          repo: movieInteractions,
          interaction: {
            movie_id: movie.id,
            movie_type: movieType,
            interaction_type: "super_liked",
            title: movie.title || (movie as any).name || null,
            poster_path: movie.poster_path || null,
          },
        })
      ).unwrap();

      if (result.canReview) {
        if (
          Platform.OS !== "web" &&
          (await StoreReview.hasAction()) &&
          (await ReviewManager.canRequestReviewFromRating())
        ) {
          await StoreReview.requestReview();
          await ReviewManager.recordReviewRequestFromRating();
        }
      }
    },
    [isFullAccount, movieInteractions, dispatch, addItem, remoteData]
  );

  const removeSuperLike = useCallback(
    async (movieId: number, movieType: MovieType) => {
      if (isFullAccount) {
        const item = remoteData?.items.find(
          (i) => i.contentId === movieId && i.contentType === movieType
        );
        if (item) {
          await removeItem({ itemId: item.id, listType: "superliked" });
        } else if (movieInteractions) {
          // Local-only un-migrated item — remove from SQLite/Redux
          await dispatch(removeSuperLikeAction({ repo: movieInteractions, movieId, movieType }));
        }
        return;
      }
      if (!movieInteractions) return;
      await dispatch(removeSuperLikeAction({ repo: movieInteractions, movieId, movieType }));
    },
    [isFullAccount, remoteData, movieInteractions, dispatch, removeItem]
  );

  const isSuperLiked = useCallback(
    (movieId: number, movieType: MovieType): boolean => {
      if (isFullAccount) {
        const inRemote = (remoteData?.items ?? []).some(
          (i) => i.contentId === movieId && i.contentType === movieType
        );
        if (inRemote) return true;
        // Also check local un-migrated items
        return localSuperLikedMovies.some(
          (m) => m.movie_id === movieId && m.movie_type === movieType
        );
      }
      return localSuperLikedMovies.some(
        (m) => m.movie_id === movieId && m.movie_type === movieType
      );
    },
    [isFullAccount, remoteData, localSuperLikedMovies]
  );

  const getSuperLikedIds = useCallback((): { id: number; type: MovieType }[] => {
    if (isFullAccount) {
      const remoteIds = (remoteData?.items ?? []).map((i) => ({
        id: i.contentId,
        type: i.contentType as MovieType,
      }));
      const remoteSet = new Set(remoteIds.map((i) => `${i.id}:${i.type}`));
      const localOnly = localSuperLikedMovies
        .filter((m) => !remoteSet.has(`${m.movie_id}:${m.movie_type}`))
        .map((m) => ({ id: m.movie_id, type: m.movie_type }));
      return [...remoteIds, ...localOnly];
    }
    return localSuperLikedMovies.map((m) => ({ id: m.movie_id, type: m.movie_type }));
  }, [isFullAccount, remoteData, localSuperLikedMovies]);

  const clearAllSuperLiked = useCallback(async () => {
    if (isFullAccount) {
      const items = remoteData?.items ?? [];
      await Promise.all(
        items.map((item) => removeItem({ itemId: item.id, listType: "superliked" }))
      );
      return;
    }
    if (!movieInteractions) return;
    await dispatch(clearAllSuperLikedAction(movieInteractions));
  }, [isFullAccount, remoteData, movieInteractions, dispatch, removeItem]);

  const refresh = useCallback(async () => {
    if (isFullAccount) return; // RTK Query refetches automatically on invalidation
    if (!movieInteractions) return;
    await dispatch(loadInteractions(movieInteractions));
  }, [isFullAccount, movieInteractions, dispatch]);

  return useMemo(
    () => ({
      superLikedMovies,
      loading: isFullAccount ? remoteLoading : localLoading,
      isReady: isFullAccount ? !remoteLoading : localHydrated,
      superLikeMovie,
      removeSuperLike,
      isSuperLiked,
      getSuperLikedIds,
      clearAllSuperLiked,
      refresh,
    }),
    [
      superLikedMovies,
      isFullAccount,
      remoteLoading,
      localLoading,
      localHydrated,
      superLikeMovie,
      removeSuperLike,
      isSuperLiked,
      getSuperLikedIds,
      clearAllSuperLiked,
      refresh,
    ]
  );
}
