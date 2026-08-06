import { AsyncStorage } from "expo-sqlite/kv-store";
import * as SecureStore from "expo-secure-store";
import { Stack } from "expo-router";
import { ThemeProvider, DarkTheme } from "expo-router/react-navigation";
import { useEffect, useRef, useState } from "react";
import { Platform } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { MD2DarkTheme, PaperProvider } from "react-native-paper";
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
import * as SplashScreen from "expo-splash-screen";
import useMaintenance from "../service/useMaintanance";
import { getDeviceSettings } from "../service/useTranslation";

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
    integrations: [Sentry.mobileReplayIntegration()],

    // uncomment the line below to enable Spotlight (https://spotlightjs.com)
    // spotlight: __DEV__,
  });

const theme = MD2DarkTheme;

function RootLayout() {
  const { isLoaded, isUpdating } = useInit();

  return (
    <AppErrorBoundary>
      <SafeAreaProvider
        initialMetrics={initialWindowMetrics}
        style={{ flex: 1, backgroundColor: "#000" }}
      >
        <ThemeProvider
          value={{
            ...DarkTheme,
            colors: { ...DarkTheme.colors, background: "#000" },
          }}
        >
          <PaperProvider theme={theme}>
            <Provider store={store}>
              <DatabaseProvider>
                <RootNavigator isLoaded={isLoaded} isUpdating={isUpdating} />
              </DatabaseProvider>
            </Provider>
          </PaperProvider>
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

        if (userId) dispatch(setUserId(userId));
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
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: "#000" }}>
      <MaintenanceWatcher />
      <Stack
        initialRouteName="(tabs)"
        screenOptions={{
          headerShown: false,
          contentStyle: {
            backgroundColor: "#000",
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
                Platform.OS === "android" ? "#121212" : "transparent",
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
                Platform.OS === "android" ? "#121212" : "transparent",
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
      </Stack>
    </GestureHandlerRootView>
  );
};

export default Sentry.wrap(RootLayout);
