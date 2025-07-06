import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import AsyncStorage from "@react-native-async-storage/async-storage";

type MediaType = "movie" | "tv";

interface WatchedItem {
  id: number;
  poster_path: string;
  type: MediaType;
}

interface WatchedState {
  items: WatchedItem[];
  loading: boolean;
  error: string | null;
}

const initialState: WatchedState = {
  items: [],
  loading: false,
  error: null,
};

const STORAGE_KEY = "watchedMedia";

export const loadWatched = createAsyncThunk("watched/load", async () => {
  const stored = await AsyncStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
});

export const addWatched = createAsyncThunk("watched/add", async (item: WatchedItem) => {
  const stored = await AsyncStorage.getItem(STORAGE_KEY);
  const items = stored ? JSON.parse(stored) : [];
  const updated = [
    ...items,
    {
      id: item.id,
      imageUrl: item.poster_path,
      type: item.type,
    },
  ] as WatchedItem[];
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return item;
});

export const removeWatched = createAsyncThunk("watched/remove", async (id: number) => {
  const stored = await AsyncStorage.getItem(STORAGE_KEY);
  const items = stored ? JSON.parse(stored) : [];
  const updated = items.filter((item: WatchedItem) => item.id !== id);
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return id;
});

export const watchedSlice = createSlice({
  name: "watched",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(loadWatched.pending, (state) => {
        state.loading = true;
      })
      .addCase(loadWatched.fulfilled, (state, action) => {
        state.items = action.payload;
        state.loading = false;
      })
      .addCase(addWatched.fulfilled, (state, action) => {
        state.items.push({
          id: action.payload.id,
          poster_path: action.payload.poster_path,
          type: action.payload.type,
        });
      })
      .addCase(removeWatched.fulfilled, (state, action) => {
        state.items = state.items.filter((item) => item.id !== action.payload);
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
