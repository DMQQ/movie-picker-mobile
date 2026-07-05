import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  onboardingCompleted: false,
};

const appSlice = createSlice({
  name: "app",
  initialState,
  reducers: {
    setOnboardingCompleted(state) {
      state.onboardingCompleted = true;
    },
  },
});

export { appSlice };
export const appActions = appSlice.actions;
