import { configureStore } from "@reduxjs/toolkit";
import { roomSlice } from "./room/roomSlice";
import { useDispatch, useSelector } from "react-redux";
import { movieApi } from "./movie/movieApi";
import { favoritesSlice } from "./favourites/favourites";
import { personApi } from "./person/personApi";
import { roomBuilderSlice } from "./roomBuilder/roomBuilderSlice";
import { mediaFiltersSlice } from "./mediaFilters/mediaFiltersSlice";

const store = configureStore({
  reducer: {
    room: roomSlice.reducer,
    [movieApi?.reducerPath]: movieApi.reducer,
    [personApi?.reducerPath]: personApi.reducer,
    favourite: favoritesSlice.reducer,
    builder: roomBuilderSlice.reducer,
    mediaFilters: mediaFiltersSlice.reducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat([movieApi.middleware, personApi.middleware]),
});

export { store };

export type RootState = ReturnType<typeof store.getState>;

export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();
