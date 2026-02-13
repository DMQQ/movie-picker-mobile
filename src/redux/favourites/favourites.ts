import { AsyncStorage } from "expo-sqlite/kv-store";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { Movie } from "../../../types";

type MediaType = "movie" | "tv";

interface FavoriteItem {
  id: number;
  imageUrl: string;
  type: MediaType;
}

interface FavoriteGroup {
  id: string;
  name: string;
  posterPath?: string;
  movies: FavoriteItem[];
}

interface FavoritesState {
  groups: FavoriteGroup[];
  loading: boolean;
  error: string | null;
}

const initialState: FavoritesState = {
  groups: [],
  loading: false,
  error: null,
};

export const STORAGE_KEY = "favorites_groups";

const makeDefaultGroups = () => {
  return [
    {
      id: "1",
      name: "Favorites",
      movies: [],
      posterPath: undefined,
    },
    {
      id: "2",
      name: "Watchlist",
      movies: [],
      posterPath: undefined,
    },
    {
      id: "999",
      name: "Watched",
      movies: [],
      posterPath: undefined,
    },
  ] as FavoriteGroup[];
};

export const loadFavorites = createAsyncThunk("favorites/load", async () => {
  const data = await AsyncStorage.getItem(STORAGE_KEY);

  if (!data) {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ groups: makeDefaultGroups() }));

    return { groups: makeDefaultGroups() };
  }

  return data ? JSON.parse(data) : { groups: [] };
});

export const createGroup = createAsyncThunk("favorites/createGroup", async (name: string) => {
  const data = await AsyncStorage.getItem(STORAGE_KEY);
  const storage = data ? JSON.parse(data) : { groups: [] };

  const group: FavoriteGroup = {
    id: Date.now().toString(),
    name,
    movies: [],
  };

  const updated = {
    ...storage,
    groups: [...storage.groups, group],
  };

  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return group;
});

export const addToGroup = createAsyncThunk("favorites/addToGroup", async ({ item, groupId }: { item: FavoriteItem; groupId: string }) => {
  const data = await AsyncStorage.getItem(STORAGE_KEY);
  const storage = data ? JSON.parse(data) : { groups: [] };

  const updated = {
    ...storage,
    groups: storage.groups.map((group: FavoriteGroup) => {
      if (group.id === groupId) {
        // Check if movie already exists in group
        const exists = group.movies.some((movie) => movie.id === item.id);
        if (!exists) {
          // Update posterPath if it's the first movie
          const posterPath = item?.imageUrl || "";
          return {
            ...group,
            posterPath,
            movies: [item, ...group.movies],
          };
        }
      }
      return group;
    }),
  };

  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return updated.groups;
});

export const removeFromGroup = createAsyncThunk(
  "favorites/removeFromGroup",
  async ({ movieId, groupId }: { movieId: number; groupId: string }) => {
    const data = await AsyncStorage.getItem(STORAGE_KEY);
    const storage = data ? JSON.parse(data) : { groups: [] };

    const updated = {
      ...storage,
      groups: storage.groups.map((group: FavoriteGroup) => {
        if (group.id === groupId) {
          const updatedMovies = group.movies.filter((movie) => movie.id !== movieId);
          // Update posterPath if removing the movie that was used as poster
          const posterPath =
            group.posterPath === group.movies.find((m) => m.id === movieId)?.imageUrl
              ? updatedMovies[0]?.imageUrl || undefined
              : group.posterPath;
          return {
            ...group,
            posterPath,
            movies: updatedMovies,
          };
        }
        return group;
      }),
    };

    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated.groups;
  }
);

export const deleteGroup = createAsyncThunk("favorites/deleteGroup", async (groupId: string) => {
  const data = await AsyncStorage.getItem(STORAGE_KEY);
  const storage = data ? JSON.parse(data) : { groups: [] };

  const updated = {
    ...storage,
    groups: storage.groups.filter((group: FavoriteGroup) => group.id !== groupId),
  };

  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return groupId;
});

export const createGroupFromArray = createAsyncThunk(
  "favourites/createGroupFromArray",
  async ({ name, movies }: { name: string; movies: Movie[] }) => {
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

      const updated = {
        ...storage,
        groups: [...storage.groups, group],
      };

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
        state.loading = false;
      })
      .addCase(createGroup.fulfilled, (state, action) => {
        state.groups.push(action.payload);
      })
      .addCase(addToGroup.fulfilled, (state, action) => {
        state.groups = action.payload;
      })
      .addCase(removeFromGroup.fulfilled, (state, action) => {
        state.groups = action.payload;
      })
      .addCase(deleteGroup.fulfilled, (state, action) => {
        state.groups = state.groups.filter((group) => group.id !== action.payload);
      })
      .addCase(createGroupFromArray.fulfilled, (state, action) => {
        state.groups.push(action.payload);
      })
      .addMatcher(
        (action) => action.type.endsWith("/rejected"),
        (state, action) => {
          state.loading = false;
          state.error = action.error?.message || "An error occurred";
        }
      );
  },
});
