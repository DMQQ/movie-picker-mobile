import { createSlice, PayloadAction } from "@reduxjs/toolkit";

const initialState = {
  userId: null as string | null,
};

const appSlice = createSlice({
  name: "app",
  initialState,
  reducers: {
    setUserId(state, action: PayloadAction<string>) {
      console.log("Redux setUserId:", action.payload);
      state.userId = action.payload;
    },
  },
});

export { appSlice };
export const appActions = appSlice.actions;
export const { setUserId } = appSlice.actions;
