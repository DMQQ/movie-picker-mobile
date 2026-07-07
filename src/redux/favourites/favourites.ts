import { AsyncStorage } from "expo-sqlite/kv-store";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { Movie } from "../../../types";
import { listsApi } from "../lists/listsApi";
import type { RootState } from "../store";

type MediaType = "movie" | "tv";

interface FavoriteItem {
  id: number;
  imageUrl: string;
  type: MediaType;
  remoteItemId?: string;
}

interface FavoriteGroup {
  id: string;
  type?: string;
  name: string;
  posterPath?: string;
  movies: FavoriteItem[];
}

interface FavoritesState {
  groups: FavoriteGroup[];
  // O(1) membership lookup: localGroupId → "contentId:contentType" → true
  membershipIndex: Record<string, Record<string, true>>;
  loading: boolean;
  error: string | null;
}

const initialState: FavoritesState = {
  groups: [],
  membershipIndex: {},
  loading: false,
  error: null,
};

export const STORAGE_KEY = "favorites_groups";

// System list type ↔ local group id mappings
const LOCAL_ID_TO_TYPE: Record<string, string> = {
  "1": "favourites",
  "2": "watchlist",
  "999": "watched",
};

const TYPE_TO_LOCAL_ID: Record<string, string> = {
  favourites: "1",
  watchlist: "2",
  watched: "999",
};

// Types that have their own dedicated screens (not shown in the groups list)
const INTERACTION_LIST_TYPES = new Set(["superliked", "disliked"]);

function toSlug(name: string) {
  return name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
}

const makeDefaultGroups = () => {
  return [
    { id: "1", type: "favourites", name: "Favorites", movies: [], posterPath: undefined },
    { id: "2", type: "watchlist", name: "Watchlist", movies: [], posterPath: undefined },
    { id: "999", type: "watched", name: "Watched", movies: [], posterPath: undefined },
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
    const token = (getState() as RootState).auth.token;

    if (token) {
      const listsResult = await d(dispatch)(
        listsApi.endpoints.getLists.initiate(undefined, { forceRefetch: true })
      ).unwrap();

      const filteredLists = (listsResult.lists as any[]).filter(
        (l) => !INTERACTION_LIST_TYPES.has(l.type)
      );

      // Build membership index from lightweight items — no extra round-trips
      const membershipIndex: Record<string, Record<string, true>> = {};
      for (const list of filteredLists) {
        const localId = TYPE_TO_LOCAL_ID[list.type] ?? list.id;
        const entry: Record<string, true> = {};
        for (const item of list.items ?? []) {
          entry[`${item.contentId}:${item.contentType}`] = true;
        }
        membershipIndex[localId] = entry;
      }

      // Fetch full content (with posters) per list — for display only
      const remoteGroups: FavoriteGroup[] = await Promise.all(
        filteredLists.map(async (list: any) => {
          const localId = TYPE_TO_LOCAL_ID[list.type] ?? list.id;
          const listResult = await d(dispatch)(
            listsApi.endpoints.getList.initiate(list.type, { forceRefetch: true })
          ).unwrap();
          return {
            id: localId,
            type: list.type,
            name: list.name,
            posterPath: list.posterPath ?? undefined,
            movies: (listResult.items as any[]).map((item) => ({
              id: item.contentId,
              imageUrl: item.content.poster_path || "",
              type: item.contentType as MediaType,
              remoteItemId: item.id,
            })),
          };
        })
      );

      // Merge un-migrated local groups so they show before migration
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      const localGroups: FavoriteGroup[] = raw ? JSON.parse(raw).groups ?? [] : [];

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
    const groups: FavoriteGroup[] = data
      ? JSON.parse(data).groups ?? makeDefaultGroups()
      : makeDefaultGroups();

    if (!data) {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ groups }));
    }

    return { groups, membershipIndex: buildMembershipIndex(groups) };
  }
);

export const createGroup = createAsyncThunk(
  "favorites/createGroup",
  async (name: string, { getState, dispatch }) => {
    const token = (getState() as RootState).auth.token;

    if (token) {
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

    const data = await AsyncStorage.getItem(STORAGE_KEY);
    const storage = data ? JSON.parse(data) : { groups: [] };

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
    const token = state.auth.token;

    if (token) {
      const group = state.favourite.groups.find((g) => g.id === groupId);
      const listType = group?.type ?? LOCAL_ID_TO_TYPE[groupId] ?? groupId;

      await d(dispatch)(
        listsApi.endpoints.addItem.initiate({
          type: listType,
          contentId: item.id,
          contentType: item.type,
          content: { title: "", poster_path: item.imageUrl || null },
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

    const data = await AsyncStorage.getItem(STORAGE_KEY);
    const storage = data ? JSON.parse(data) : { groups: [] };

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
    const token = state.auth.token;

    if (token) {
      const group = state.favourite.groups.find((g) => g.id === groupId);
      const movie = group?.movies.find((m) => m.id === movieId);

      if (movie?.remoteItemId) {
        const listType = group?.type ?? LOCAL_ID_TO_TYPE[groupId] ?? groupId;
        await d(dispatch)(
          listsApi.endpoints.removeItem.initiate({ itemId: movie.remoteItemId, listType })
        ).unwrap();
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

    const data = await AsyncStorage.getItem(STORAGE_KEY);
    const storage = data ? JSON.parse(data) : { groups: [] };

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
    const token = state.auth.token;

    if (token) {
      const group = state.favourite.groups.find((g) => g.id === groupId);
      const listType = group?.type ?? LOCAL_ID_TO_TYPE[groupId] ?? groupId;
      await d(dispatch)(listsApi.endpoints.deleteList.initiate(listType)).unwrap();
      return groupId;
    }

    const data = await AsyncStorage.getItem(STORAGE_KEY);
    const storage = data ? JSON.parse(data) : { groups: [] };

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
    const token = state.auth.token;

    if (token) {
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

export const favoritesSlice = createSlice({
  name: "favorites",
  initialState,
  reducers: {},
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
      .addCase(createGroupFromArray.fulfilled, (state, action) => {
        state.groups.push(action.payload);
        const entry: Record<string, true> = {};
        for (const m of action.payload.movies) entry[`${m.id}:${m.type}`] = true;
        state.membershipIndex[action.payload.id] = entry;
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
