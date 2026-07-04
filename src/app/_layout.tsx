import { AsyncStorage } from "expo-sqlite/kv-store";
import * as SecureStore from "expo-secure-store";
import { Stack } from "expo-router";
import { useEffect, useState } from "react";
import { Platform } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { MD2DarkTheme, PaperProvider } from "react-native-paper";
import {
  SafeAreaProvider,
  initialWindowMetrics,
} from "react-native-safe-area-context";
import { Provider } from "react-redux";
import { roomActions } from "../redux/room/roomSlice";
import { store, useAppDispatch } from "../redux/store";
import useInit from "../service/useInit";
import AppErrorBoundary from "../components/ErrorBoundary";
import { STORAGE_KEY } from "../redux/favourites/favourites";
import {
  DatabaseProvider,
  useMovieInteractions,
} from "../context/DatabaseContext";
import { loadInteractions } from "../redux/movieInteractions/movieInteractionsSlice";
import { loadFilterPreferences } from "../redux/filterPreferences/filterPreferencesSlice";
import * as SplashScreen from "expo-splash-screen";
import * as QuickActions from "expo-quick-actions";
import useMaintenance from "../service/useMaintanance";
import { getDeviceSettings } from "../service/useTranslation";

import * as Sentry from "@sentry/react-native";

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

const MIGRATION_FLAG = "securestore_to_kv_migration_complete";

const KEYS_TO_MIGRATE = [
  "nickname",
  "userId",
  STORAGE_KEY,
  "app_review_requested",
  "games_played_count",
  "voterSessionId",
  "room_builder_preferences",
];

async function migrateFromSecureStoreToKVStore() {
  try {
    const isMigrated = await AsyncStorage.getItem(MIGRATION_FLAG);
    if (isMigrated === "true") return;

    console.log("[Migration] Starting SecureStore to KVStore migration...");

    const [kvStoreValues, secureStoreValues] = await Promise.all([
      Promise.all(KEYS_TO_MIGRATE.map((key) => AsyncStorage.getItem(key))),
      Promise.all(KEYS_TO_MIGRATE.map((key) => SecureStore.getItemAsync(key))),
    ]);

    const migrateOperations: Promise<void>[] = [];

    KEYS_TO_MIGRATE.forEach((key, index) => {
      const kvValue = kvStoreValues[index];
      const secureValue = secureStoreValues[index];

      if (secureValue && !kvValue) {
        console.log(`[Migration] Migrating key: ${key}`);
        migrateOperations.push(AsyncStorage.setItem(key, secureValue));
      }
    });

    if (migrateOperations.length > 0) {
      await Promise.all(migrateOperations);
      console.log(`[Migration] Migrated ${migrateOperations.length} keys`);
    } else {
      console.log("[Migration] No keys to migrate");
    }

    await AsyncStorage.setItem(MIGRATION_FLAG, "true");
    console.log("[Migration] Migration complete");
  } catch (error) {
    console.error("[Migration] Error during migration:", error);
  }
}

function RootLayout() {
  const { isLoaded, isUpdating } = useInit();
  const [migrationComplete, setMigrationComplete] = useState(false);

  useEffect(() => {
    migrateFromSecureStoreToKVStore().finally(() => {
      setMigrationComplete(true);
    });
  }, []);

  return (
    <AppErrorBoundary>
      <SafeAreaProvider
        initialMetrics={initialWindowMetrics}
        style={{ flex: 1, backgroundColor: "#000" }}
      >
        <Provider store={store}>
          <DatabaseProvider>
            <PaperProvider theme={theme}>
              <RootNavigator
                isLoaded={isLoaded && migrationComplete}
                isUpdating={isUpdating}
              />
            </PaperProvider>
          </DatabaseProvider>
        </Provider>
      </SafeAreaProvider>
    </AppErrorBoundary>
  );
}

SplashScreen.preventAutoHideAsync();

const RootNavigator = ({
  isLoaded,
  isUpdating,
}: {
  isLoaded: boolean;
  isUpdating: boolean;
}) => {
  const dispatch = useAppDispatch();
  const [settingsLoaded, setSettingsLoaded] = useState(false);
  const [needsOnboarding, setNeedsOnboarding] = useState<boolean | null>(null);
  const { movieInteractions, isReady: dbReady } = useMovieInteractions();

  useMaintenance();

  useEffect(() => {
    const initializeApp = async () => {
      if (!isLoaded || isUpdating) return;

      if (!dbReady || !movieInteractions) {
        return;
      }

      try {
        const [nickname] = await Promise.all([
          AsyncStorage.getItem("nickname"),
          dispatch(loadInteractions(movieInteractions)),
          dispatch(loadFilterPreferences()),
        ]);

        const deviceSettings = getDeviceSettings();
        const isFirstTimeUser = !nickname;

        dispatch(
          roomActions.setSettings({
            nickname: nickname || deviceSettings.nickname,
            language: deviceSettings.language,
            regionalization: deviceSettings.regionalization,
          }),
        );

        setNeedsOnboarding(isFirstTimeUser);
      } catch (error) {
        console.error("[RootNavigator] Error:", error);
        setNeedsOnboarding(false);
      } finally {
        setSettingsLoaded(true);

        await SplashScreen.hideAsync();
      }
    };

    initializeApp();
  }, [isLoaded, isUpdating, dbReady, movieInteractions, dispatch]);

  useEffect(() => {
    if (Platform.OS !== "ios") return;
    QuickActions.setItems([
      {
        id: "uninstall",
        title: "Thanks for trying us!",
        subtitle: "We'd love to have you back",
        icon: "symbol:hand.wave",
      },
    ]);
  }, []);

  if (!isLoaded || !settingsLoaded) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: "#000" }}>
      <Stack
        initialRouteName={needsOnboarding ? "onboarding" : "(tabs)"}
        screenOptions={{
          headerShown: false,
          contentStyle: {
            backgroundColor: "#000",
          },
        }}
      >
        <Stack.Protected guard={needsOnboarding === true}>
          <Stack.Screen name="onboarding" options={{ headerShown: false }} />
        </Stack.Protected>
        <Stack.Protected guard={!needsOnboarding}>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />

          <Stack.Screen name="room" options={{ headerShown: false }} />

          <Stack.Screen name="fortune" options={{ headerShown: false }} />

          <Stack.Screen
            name="qr-scanner"
            options={{ headerShown: false, presentation: "modal" }}
          />

          <Stack.Screen name="group" options={{ headerShown: false }} />

          <Stack.Screen
            name="search-filters"
            options={{ headerShown: false }}
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
                    ? MD2DarkTheme.colors.surface
                    : "transparent",
              },
              sheetAllowedDetents: [0.7], // 70%
              sheetInitialDetentIndex: 0,
              sheetLargestUndimmedDetentIndex: 0,
            }}
          />
        </Stack.Protected>
      </Stack>
    </GestureHandlerRootView>
  );
};

export default Sentry.wrap(RootLayout);
