import { AsyncStorage } from "expo-sqlite/kv-store";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { Movie } from "../../../types";
import { listsApi } from "../lists/listsApi";
import type { RootState } from "../store";
import { toSlug } from "../../utils/utilities";
import { translate } from "../../service/translationUtils";

type MediaType = "movie" | "tv";

interface FavoriteItem {
  id: number;
  imageUrl: string;
  type: MediaType;
  title?: string;
  remoteItemId?: string;
  rating?: number | null;
  review?: string | null;
}

interface FavoriteGroup {
  id: string;
  type?: string;
  name: string;
  posterPath?: string;
  movies: FavoriteItem[];
}

interface PendingBulkMovie {
  id: number;
  title?: string;
  name?: string;
  poster_path?: string;
  type?: "movie" | "tv";
  first_air_date?: string;
}

interface FavoritesState {
  groups: FavoriteGroup[];
  // O(1) membership lookup: localGroupId → "contentId:contentType" → true
  membershipIndex: Record<string, Record<string, true>>;
  loading: boolean;
  error: string | null;
  pendingBulkMovies: PendingBulkMovie[] | null;
}

const initialState: FavoritesState = {
  groups: [],
  membershipIndex: {},
  loading: false,
  error: null,
  pendingBulkMovies: null,
};

export const STORAGE_KEY = "favorites_groups";

// Corrupted storage must never crash thunks or hide the migration prompt.
export function parseStorage(raw: string | null): { groups: FavoriteGroup[] } {
  if (!raw) return { groups: [] };
  try {
    const parsed = JSON.parse(raw);
    return { groups: Array.isArray(parsed?.groups) ? parsed.groups : [] };
  } catch {
    return { groups: [] };
  }
}

// System list type ↔ local group id mappings
export const LOCAL_ID_TO_TYPE: Record<string, string> = {
  "1": "favourites",
  "2": "watchlist",
  "999": "watched",
};

export const TYPE_TO_LOCAL_ID: Record<string, string> = {
  favourites: "1",
  watchlist: "2",
  watched: "999",
};

// Types that have their own dedicated screens (not shown in the groups list)
export const INTERACTION_LIST_TYPES = new Set(["superliked", "disliked"]);

const makeDefaultGroups = (language?: string) => {
  const lang = language || "en";
  return [
    { id: "1", type: "favourites", name: translate(lang, "lists.favourites"), movies: [], posterPath: undefined },
    { id: "2", type: "watchlist", name: translate(lang, "lists.watchlist"), movies: [], posterPath: undefined },
    { id: "999", type: "watched", name: translate(lang, "lists.watched"), movies: [], posterPath: undefined },
  ] as FavoriteGroup[];
};

const d = (dispatch: any) => dispatch as (action: any) => any;

function buildMembershipIndex(groups: FavoriteGroup[]): Record<string, Record<string, true>> {
  const index: Record<string, Record<string, true>> = {};
  for (const group of groups) {
    const entry: Record<string, true> = {};
    for (const movie of group.movies) {
      entry[`${movie.id}:${movie.type}`] = true;
    }
    index[group.id] = entry;
  }
  return index;
}

export const loadFavorites = createAsyncThunk(
  "favorites/load",
  async (_: void, { getState, dispatch }) => {
    const { token, user } = (getState() as RootState).auth;
    const isFullAccount = !!user && user.provider !== "anonymous";

    if (token && isFullAccount) {
      const listsResult = await d(dispatch)(
        listsApi.endpoints.getLists.initiate({ page: 1 }, { forceRefetch: true })
      ).unwrap();

      const filteredLists = (listsResult.lists as any[]).filter(
        (l: any) => !INTERACTION_LIST_TYPES.has(l.type)
      );

      // Build groups + membership index from previewItems — single API call, no per-list round-trips
      const membershipIndex: Record<string, Record<string, true>> = {};
      const remoteGroups: FavoriteGroup[] = filteredLists.map((list: any) => {
        const localId = TYPE_TO_LOCAL_ID[list.type] ?? list.id;
        const entry: Record<string, true> = {};
        for (const item of list.previewItems ?? []) {
          entry[`${item.contentId}:${item.contentType}`] = true;
        }
        membershipIndex[localId] = entry;
        return {
          id: localId,
          type: list.type,
          name: list.name,
          posterPath: list.posterPath ?? undefined,
          movies: (list.previewItems ?? []).map((item: any) => ({
            id: item.contentId,
            imageUrl: item.posterPath || "",
            type: item.contentType as MediaType,
          })),
        };
      });

      // Merge un-migrated local groups so they show before migration
      const localGroups = parseStorage(await AsyncStorage.getItem(STORAGE_KEY)).groups;

      const remoteGroupNames = new Set(remoteGroups.map((g) => g.name));

      const mergedGroups = remoteGroups.map((remoteGroup) => {
        const localGroup = localGroups.find(
          (lg) => lg.id === remoteGroup.id || lg.name === remoteGroup.name
        );
        if (!localGroup || localGroup.movies.length === 0) return remoteGroup;
        const remoteMovieIds = new Set(remoteGroup.movies.map((m) => m.id));
        const localOnly = localGroup.movies.filter((m) => !remoteMovieIds.has(m.id));
        if (localOnly.length === 0) return remoteGroup;
        return {
          ...remoteGroup,
          posterPath: remoteGroup.posterPath ?? localOnly[0]?.imageUrl ?? undefined,
          movies: [...remoteGroup.movies, ...localOnly],
        };
      });

      const localOnlyGroups = localGroups.filter((lg) => !remoteGroupNames.has(lg.name));
      const groups = [...mergedGroups, ...localOnlyGroups];

      return { groups, membershipIndex };
    }

    const data = await AsyncStorage.getItem(STORAGE_KEY);
    const language = (getState() as RootState).room.language;
    const groups: FavoriteGroup[] = data
      ? parseStorage(data).groups
      : makeDefaultGroups(language);

    if (!data) {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ groups }));
    }

    return { groups, membershipIndex: buildMembershipIndex(groups) };
  }
);

export const createGroup = createAsyncThunk(
  "favorites/createGroup",
  async (name: string, { getState, dispatch }) => {
    const { token, user } = (getState() as RootState).auth;
    const isFullAccount = !!user && user.provider !== "anonymous";

    if (token && isFullAccount) {
      const result = await d(dispatch)(
        listsApi.endpoints.createList.initiate({ name, type: toSlug(name) })
      ).unwrap();
      return {
        id: result.list.id,
        type: result.list.type,
        name: result.list.name,
        posterPath: undefined,
        movies: [],
      } as FavoriteGroup;
    }

    const storage = parseStorage(await AsyncStorage.getItem(STORAGE_KEY));

    const group: FavoriteGroup = {
      id: Date.now().toString(),
      name,
      movies: [],
    };

    const updated = { ...storage, groups: [...storage.groups, group] };
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return group;
  }
);

export const addToGroup = createAsyncThunk(
  "favorites/addToGroup",
  async ({ item, groupId }: { item: FavoriteItem; groupId: string }, { getState, dispatch }) => {
    const state = getState() as RootState;
    const { token, user } = state.auth;
    const isFullAccount = !!user && user.provider !== "anonymous";

    if (token && isFullAccount) {
      const group = state.favourite.groups.find((g) => g.id === groupId);
      const listType = group?.type ?? LOCAL_ID_TO_TYPE[groupId] ?? groupId;

      await d(dispatch)(
        listsApi.endpoints.addItem.initiate({
          type: listType,
          contentId: item.id,
          contentType: item.type,
          content: { title: item.title ?? "", poster_path: item.imageUrl || null },
        })
      ).unwrap();

      const updatedList = await d(dispatch)(
        listsApi.endpoints.getList.initiate(listType, { forceRefetch: true })
      ).unwrap();

      const remoteItem = (updatedList.items as any[]).find((i) => i.contentId === item.id);

      return state.favourite.groups.map((g) => {
        if (g.id !== groupId) return g;
        const exists = g.movies.some((m) => m.id === item.id);
        if (exists) return g;
        return {
          ...g,
          posterPath: item.imageUrl || g.posterPath,
          movies: [{ ...item, remoteItemId: remoteItem?.id }, ...g.movies],
        };
      });
    }

    const storage = parseStorage(await AsyncStorage.getItem(STORAGE_KEY));

    const updated = {
      ...storage,
      groups: storage.groups.map((group: FavoriteGroup) => {
        if (group.id === groupId) {
          const exists = group.movies.some((movie) => movie.id === item.id);
          if (!exists) {
            const posterPath = item?.imageUrl || "";
            return { ...group, posterPath, movies: [item, ...group.movies] };
          }
        }
        return group;
      }),
    };

    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated.groups;
  }
);

export const removeFromGroup = createAsyncThunk(
  "favorites/removeFromGroup",
  async ({ movieId, groupId }: { movieId: number; groupId: string }, { getState, dispatch }) => {
    const state = getState() as RootState;
    const { token, user } = state.auth;
    const isFullAccount = !!user && user.provider !== "anonymous";

    if (token && isFullAccount) {
      const group = state.favourite.groups.find((g) => g.id === groupId);
      const movie = group?.movies.find((m) => m.id === movieId);
      const listType = group?.type ?? LOCAL_ID_TO_TYPE[groupId] ?? groupId;

      let remoteItemId = movie?.remoteItemId;
      if (!remoteItemId) {
        // previewItems don't carry remoteItemId — fetch from cache (or network) to resolve it
        const listData = await d(dispatch)(
          listsApi.endpoints.getList.initiate(listType, { forceRefetch: false })
        ).unwrap();
        remoteItemId = (listData.items as any[]).find((i) => i.contentId === movieId)?.id;
      }

      if (remoteItemId) {
        await d(dispatch)(
          listsApi.endpoints.removeItem.initiate({ itemId: remoteItemId, listType })
        ).unwrap();
      } else {
        // Local-only un-migrated item — remove from AsyncStorage so it doesn't reappear on reload
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        const storage = raw ? JSON.parse(raw) : { groups: [] };
        const updated = {
          ...storage,
          groups: storage.groups.map((g: FavoriteGroup) => {
            if (g.id !== groupId) return g;
            return { ...g, movies: g.movies.filter((m: FavoriteItem) => m.id !== movieId) };
          }),
        };
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      }

      return state.favourite.groups.map((g) => {
        if (g.id !== groupId) return g;
        const updatedMovies = g.movies.filter((m) => m.id !== movieId);
        const posterPath =
          g.posterPath === g.movies.find((m) => m.id === movieId)?.imageUrl
            ? updatedMovies[0]?.imageUrl || undefined
            : g.posterPath;
        return { ...g, posterPath, movies: updatedMovies };
      });
    }

    const storage = parseStorage(await AsyncStorage.getItem(STORAGE_KEY));

    const updated = {
      ...storage,
      groups: storage.groups.map((group: FavoriteGroup) => {
        if (group.id === groupId) {
          const updatedMovies = group.movies.filter((movie) => movie.id !== movieId);
          const posterPath =
            group.posterPath === group.movies.find((m) => m.id === movieId)?.imageUrl
              ? updatedMovies[0]?.imageUrl || undefined
              : group.posterPath;
          return { ...group, posterPath, movies: updatedMovies };
        }
        return group;
      }),
    };

    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated.groups;
  }
);

export const deleteGroup = createAsyncThunk(
  "favorites/deleteGroup",
  async (groupId: string, { getState, dispatch }) => {
    const state = getState() as RootState;
    const { token, user } = state.auth;
    const isFullAccount = !!user && user.provider !== "anonymous";

    if (token && isFullAccount) {
      const group = state.favourite.groups.find((g) => g.id === groupId);
      const listType = group?.type ?? LOCAL_ID_TO_TYPE[groupId] ?? groupId;
      await d(dispatch)(listsApi.endpoints.deleteList.initiate(listType)).unwrap();
      return groupId;
    }

    const storage = parseStorage(await AsyncStorage.getItem(STORAGE_KEY));

    const updated = {
      ...storage,
      groups: storage.groups.filter((group: FavoriteGroup) => group.id !== groupId),
    };

    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return groupId;
  }
);

export const createGroupFromArray = createAsyncThunk(
  "favourites/createGroupFromArray",
  async ({ name, movies }: { name: string; movies: Movie[] }, { getState, dispatch }) => {
    const state = getState() as RootState;
    const { token, user } = state.auth;
    const isFullAccount = !!user && user.provider !== "anonymous";

    if (token && isFullAccount) {
      const result = await d(dispatch)(
        listsApi.endpoints.createList.initiate({ name, type: toSlug(name) })
      ).unwrap();

      for (const movie of movies) {
        const contentType = (movie.type as MediaType) ?? (movie.first_air_date ? "tv" : "movie");
        await d(dispatch)(
          listsApi.endpoints.addItem.initiate({
            type: result.list.type,
            contentId: movie.id,
            contentType,
            content: {
              title: movie.title || (movie as any).name || "",
              poster_path: movie.poster_path || null,
            },
          })
        ).unwrap();
      }

      const listResult = await d(dispatch)(
        listsApi.endpoints.getList.initiate(result.list.type, { forceRefetch: true })
      ).unwrap();

      return {
        id: result.list.id,
        type: result.list.type,
        name: result.list.name,
        posterPath: movies[0]?.poster_path || undefined,
        movies: (listResult.items as any[]).map((item) => ({
          id: item.contentId,
          imageUrl: item.content.poster_path || "",
          type: item.contentType as MediaType,
          remoteItemId: item.id,
        })),
      } as FavoriteGroup;
    }

    try {
      const data = await AsyncStorage.getItem(STORAGE_KEY);
      const storage = data ? JSON.parse(data) : { groups: [] };

      const group: FavoriteGroup = {
        id: Date.now().toString(),
        name,
        movies: movies.map((m) => ({
          id: m.id,
          imageUrl: m.poster_path,
          type: m.type as "movie" | "tv",
        })),
      };

      const updated = { ...storage, groups: [...storage.groups, group] };
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return group;
    } catch (error) {
      throw new Error("createGroupFromArray failed: " + error);
    }
  }
);

export const addManyToGroup = createAsyncThunk(
  "favorites/addManyToGroup",
  async (
    { groupId, movies }: { groupId: string; movies: PendingBulkMovie[] },
    { getState, dispatch }
  ) => {
    const state = getState() as RootState;
    const { token, user } = state.auth;
    const isFullAccount = !!user && user.provider !== "anonymous";

    if (token && isFullAccount) {
      const group = state.favourite.groups.find((g) => g.id === groupId);
      const listType = group?.type ?? LOCAL_ID_TO_TYPE[groupId] ?? groupId;

      const items = movies.map((m) => ({
        contentId: m.id,
        contentType: (m.type ?? (m.first_air_date ? "tv" : "movie")) as "movie" | "tv",
        content: {
          title: m.title || m.name || "",
          poster_path: m.poster_path ?? null,
        },
      }));

      await d(dispatch)(
        listsApi.endpoints.addBulkItems.initiate({ type: listType, items })
      ).unwrap();

      const updatedList = await d(dispatch)(
        listsApi.endpoints.getList.initiate(listType, { forceRefetch: true })
      ).unwrap();

      return {
        groupId,
        movies: (updatedList.items as any[]).map((item) => ({
          id: item.contentId,
          imageUrl: item.content?.poster_path || "",
          type: item.contentType as MediaType,
          remoteItemId: item.id,
        })),
      };
    }

    const storage = parseStorage(await AsyncStorage.getItem(STORAGE_KEY));
    const updated = {
      ...storage,
      groups: storage.groups.map((group: FavoriteGroup) => {
        if (group.id !== groupId) return group;
        const existingIds = new Set(group.movies.map((m) => m.id));
        const newItems: FavoriteItem[] = movies
          .filter((m) => !existingIds.has(m.id))
          .map((m) => ({
            id: m.id,
            imageUrl: m.poster_path ?? "",
            type: (m.type ?? (m.first_air_date ? "tv" : "movie")) as MediaType,
            title: m.title || m.name,
          }));
        return {
          ...group,
          posterPath: group.posterPath || newItems[0]?.imageUrl || group.posterPath,
          movies: [...newItems, ...group.movies],
        };
      }),
    };
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    const updatedGroup = updated.groups.find((g: FavoriteGroup) => g.id === groupId);
    return { groupId, movies: updatedGroup?.movies ?? [] };
  }
);

export const rateInGroup = createAsyncThunk(
  "favorites/rateInGroup",
  async (
    { groupId, movieId, rating, review }: { groupId: string; movieId: number; rating?: number | null; review?: string | null },
    { getState }
  ) => {
    const state = getState() as RootState;
    const groups = state.favourite.groups.map((g) => {
      if (g.id !== groupId) return g;
      return {
        ...g,
        movies: g.movies.map((m) =>
          m.id === movieId ? { ...m, rating: rating ?? null, review: review ?? null } : m
        ),
      };
    });

    // Ratings are local-only; while signed in, skip storage so remote-derived
    // groups are never cached as local data.
    const isFullAccount = !!state.auth.user && state.auth.user.provider !== "anonymous";
    if (!isFullAccount) {
      const storage = parseStorage(await AsyncStorage.getItem(STORAGE_KEY));
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ ...storage, groups }));
    }

    return groups;
  }
);

export const favoritesSlice = createSlice({
  name: "favorites",
  initialState,
  reducers: {
    setPendingBulkMovies(state, action: { payload: PendingBulkMovie[] }) {
      state.pendingBulkMovies = action.payload;
    },
    clearPendingBulkMovies(state) {
      state.pendingBulkMovies = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadFavorites.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadFavorites.fulfilled, (state, action) => {
        state.groups = action.payload.groups;
        state.membershipIndex = action.payload.membershipIndex;
        state.loading = false;
      })
      .addCase(createGroup.fulfilled, (state, action) => {
        state.groups.push(action.payload);
        state.membershipIndex[action.payload.id] = {};
      })
      .addCase(addToGroup.fulfilled, (state, action) => {
        state.groups = action.payload;
        const { item, groupId } = (action as any).meta.arg;
        if (!state.membershipIndex[groupId]) state.membershipIndex[groupId] = {};
        state.membershipIndex[groupId][`${item.id}:${item.type}`] = true;
      })
      .addCase(removeFromGroup.fulfilled, (state, action) => {
        state.groups = action.payload;
        const { movieId, groupId } = (action as any).meta.arg;
        const entry = state.membershipIndex[groupId];
        if (entry) {
          for (const key of Object.keys(entry)) {
            if (key.startsWith(`${movieId}:`)) delete entry[key];
          }
        }
      })
      .addCase(deleteGroup.fulfilled, (state, action) => {
        state.groups = state.groups.filter((group) => group.id !== action.payload);
        delete state.membershipIndex[action.payload];
      })
      .addCase(rateInGroup.fulfilled, (state, action) => {
        state.groups = action.payload;
      })
      .addCase(createGroupFromArray.fulfilled, (state, action) => {
        state.groups.push(action.payload);
        const entry: Record<string, true> = {};
        for (const m of action.payload.movies) entry[`${m.id}:${m.type}`] = true;
        state.membershipIndex[action.payload.id] = entry;
      })
      .addCase(addManyToGroup.fulfilled, (state, action) => {
        const { groupId, movies } = action.payload;
        const group = state.groups.find((g) => g.id === groupId);
        if (group) group.movies = movies;
        if (!state.membershipIndex[groupId]) state.membershipIndex[groupId] = {};
        for (const m of movies) {
          state.membershipIndex[groupId][`${m.id}:${m.type}`] = true;
        }
      })
      .addMatcher(
        (action): action is { type: string; error: { message?: string } } =>
          action.type.endsWith("/rejected"),
        (state, action) => {
          state.loading = false;
          state.error = action.error?.message || "An error occurred";
        }
      );
  },
});

export const { setPendingBulkMovies, clearPendingBulkMovies } = favoritesSlice.actions;
export const { reducer: favouritesReducer } = favoritesSlice;
