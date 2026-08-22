import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { AsyncStorage } from "expo-sqlite/kv-store";

export const TUTORIAL_KEYS = [
  "tutorial_home_seen",
  "tutorial_discover_seen",
  "tutorial_favourites_seen",
  "tutorial_search_seen",
  "tutorial_account_seen",
  "tutorial_swipe_seen",
] as const;

export type TutorialKey = (typeof TUTORIAL_KEYS)[number];

interface TutorialState {
  loaded: boolean;
  seen: Record<TutorialKey, boolean>;
}

const initialSeen = Object.fromEntries(
  TUTORIAL_KEYS.map((k) => [k, false]),
) as Record<TutorialKey, boolean>;

const initialState: TutorialState = {
  loaded: false,
  seen: initialSeen,
};

export const loadTutorialState = createAsyncThunk(
  "tutorial/load",
  async () => {
    const values = await AsyncStorage.multiGet(TUTORIAL_KEYS as unknown as string[]);
    return Object.fromEntries(
      values.map(([key, val]) => [key, val === "1"]),
    ) as Record<TutorialKey, boolean>;
  },
);

export const tutorialSlice = createSlice({
  name: "tutorial",
  initialState,
  reducers: {
    markSeen(state, action: PayloadAction<TutorialKey>) {
      state.seen[action.payload] = true;
    },
    markAllSeen(state) {
      TUTORIAL_KEYS.forEach((k) => {
        state.seen[k] = true;
      });
    },
  },
  extraReducers(builder) {
    builder.addCase(loadTutorialState.fulfilled, (state, action) => {
      state.seen = action.payload;
      state.loaded = true;
    });
  },
});

export const tutorialActions = tutorialSlice.actions;
