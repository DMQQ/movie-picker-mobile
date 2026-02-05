import * as SecureStore from "expo-secure-store";
import * as Localization from "expo-localization";
import AsyncStorage from "@react-native-async-storage/async-storage";
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
import { View } from "react-native";

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

const theme = MD2DarkTheme;

const migrationFlag = "migration_complete";

const isMigrated = SecureStore.getItem(migrationFlag) === "true";

async function migrateToSecureStore() {
  try {
    if (isMigrated) return;

    const keysToMigrate = ["language", "regionalization", "nickname", "userId", STORAGE_KEY];

    const [secureStoreValues, asyncStorageValues] = await Promise.all([
      Promise.all(keysToMigrate.map((key) => SecureStore.getItemAsync(key))),
      Promise.all(keysToMigrate.map((key) => AsyncStorage.getItem(key))),
    ]);

    const migrateOperations: Promise<void>[] = [];
    const cleanupOperations: Promise<void>[] = [];

    keysToMigrate.forEach((key, index) => {
      const secureValue = secureStoreValues[index];
      const asyncValue = asyncStorageValues[index];

      if (asyncValue && !secureValue) {
        migrateOperations.push(SecureStore.setItemAsync(key, asyncValue));
        cleanupOperations.push(AsyncStorage.removeItem(key));
      }
    });

    if (migrateOperations.length > 0) {
      await Promise.all([...migrateOperations, ...cleanupOperations]);
    }

    await SecureStore.setItemAsync("migration_complete", "true");
  } catch (error) {}
}

export default function RootLayout() {
  const { isLoaded, isUpdating } = useInit();

  useEffect(() => {
    migrateToSecureStore();
  }, []);

  return (
    <AppErrorBoundary>
      <SafeAreaProvider style={{ flex: 1, backgroundColor: "#000" }}>
        <Provider store={store}>
          <PaperProvider theme={theme}>
            <RootNavigator isLoaded={isLoaded} isUpdating={isUpdating} />
          </PaperProvider>
        </Provider>
      </SafeAreaProvider>
    </AppErrorBoundary>
  );
}

const RootNavigator = ({ isLoaded, isUpdating }: { isLoaded: boolean; isUpdating: boolean }) => {
  const dispatch = useAppDispatch();
  const [settingsLoaded, setSettingsLoaded] = useState(false);

  useEffect(() => {
    const initializeApp = async () => {
      if (!isLoaded || isUpdating) return;

      try {
        let [language, regionalization, nickname] = await Promise.all([
          SecureStore.getItemAsync("language"),
          SecureStore.getItemAsync("regionalization"),
          SecureStore.getItemAsync("nickname"),
        ]);

        if (!language) {
          const deviceSettings = getDeviceSettings();
          language = deviceSettings.language;
          nickname = deviceSettings.nickname;
          regionalization = JSON.stringify(deviceSettings.regionalization);

          await Promise.all([
            SecureStore.setItemAsync("language", language),
            SecureStore.setItemAsync("nickname", nickname),
            SecureStore.setItemAsync("regionalization", regionalization),
          ]);
        }

        const finalNickname = nickname || (language === "en" ? "Guest" : "Gość");

        dispatch(
          roomActions.setSettings({
            nickname: finalNickname,
            language,
            regionalization: JSON.parse(regionalization || "{}") || ({} as any),
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
    QuickActions.setItems([
      {
        id: "uninstall",
        title: "Thanks for trying us!",
        subtitle: "We'd love to have you back",
        icon: "symbol:hand.wave",
      },
    ]);
  }, []);

  if (!settingsLoaded) {
    return <View style={{ flex: 1, backgroundColor: "#000" }} />;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: "#000" }}>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: {
            backgroundColor: "#000",
          },
        }}
        initialRouteName={"(tabs)"}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />

        <Stack.Screen name="room" options={{ headerShown: false }} />

        <Stack.Screen name="fortune" options={{ headerShown: false }} />

        <Stack.Screen name="settings" options={{ headerShown: false }} />

        <Stack.Screen name="group" options={{ headerShown: false }} />

        <Stack.Screen name="onboarding" options={{ headerShown: false }} />

        <Stack.Screen name="search-filters" options={{ headerShown: false }} />
      </Stack>
    </GestureHandlerRootView>
  );
};
