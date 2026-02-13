import { AsyncStorage } from "expo-sqlite/kv-store";
import * as SecureStore from "expo-secure-store";
import * as Localization from "expo-localization";
import { Stack } from "expo-router";
import { useEffect, useState } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { MD2DarkTheme, PaperProvider } from "react-native-paper";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Provider } from "react-redux";
import { roomActions } from "../redux/room/roomSlice";
import { store, useAppDispatch } from "../redux/store";
import useInit from "../service/useInit";
import AppErrorBoundary from "../components/ErrorBoundary";
import { STORAGE_KEY } from "../redux/favourites/favourites";
import { DatabaseProvider } from "../context/DatabaseContext";

function getDeviceSettings() {
  const locales = Localization.getLocales();
  const calendars = Localization.getCalendars();
  const deviceLocale = locales[0];
  const deviceCalendar = calendars[0];

  const language = deviceLocale?.languageCode === "pl" ? "pl" : "en";
  const regionCode = deviceLocale?.regionCode || "US";

  return {
    language,
    nickname: language === "pl" ? "Gość" : "Guest",
    regionalization: {
      "x-user-region": regionCode || "US",
      "x-user-watch-provider": regionCode || "US",
      "x-user-watch-region": regionCode || "US",
      "x-user-timezone": deviceCalendar?.timeZone || "America/New_York",
    },
  };
}

import { Image } from "expo-image";

Image.clearDiskCache();
Image.clearMemoryCache();

import * as QuickActions from "expo-quick-actions";
import OnboardingScreen from "./onboarding";

const theme = MD2DarkTheme;

const MIGRATION_FLAG = "securestore_to_kv_migration_complete";

const KEYS_TO_MIGRATE = [
  "language",
  "regionalization",
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

      // Only migrate if SecureStore has value and KVStore doesn't
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

export default function RootLayout() {
  const { isLoaded, isUpdating } = useInit();
  const [migrationComplete, setMigrationComplete] = useState(false);

  useEffect(() => {
    migrateFromSecureStoreToKVStore().finally(() => {
      setMigrationComplete(true);
    });
  }, []);

  return (
    <AppErrorBoundary>
      <SafeAreaProvider style={{ flex: 1, backgroundColor: "#000" }}>
        <Provider store={store}>
          <DatabaseProvider>
            <PaperProvider theme={theme}>
              <RootNavigator isLoaded={isLoaded && migrationComplete} isUpdating={isUpdating} />
            </PaperProvider>
          </DatabaseProvider>
        </Provider>
      </SafeAreaProvider>
    </AppErrorBoundary>
  );
}

const RootNavigator = ({ isLoaded, isUpdating }: { isLoaded: boolean; isUpdating: boolean }) => {
  const dispatch = useAppDispatch();
  const [settingsLoaded, setSettingsLoaded] = useState(false);
  const [needsOnboarding, setNeedsOnboarding] = useState<boolean | null>(null);

  useEffect(() => {
    const initializeApp = async () => {
      if (!isLoaded || isUpdating) return;

      try {
        let [language, regionalization, nickname] = await Promise.all([
          AsyncStorage.getItem("language"),
          AsyncStorage.getItem("regionalization"),
          AsyncStorage.getItem("nickname"),
        ]);

        const isFirstTimeUser = !language;

        if (!language) {
          const deviceSettings = getDeviceSettings();
          language = deviceSettings.language;
          nickname = deviceSettings.nickname;
          regionalization = JSON.stringify(deviceSettings.regionalization);
        }

        const finalNickname = nickname || (language === "en" ? "Guest" : "Gość");

        dispatch(
          roomActions.setSettings({
            nickname: finalNickname,
            language,
            regionalization: JSON.parse(regionalization || "{}") || ({} as any),
          }),
        );

        setNeedsOnboarding(isFirstTimeUser);
      } catch (error) {
        console.error("[RootNavigator] Error:", error);
        setNeedsOnboarding(false);
      } finally {
        setSettingsLoaded(true);
      }
    };

    initializeApp();
  }, [isLoaded, isUpdating, dispatch]);

  useEffect(() => {
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

  if (needsOnboarding) {
    return (
      <OnboardingScreen
        onClose={() => {
          setNeedsOnboarding(false);
        }}
      />
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: "#000" }}>
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

        <Stack.Screen name="qr-scanner" options={{ headerShown: false, presentation: "modal" }} />

        <Stack.Screen name="group" options={{ headerShown: false }} />

        <Stack.Screen name="onboarding" options={{ headerShown: false }} />

        <Stack.Screen name="search-filters" options={{ headerShown: false }} />
      </Stack>
    </GestureHandlerRootView>
  );
};
