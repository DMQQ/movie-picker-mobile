import { createSlice, PayloadAction } from "@reduxjs/toolkit";

const initialState = {
  onboardingCompleted: false,
  userId: null as string | null,
};

const appSlice = createSlice({
  name: "app",
  initialState,
  reducers: {
    setOnboardingCompleted(state) {
      state.onboardingCompleted = true;
    },
    setUserId(state, action: PayloadAction<string>) {
      state.userId = action.payload;
    },
  },
});

export { appSlice };
export const appActions = appSlice.actions;
export const { setUserId } = appSlice.actions;
