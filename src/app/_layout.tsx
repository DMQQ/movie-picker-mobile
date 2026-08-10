import { AsyncStorage } from "expo-sqlite/kv-store";
import * as SecureStore from "expo-secure-store";
import { Stack } from "expo-router";
import { ThemeProvider, DarkTheme } from "expo-router/react-navigation";
import { useEffect, useRef, useState } from "react";
import { Platform } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { PortalProvider } from "../components/Portal";
import { colors } from "../constants/design";
import {
  SafeAreaProvider,
  initialWindowMetrics,
} from "react-native-safe-area-context";
import { Provider } from "react-redux";
import { roomActions } from "../redux/room/roomSlice";
import { restoreSession } from "../redux/auth/authSlice";
import { setUserId } from "../redux/app/appSlice";
import { store, useAppDispatch } from "../redux/store";
import useInit from "../service/useInit";
import AppErrorBoundary from "../components/ErrorBoundary";
import { DatabaseProvider } from "../context/DatabaseContext";
import PushTokenRegistrar from "../components/PushTokenRegistrar";
import * as SplashScreen from "expo-splash-screen";
import useMaintenance from "../service/useMaintanance";
import { getDeviceSettings } from "../service/translationUtils";
import { url } from "../context/SocketContext";

import * as Sentry from "@sentry/react-native";
import { GoogleOneTapSignIn } from "react-native-nitro-google-signin";
import { enableFreeze } from "react-native-screens";
import { allSettled } from "../utils/utilities";

GoogleOneTapSignIn.configure({
  webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID!,
});

enableFreeze(true);

if (!__DEV__)
  Sentry.init({
    dsn: "https://2ab39326e2ee096051c4b72e34eb98d1@o4507922596036608.ingest.de.sentry.io/4511676327395408",

    // Adds more context data to events (IP address, cookies, user, etc.)
    // For more information, visit: https://docs.sentry.io/platforms/react-native/data-management/data-collected/
    sendDefaultPii: true,

    // Enable Logs
    enableLogs: true,

    // Configure Session Replay
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1,
    integrations: [
      Sentry.mobileReplayIntegration(),
      // console.error/warn/etc → Sentry Logs (error-level events for silent failures)
      Sentry.consoleLoggingIntegration(),
    ],

    // uncomment the line below to enable Spotlight (https://spotlightjs.com)
    // spotlight: __DEV__,
  });

function RootLayout() {
  const { isLoaded, isUpdating } = useInit();

  return (
    <AppErrorBoundary>
      <SafeAreaProvider
        initialMetrics={initialWindowMetrics}
        style={{ flex: 1, backgroundColor: colors.appBackground }}
      >
        <ThemeProvider
          value={{
            ...DarkTheme,
            colors: { ...DarkTheme.colors, background: colors.appBackground },
          }}
        >
          <PortalProvider>
            <Provider store={store}>
              <DatabaseProvider>
                <PushTokenRegistrar />
                <RootNavigator isLoaded={isLoaded} isUpdating={isUpdating} />
              </DatabaseProvider>
            </Provider>
          </PortalProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </AppErrorBoundary>
  );
}

SplashScreen.preventAutoHideAsync();

function MaintenanceWatcher() {
  useMaintenance();
  return null;
}

const RootNavigator = ({
  isLoaded,
  isUpdating,
}: {
  isLoaded: boolean;
  isUpdating: boolean;
}) => {
  const dispatch = useAppDispatch();
  const [settingsLoaded, setSettingsLoaded] = useState(false);

  useEffect(() => {
    const initializeApp = async () => {
      if (!isLoaded || isUpdating) return;

      try {
        const [nickname, storedToken, userId] = await allSettled(
          Promise.allSettled([
            AsyncStorage.getItemAsync("nickname"),
            SecureStore.getItemAsync("user_auth_token"),
            AsyncStorage.getItemAsync("userId"),
          ]),
          null,
        );

        const finalUserId =
          userId ??
          (await fetch(url + "/auth/anonymous", { method: "POST" })
            .then((r) => r.json())
            .then((data) => data.anonymousId)
            .catch(() => null));

        if (finalUserId) {
          if (!userId) await AsyncStorage.setItemAsync("userId", finalUserId);
          dispatch(setUserId(finalUserId));
        }
        if (storedToken) dispatch(restoreSession(storedToken));

        const deviceSettings = getDeviceSettings();

        dispatch(
          roomActions.setSettings({
            nickname: nickname || deviceSettings.nickname,
            language: deviceSettings.language,
            regionalization: deviceSettings.regionalization,
          }),
        );
      } catch (error) {
        console.error("[RootNavigator] Error:", error);
      } finally {
        setSettingsLoaded(true);
      }
    };

    initializeApp();
  }, [isLoaded, isUpdating, dispatch]);

  useEffect(() => {
    if (isLoaded && settingsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [isLoaded, settingsLoaded]);

  if (!isLoaded || !settingsLoaded) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: colors.appBackground }}>
      <MaintenanceWatcher />
      <Stack
        initialRouteName="(tabs)"
        screenOptions={{
          headerShown: false,
          contentStyle: {
            backgroundColor: colors.appBackground,
          },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />

        <Stack.Screen name="room" options={{ headerShown: false }} />

        <Stack.Screen name="fortune" options={{ headerShown: false }} />

        <Stack.Screen
          name="qr-scanner"
          options={{ headerShown: false, presentation: "modal" }}
        />

        <Stack.Screen name="group" options={{ headerShown: false }} />

        <Stack.Screen name="games" options={{ headerShown: false }} />

        <Stack.Screen name="search-filters" options={{ headerShown: false }} />

        <Stack.Screen
          name="favourite-groups"
          options={{
            headerShown: false,
            gestureEnabled: true,
            presentation: "formSheet",
            sheetGrabberVisible: true,
            contentStyle: {
              backgroundColor:
                Platform.OS === "android" ? colors.surface : "transparent",
            },
            sheetAllowedDetents: [0.5, 0.85],
            sheetInitialDetentIndex: 0,
          }}
        />

        <Stack.Screen
          name="filters"
          options={{
            headerShown: false,
            gestureEnabled: true,
            presentation: "formSheet",
            sheetGrabberVisible: true,
            contentStyle: {
              backgroundColor:
                Platform.OS === "android" ? colors.surface : "transparent",
            },
            sheetAllowedDetents: [0.85, 1.0],
            sheetInitialDetentIndex: 0,
          }}
        />

        <Stack.Screen
          name="modal"
          options={{
            headerShown: false,
            gestureEnabled: false,
            presentation: "modal",
          }}
        />

        <Stack.Screen
          name="unviewed-matches"
          options={{
            headerShown: false,
            presentation: "formSheet",
            gestureEnabled: true,
            sheetGrabberVisible: false,
            contentStyle: {
              backgroundColor:
                Platform.OS === "android"
                  ? colors.surface
                  : "transparent",
            },
            sheetAllowedDetents: [0.7], // 70%
            sheetInitialDetentIndex: 0,
            sheetLargestUndimmedDetentIndex: 0,
          }}
        />

        <Stack.Screen
          name="auth"
          options={{
            headerShown: false,
            gestureEnabled: true,
            presentation: "formSheet",
            sheetGrabberVisible: true,
            contentStyle: { backgroundColor: "transparent" },
            sheetAllowedDetents: [0.6, 0.95],
            sheetInitialDetentIndex: 0,
          }}
        />

        <Stack.Screen
          name="rate-movie"
          options={{
            headerShown: false,
            gestureEnabled: true,
            presentation: "formSheet",
            sheetGrabberVisible: true,
            contentStyle: { backgroundColor: colors.background },
            sheetAllowedDetents: [0.5],
            sheetInitialDetentIndex: 0,
          }}
        />

      </Stack>
    </GestureHandlerRootView>
  );
};

export default Sentry.wrap(RootLayout);
