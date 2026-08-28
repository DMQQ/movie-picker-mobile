import { createSlice, PayloadAction } from "@reduxjs/toolkit";

const initialState = {
  userId: null as string | null,
  // Device-level settings — survive any game/room reset
  nickname: "",
  language: "en",
  regionalization: {} as Record<string, string>,
};

const appSlice = createSlice({
  name: "app",
  initialState,
  reducers: {
    setUserId(state, action: PayloadAction<string>) {
      state.userId = action.payload;
    },

    setSettings(
      state,
      {
        payload,
      }: {
        payload: Partial<{
          nickname: string;
          language: string;
          regionalization: Record<string, string>;
        }>;
      },
    ) {
      if (payload.nickname !== undefined) state.nickname = payload.nickname;
      if (payload.language !== undefined) state.language = payload.language;
      if (payload.regionalization !== undefined) state.regionalization = payload.regionalization;
    },
  },
});

export { appSlice };
export const appActions = appSlice.actions;
export const { setUserId } = appSlice.actions;
