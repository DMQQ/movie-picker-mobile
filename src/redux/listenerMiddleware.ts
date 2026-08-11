import { createListenerMiddleware, isAnyOf } from "@reduxjs/toolkit";
import * as SecureStore from "expo-secure-store";
import { setProviders, toggleProvider, clearAllFilters } from "./mediaFilters/mediaFiltersSlice";
import { saveFilterPreferences, clearFilterPreferences } from "./filterPreferences/filterPreferencesSlice";
import { authActions, type AuthUser } from "./auth/authSlice";
import { appActions } from "./app/appSlice";
import { roomActions } from "./room/roomSlice";
import * as Sentry from "@sentry/react-native";
import { Platform } from "react-native";

export const listenerMiddleware = createListenerMiddleware();

// Auto-save providers to storage when they change in mediaFilters
listenerMiddleware.startListening({
  matcher: isAnyOf(setProviders, toggleProvider),
  effect: async (action, listenerApi) => {
    const state = listenerApi.getState() as { mediaFilters: { selectedProviders: number[] } };
    const providers = state.mediaFilters.selectedProviders;
    listenerApi.dispatch(saveFilterPreferences({ providers }));
  },
});

// Clear storage when filters are cleared
listenerMiddleware.startListening({
  actionCreator: clearAllFilters,
  effect: async (action, listenerApi) => {
    listenerApi.dispatch(clearFilterPreferences());
  },
});

// Sentry: attribute errors to the signed-in user
function setSentryUser(user: AuthUser) {
  Sentry.setUser({ id: user.id, email: user.email, username: user.name });
}

// Persist tokens to SecureStore on login / token refresh
listenerMiddleware.startListening({
  actionCreator: authActions.setCredentials,
  effect: async (action) => {
    setSentryUser(action.payload.user);
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
  actionCreator: authActions.setUser,
  effect: (action) => setSentryUser(action.payload),
});

listenerMiddleware.startListening({
  matcher: isAnyOf(authActions.clearAuth, authActions.setSessionExpired),
  effect: async () => {
    Sentry.setUser(null);
    await SecureStore.deleteItemAsync("user_auth_token");
    await SecureStore.deleteItemAsync("user_refresh_token");
  },
});

// Sentry: anonymous device identity + locale context
listenerMiddleware.startListening({
  actionCreator: appActions.setUserId,
  effect: (action) => {
    Sentry.setTag("anonymous_id", action.payload);
  },
});

listenerMiddleware.startListening({
  actionCreator: roomActions.setSettings,
  effect: (action) => {
    Sentry.setContext("device", {
      language: action.payload.language,
      regionalization: action.payload.regionalization,
      platform: Platform.OS,
    });
  },
});
