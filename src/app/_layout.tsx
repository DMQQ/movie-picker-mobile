import { AsyncStorage } from "expo-sqlite/kv-store";
import * as SecureStore from "expo-secure-store";
import { Stack, router } from "expo-router";
import { ThemeProvider, DarkTheme } from "expo-router/react-navigation";
import { useEffect, useRef, useState } from "react";
import { Platform, Alert } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import InviteToastWatcher from "../components/InviteToastWatcher";
import { PortalProvider } from "../components/Portal";
import { ToastContainer } from "../components/Toast";
import { colors } from "../constants/design";
import {
  SafeAreaProvider,
  initialWindowMetrics,
} from "react-native-safe-area-context";
import { Provider } from "react-redux";
import { roomActions } from "../redux/room/roomSlice";
import { restoreSession, authActions, ensureAnonymousSession } from "../redux/auth/authSlice";
import { store, useAppDispatch, useAppSelector } from "../redux/store";
import useInit from "../service/useInit";
import AppErrorBoundary from "../components/ErrorBoundary";
import { DatabaseProvider } from "../context/DatabaseContext";
import ScreenTracker from "../components/ScreenTracker";
import PushTokenRegistrar from "../components/PushTokenRegistrar";
import NotificationHandler from "../components/NotificationHandler";
import SessionExpiredWatcher from "../components/SessionExpiredWatcher";
import * as SplashScreen from "expo-splash-screen";
import useMaintenance from "../service/useMaintanance";
import { getDeviceSettings } from "../service/translationUtils";
import useTranslation from "../service/useTranslation";

import { GoogleOneTapSignIn } from "react-native-nitro-google-signin";
import { enableFreeze } from "react-native-screens";
import { PostHogProvider } from "posthog-react-native";
import { allSettled } from "../utils/utilities";
import envs from "../constants/envs";
import { posthog } from "../constants/posthog";

GoogleOneTapSignIn.configure({
  webClientId: envs.google_web_client_id!,
});

enableFreeze(true);

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
                {posthog ? (
                  <PostHogProvider
                    client={posthog}
                    autocapture={{ captureTouches: true, captureScreens: false }}
                  >
                    <AppContent isLoaded={isLoaded} isUpdating={isUpdating} />
                  </PostHogProvider>
                ) : (
                  <AppContent isLoaded={isLoaded} isUpdating={isUpdating} />
                )}
              </DatabaseProvider>
            </Provider>
          </PortalProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </AppErrorBoundary>
  );
}

SplashScreen.preventAutoHideAsync();

function AppContent({ isLoaded, isUpdating }: { isLoaded: boolean; isUpdating: boolean }) {
  return (
    <>
      <ScreenTracker />
      <PushTokenRegistrar />
      <NotificationHandler />
      <InviteToastWatcher />
      <SessionExpiredWatcher />
      <ToastContainer />
      <AnonymousBlockedWatcher />
      <RootNavigator isLoaded={isLoaded} isUpdating={isUpdating} />
    </>
  );
}

function MaintenanceWatcher() {
  useMaintenance();
  return null;
}

function AnonymousBlockedWatcher() {
  const dispatch = useAppDispatch();
  const anonymousBlocked = useAppSelector((state) => state.auth.anonymousBlocked);
  const t = useTranslation();

  useEffect(() => {
    if (!anonymousBlocked) return;
    posthog?.capture("account_required_shown");
    Alert.alert(
      t("account.required.title"),
      t("account.required.message"),
      [
        {
          text: t("account.required.notNow"),
          style: "cancel",
          onPress: () => {
            posthog?.capture("account_required_action", { choice: "not_now" });
          },
        },
        {
          text: t("auth.createAccount"),
          onPress: () => {
            posthog?.capture("account_required_action", {
              choice: "create_account",
            });
            router.push({ pathname: "/auth/register", params: { presentation: "formSheet" } });
          },
        },
      ],
    );
    dispatch(authActions.clearAnonymousBlocked());
  }, [anonymousBlocked]);

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
        const [nickname, storedToken, storedRefreshToken, userId] = await allSettled(
          Promise.allSettled([
            AsyncStorage.getItemAsync("nickname"),
            SecureStore.getItemAsync("user_auth_token"),
            SecureStore.getItemAsync("user_refresh_token"),
            AsyncStorage.getItemAsync("userId"),
          ]),
          null,
        );

        const anonymousResult = await dispatch(
          ensureAnonymousSession({ userId, refreshToken: storedRefreshToken }),
        )
          .unwrap()
          .catch(() => null);

        if (storedToken) {
          await dispatch(restoreSession({ token: storedToken, refreshToken: storedRefreshToken }));
        } else if (anonymousResult?.token) {
          dispatch(authActions.setCredentials({
            token: anonymousResult.token,
            refreshToken: anonymousResult.refreshToken,
            user: anonymousResult.user,
          }));
        }

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
        dispatch(authActions.setRestored());
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

        <Stack.Screen name="person" options={{ headerShown: false }} />


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

export default RootLayout;
