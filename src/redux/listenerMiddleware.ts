import { createListenerMiddleware, isAnyOf } from "@reduxjs/toolkit";
import { resetRefreshPromise } from "./baseQuery";
import * as SecureStore from "expo-secure-store";
import { setProviders, toggleProvider, toggleGenre, setGenres, clearAllFilters } from "./mediaFilters/mediaFiltersSlice";
import { saveFilterPreferences, clearFilterPreferences } from "./filterPreferences/filterPreferencesSlice";
import { authActions, type AuthUser } from "./auth/authSlice";
import { appActions } from "./app/appSlice";
import { roomActions } from "./room/roomSlice";
import { createGroup, createGroupFromArray } from "./favourites/favourites";
import { Platform } from "react-native";
import { posthog } from "../constants/posthog";

export const listenerMiddleware = createListenerMiddleware();

// Auto-save providers and genres to storage when they change in mediaFilters
listenerMiddleware.startListening({
  matcher: isAnyOf(setProviders, toggleProvider, toggleGenre, setGenres),
  effect: async (action, listenerApi) => {
    const state = listenerApi.getState() as {
      mediaFilters: {
        selectedProviders: number[];
        selectedGenres: { id: number; name: string }[];
      };
    };
    const { selectedProviders: providers, selectedGenres: genres } =
      state.mediaFilters;
    listenerApi.dispatch(saveFilterPreferences({ providers, genres }));
  },
});

// Clear storage when filters are cleared
listenerMiddleware.startListening({
  actionCreator: clearAllFilters,
  effect: async (action, listenerApi) => {
    listenerApi.dispatch(clearFilterPreferences());
  },
});

// Persist tokens and identify an authenticated account. The SDK retains this
// identity, so subsequent token refreshes do not need another identify call.
listenerMiddleware.startListening({
  actionCreator: authActions.setCredentials,
  effect: async (action, listenerApi) => {
    const user = action.payload.user;
    const previousUser = (listenerApi.getOriginalState() as {
      auth: { user: AuthUser | null };
    }).auth.user;

    if (user.provider !== "anonymous" && previousUser?.id !== user.id) {
      posthog?.identify(user.id, {
        $set: {
          email: user.email,
          name: user.name,
          provider: user.provider,
        },
      });
    }

    await SecureStore.setItemAsync("user_auth_token", action.payload.token);
    if (action.payload.refreshToken) {
      await SecureStore.setItemAsync("user_refresh_token", action.payload.refreshToken);
    }
  },
});

listenerMiddleware.startListening({
  actionCreator: authActions.setToken,
  effect: async (action) => {
    await SecureStore.setItemAsync("user_auth_token", action.payload.token);
    if (action.payload.refreshToken) {
      await SecureStore.setItemAsync("user_refresh_token", action.payload.refreshToken);
    }
  },
});

listenerMiddleware.startListening({
  matcher: isAnyOf(authActions.clearAuth, authActions.setSessionExpired),
  effect: async (action) => {
    if (action.type === authActions.clearAuth.type) {
      posthog?.reset();
      resetRefreshPromise();
    }
    await SecureStore.deleteItemAsync("user_auth_token");
    await SecureStore.deleteItemAsync("user_refresh_token");
  },
});

// PostHog: anonymous device identity + locale context on every event
listenerMiddleware.startListening({
  actionCreator: appActions.setUserId,
  effect: (action) => {
    posthog?.register({ anonymous_id: action.payload });
  },
});

listenerMiddleware.startListening({
  actionCreator: roomActions.setSettings,
  effect: (action) => {
    posthog?.register({
      language: action.payload.language ?? null,
      regionalization: action.payload.regionalization ?? null,
      platform: Platform.OS,
    });
  },
});

// Local (anonymous) custom group creation — the remote path is tracked
// via list_created in listsApi
listenerMiddleware.startListening({
  matcher: isAnyOf(createGroup.fulfilled, createGroupFromArray.fulfilled),
  effect: () => {
    posthog?.capture("group_created", { local: true });
  },
});
