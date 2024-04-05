import { configureStore } from "@reduxjs/toolkit";
import { roomSlice } from "./room/roomSlice";
import { useDispatch, useSelector } from "react-redux";

const store = configureStore({
  reducer: {
    room: roomSlice.reducer,
  },
});

export { store };

export type RootState = ReturnType<typeof store.getState>;

export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();
