// favoritesSlice.ts
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Movie } from "../../../types";

interface FavoritesState {
  movies: Movie[];
  loading: boolean;
  error: string | null;
}

const initialState: FavoritesState = {
  movies: [],
  loading: false,
  error: null,
};

export const loadFavorites = createAsyncThunk("favorites/load", async () => {
  const stored = await AsyncStorage.getItem("favoriteMovies");
  return stored ? JSON.parse(stored) : [];
});

export const saveFavorite = createAsyncThunk("favorites/save", async (movie: Movie) => {
  const stored = await AsyncStorage.getItem("favoriteMovies");
  const movies = stored ? JSON.parse(stored) : [];
  const updated = [...movies, movie];
  await AsyncStorage.setItem("favoriteMovies", JSON.stringify(updated));
  return movie;
});

export const removeFavorite = createAsyncThunk("favorites/remove", async (id: number) => {
  const stored = await AsyncStorage.getItem("favoriteMovies");
  const movies = stored ? JSON.parse(stored) : [];
  const updated = movies.filter((m: Movie) => m.id !== id);
  await AsyncStorage.setItem("favoriteMovies", JSON.stringify(updated));
  return id;
});

export const favoritesSlice = createSlice({
  name: "favorites",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(loadFavorites.pending, (state) => {
        state.loading = true;
      })
      .addCase(loadFavorites.fulfilled, (state, action) => {
        state.movies = action.payload;
        state.loading = false;
      })
      .addCase(saveFavorite.fulfilled, (state, action) => {
        state.movies.push(action.payload);
      })
      .addCase(removeFavorite.fulfilled, (state, action) => {
        state.movies = state.movies.filter((movie) => movie.id !== action.payload);
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
