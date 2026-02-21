import { createAsyncThunk, createSlice, createSelector } from "@reduxjs/toolkit";
import type { MovieInteraction, MovieInteractionInsert, MovieType, InteractionType } from "../../database/types";
import type { MovieInteractionsRepo } from "../../database/repositories/movieInteractionsRepo";
import type { RootState } from "../store";

interface MovieInteractionsState {
  superLiked: MovieInteraction[];
  blocked: MovieInteraction[];
  sessionDisliked: Record<string, true>;
  loading: boolean;
  hydrated: boolean;
  error: string | null;
}

const initialState: MovieInteractionsState = {
  superLiked: [],
  blocked: [],
  sessionDisliked: {},
  loading: false,
  hydrated: false,
  error: null,
};

// Load all interactions from DB into Redux (call once on app start)
export const loadInteractions = createAsyncThunk(
  "movieInteractions/load",
  async (repo: MovieInteractionsRepo) => {
    const [superLiked, blocked] = await Promise.all([
      repo.getByInteractionType("super_liked"),
      repo.getByInteractionType("blocked"),
    ]);
    return { superLiked, blocked };
  }
);

// Super Like actions
export const superLikeMovie = createAsyncThunk(
  "movieInteractions/superLike",
  async ({ repo, interaction }: { repo: MovieInteractionsRepo; interaction: MovieInteractionInsert }) => {
    await repo.add(interaction);
    const superLiked = await repo.getByInteractionType("super_liked");
    const canReview = await repo.canReview();
    return { superLiked, canReview };
  }
);

export const removeSuperLike = createAsyncThunk(
  "movieInteractions/removeSuperLike",
  async ({ repo, movieId, movieType }: { repo: MovieInteractionsRepo; movieId: number; movieType: MovieType }) => {
    await repo.remove(movieId, movieType, "super_liked");
    const superLiked = await repo.getByInteractionType("super_liked");
    return { superLiked };
  }
);

export const clearAllSuperLiked = createAsyncThunk(
  "movieInteractions/clearAllSuperLiked",
  async (repo: MovieInteractionsRepo) => {
    await repo.clearByInteractionType("super_liked");
    return { superLiked: [] };
  }
);

// Block actions
export const blockMovie = createAsyncThunk(
  "movieInteractions/block",
  async ({ repo, interaction }: { repo: MovieInteractionsRepo; interaction: MovieInteractionInsert }) => {
    await repo.add(interaction);
    const blocked = await repo.getByInteractionType("blocked");
    return { blocked };
  }
);

export const unblockMovie = createAsyncThunk(
  "movieInteractions/unblock",
  async ({ repo, movieId, movieType }: { repo: MovieInteractionsRepo; movieId: number; movieType: MovieType }) => {
    await repo.remove(movieId, movieType, "blocked");
    const blocked = await repo.getByInteractionType("blocked");
    return { blocked };
  }
);

export const clearAllBlocked = createAsyncThunk(
  "movieInteractions/clearAllBlocked",
  async (repo: MovieInteractionsRepo) => {
    await repo.clearByInteractionType("blocked");
    return { blocked: [] };
  }
);

export const movieInteractionsSlice = createSlice({
  name: "movieInteractions",
  initialState,
  reducers: {
    addSessionDisliked: (state, action: { payload: string }) => {
      state.sessionDisliked[action.payload] = true;
    },
    clearSessionDisliked: (state) => {
      state.sessionDisliked = {};
    },
  },
  extraReducers: (builder) => {
    builder
      // Load
      .addCase(loadInteractions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadInteractions.fulfilled, (state, action) => {
        state.superLiked = action.payload.superLiked;
        state.blocked = action.payload.blocked;
        state.loading = false;
        state.hydrated = true;
      })
      // Super Like
      .addCase(superLikeMovie.fulfilled, (state, action) => {
        state.superLiked = action.payload.superLiked;
      })
      .addCase(removeSuperLike.fulfilled, (state, action) => {
        state.superLiked = action.payload.superLiked;
      })
      .addCase(clearAllSuperLiked.fulfilled, (state) => {
        state.superLiked = [];
      })
      // Block
      .addCase(blockMovie.fulfilled, (state, action) => {
        state.blocked = action.payload.blocked;
      })
      .addCase(unblockMovie.fulfilled, (state, action) => {
        state.blocked = action.payload.blocked;
      })
      .addCase(clearAllBlocked.fulfilled, (state) => {
        state.blocked = [];
      })
      // Error handling
      .addMatcher(
        (action): action is { type: string; error: { message?: string } } =>
          action.type.startsWith("movieInteractions/") && action.type.endsWith("/rejected"),
        (state, action) => {
          state.loading = false;
          state.error = action.error?.message || "An error occurred";
        }
      );
  },
});

export const { addSessionDisliked, clearSessionDisliked } = movieInteractionsSlice.actions;

// Selectors
const selectMovieInteractions = (state: RootState) => state.movieInteractions;

export const selectSuperLikedMovies = createSelector(
  selectMovieInteractions,
  (interactions) => interactions.superLiked
);

export const selectBlockedMovies = createSelector(
  selectMovieInteractions,
  (interactions) => interactions.blocked
);

export const selectInteractionsLoading = createSelector(
  selectMovieInteractions,
  (interactions) => interactions.loading
);

export const selectInteractionsHydrated = createSelector(
  selectMovieInteractions,
  (interactions) => interactions.hydrated
);

export const selectSuperLikedIds = createSelector(
  selectSuperLikedMovies,
  (superLiked) => superLiked.map((m) => ({ id: m.movie_id, type: m.movie_type }))
);

export const selectSessionDisliked = createSelector(
  selectMovieInteractions,
  (interactions) => interactions.sessionDisliked
);

const parseKey = (key: string): { id: number; type: MovieType } => ({
  id: parseInt(key.slice(1), 10),
  type: key[0] === "m" ? "movie" : "tv",
});

export const selectBlockedIds = createSelector(
  [selectBlockedMovies, selectSessionDisliked],
  (blocked, sessionDisliked) => [
    ...blocked.map((m) => ({ id: m.movie_id, type: m.movie_type })),
    ...Object.keys(sessionDisliked).map(parseKey),
  ]
);

export const selectBlockedIdSet = createSelector(
  [selectBlockedMovies, selectSessionDisliked],
  (blocked, sessionDisliked) => {
    const blockedKeys = blocked.map((m) => `${m.movie_type === "movie" ? "m" : "t"}${m.movie_id}`);
    const sessionKeys = Object.keys(sessionDisliked);
    return new Set([...blockedKeys, ...sessionKeys]);
  }
);

export const selectIsSuperLiked = createSelector(
  [selectSuperLikedMovies, (_state: RootState, movieId: number, movieType: MovieType) => ({ movieId, movieType })],
  (superLiked, { movieId, movieType }) =>
    superLiked.some((m) => m.movie_id === movieId && m.movie_type === movieType)
);

export const selectIsBlocked = createSelector(
  [selectBlockedMovies, (_state: RootState, movieId: number, movieType: MovieType) => ({ movieId, movieType })],
  (blocked, { movieId, movieType }) =>
    blocked.some((m) => m.movie_id === movieId && m.movie_type === movieType)
);
