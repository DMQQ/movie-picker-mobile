import { configureStore } from "@reduxjs/toolkit";
import { roomSlice } from "./room/roomSlice";
import { useDispatch, useSelector } from "react-redux";
import { movieApi } from "./movie/movieApi";
import { favoritesSlice } from "./favourites/favourites";

const store = configureStore({
  reducer: {
    room: roomSlice.reducer,
    [movieApi.reducerPath]: movieApi.reducer,

    favourite: favoritesSlice.reducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(movieApi.middleware),
});

export { store };

export type RootState = ReturnType<typeof store.getState>;

export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();
