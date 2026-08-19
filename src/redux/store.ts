import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import { AppState } from "react-native";
import { roomSlice } from "./room/roomSlice";
import { eitherOrSlice } from "./eitherOr/eitherOrSlice";
import { useDispatch, useSelector } from "react-redux";
import { movieApi } from "./movie/movieApi";
import { favoritesSlice } from "./favourites/favourites";
import { personApi } from "./person/personApi";
import { roomBuilderSlice } from "./roomBuilder/roomBuilderSlice";
import { mediaFiltersSlice } from "./mediaFilters/mediaFiltersSlice";
import { movieInteractionsSlice } from "./movieInteractions/movieInteractionsSlice";
import { filterPreferencesSlice } from "./filterPreferences/filterPreferencesSlice";
import { listenerMiddleware } from "./listenerMiddleware";
import { authSlice } from "./auth/authSlice";
import { authApi } from "./auth/authApi";
import { appSlice } from "./app/appSlice";
import { listsApi } from "./lists/listsApi";
import { roomApi } from "./room/roomApi";
import { scoringPreferencesApi } from "./scoringPreferences/scoringPreferencesApi";
import { ratingsApi } from "./ratings/ratingsApi";
import { inviteApi } from "./invite/inviteApi";
import toastSlice from "./toast/toastSlice";
import moviePickerReducer from "./moviePicker/moviePickerSlice";

const store = configureStore({
  reducer: {
    app: appSlice.reducer,
    room: roomSlice.reducer,
    eitherOr: eitherOrSlice.reducer,
    auth: authSlice.reducer,
    [movieApi?.reducerPath]: movieApi.reducer,
    [personApi?.reducerPath]: personApi.reducer,
    [authApi.reducerPath]: authApi.reducer,
    [listsApi.reducerPath]: listsApi.reducer,
    [roomApi.reducerPath]: roomApi.reducer,
    [scoringPreferencesApi.reducerPath]: scoringPreferencesApi.reducer,
    [ratingsApi.reducerPath]: ratingsApi.reducer,
    [inviteApi.reducerPath]: inviteApi.reducer,
    favourite: favoritesSlice.reducer,
    builder: roomBuilderSlice.reducer,
    mediaFilters: mediaFiltersSlice.reducer,
    movieInteractions: movieInteractionsSlice.reducer,
    filterPreferences: filterPreferencesSlice.reducer,
    toast: toastSlice.reducer,
    moviePicker: moviePickerReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .prepend(listenerMiddleware.middleware)
      .concat([movieApi.middleware, personApi.middleware, authApi.middleware, listsApi.middleware, roomApi.middleware, scoringPreferencesApi.middleware, ratingsApi.middleware, inviteApi.middleware]),
});

setupListeners(store.dispatch, (dispatch, { onFocus, onFocusLost }) => {
  const sub = AppState.addEventListener("change", (state) => {
    if (state === "active") {
      dispatch(onFocus());
    } else {
      dispatch(onFocusLost());
    }
  });
  return () => sub.remove();
});

export { store };

export type RootState = ReturnType<typeof store.getState>;

export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();
