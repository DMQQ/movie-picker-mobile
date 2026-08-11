import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type ToastType = "info" | "success" | "error";

export interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
  duration: number;
}

const toastSlice = createSlice({
  name: "toast",
  initialState: [] as ToastItem[],
  reducers: {
    addToast(state, action: PayloadAction<ToastItem>) {
      state.push(action.payload);
    },
    removeToast(state, action: PayloadAction<string>) {
      return state.filter((t) => t.id !== action.payload);
    },
  },
});

export const { addToast, removeToast } = toastSlice.actions;
export default toastSlice;
