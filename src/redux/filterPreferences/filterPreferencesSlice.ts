import { AsyncStorage } from "expo-sqlite/kv-store";
import { createAsyncThunk, createSlice, createSelector } from "@reduxjs/toolkit";
import type { RootState } from "../store";

const FILTER_PREFERENCES_KEY = "room_builder_preferences";

interface FilterPreferences {
  providers: number[];
  savedAt: number;
}

interface FilterPreferencesState {
  preferences: FilterPreferences | null;
  loading: boolean;
  hydrated: boolean;
  error: string | null;
}

const initialState: FilterPreferencesState = {
  preferences: null,
  loading: false,
  hydrated: false,
  error: null,
};

export const loadFilterPreferences = createAsyncThunk(
  "filterPreferences/load",
  async () => {
    const saved = await AsyncStorage.getItem(FILTER_PREFERENCES_KEY);
    if (saved) {
      return JSON.parse(saved) as FilterPreferences;
    }
    return null;
  }
);

export const saveFilterPreferences = createAsyncThunk(
  "filterPreferences/save",
  async (newPreferences: Partial<FilterPreferences>) => {
    const toSave: FilterPreferences = {
      providers: newPreferences.providers || [],
      savedAt: Date.now(),
    };
    await AsyncStorage.setItem(FILTER_PREFERENCES_KEY, JSON.stringify(toSave));
    return toSave;
  }
);

export const clearFilterPreferences = createAsyncThunk(
  "filterPreferences/clear",
  async () => {
    await AsyncStorage.removeItem(FILTER_PREFERENCES_KEY);
    return null;
  }
);

export const filterPreferencesSlice = createSlice({
  name: "filterPreferences",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(loadFilterPreferences.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadFilterPreferences.fulfilled, (state, action) => {
        state.preferences = action.payload;
        state.loading = false;
        state.hydrated = true;
      })
      .addCase(saveFilterPreferences.fulfilled, (state, action) => {
        state.preferences = action.payload;
      })
      .addCase(clearFilterPreferences.fulfilled, (state) => {
        state.preferences = null;
      })
      .addMatcher(
        (action): action is { type: string; error: { message?: string } } =>
          action.type.startsWith("filterPreferences/") && action.type.endsWith("/rejected"),
        (state, action) => {
          state.loading = false;
          state.error = action.error?.message || "An error occurred";
        }
      );
  },
});

// Selectors
const selectFilterPreferencesState = (state: RootState) => state.filterPreferences;

export const selectFilterPreferences = createSelector(
  selectFilterPreferencesState,
  (state) => state.preferences
);

export const selectFilterPreferencesLoading = createSelector(
  selectFilterPreferencesState,
  (state) => state.loading
);

export const selectFilterPreferencesHydrated = createSelector(
  selectFilterPreferencesState,
  (state) => state.hydrated
);

export const selectProviders = createSelector(
  selectFilterPreferences,
  (preferences) => preferences?.providers || []
);
