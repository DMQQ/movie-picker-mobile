import AsyncStorage from "@react-native-async-storage/async-storage";
import { Stack, router } from "expo-router";
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
import { Platform, View } from "react-native";
import { storage } from "../utils/storage";
import WebDownloadModal from "../components/WebDownloadModal";

import { Image } from "expo-image";

Image.clearDiskCache();
Image.clearMemoryCache();

import * as QuickActions from "expo-quick-actions";

const theme = MD2DarkTheme;

const migrationFlag = "migration_complete";

const isMigrated = Platform.OS === "web" || storage.getItem(migrationFlag) === "true";

async function migrateToSecureStore() {
  try {
    if (Platform.OS === "web" || isMigrated) return;

    const keysToMigrate = ["language", "regionalization", "nickname", "userId", STORAGE_KEY];

    const [secureStoreValues, asyncStorageValues] = await Promise.all([
      Promise.all(keysToMigrate.map((key) => storage.getItemAsync(key))),
      Promise.all(keysToMigrate.map((key) => AsyncStorage.getItem(key))),
    ]);

    const migrateOperations: Promise<void>[] = [];
    const cleanupOperations: Promise<void>[] = [];

    keysToMigrate.forEach((key, index) => {
      const secureValue = secureStoreValues[index];
      const asyncValue = asyncStorageValues[index];

      if (asyncValue && !secureValue) {
        migrateOperations.push(storage.setItemAsync(key, asyncValue));
        cleanupOperations.push(AsyncStorage.removeItem(key));
      }
    });

    if (migrateOperations.length > 0) {
      await Promise.all([...migrateOperations, ...cleanupOperations]);
    }

    await storage.setItemAsync("migration_complete", "true");
  } catch (error) {}
}

export default function RootLayout() {
  const { isLoaded, isUpdating } = useInit();
  const [migrationComplete, setMigrationComplete] = useState(false);

  useEffect(() => {
    migrateToSecureStore().then(() => {
      setMigrationComplete(true);
    });
  }, []);

  if (!migrationComplete) {
    return <View style={{ flex: 1, backgroundColor: "#000" }} />;
  }

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
        const [language, regionalization, nickname] = await Promise.all([
          storage.getItemAsync("language"),
          storage.getItemAsync("regionalization"),
          storage.getItemAsync("nickname"),
        ]);

        if (!language) {
          if (Platform.OS === "web") {
            // Skip onboarding on web, use English defaults
            const defaultRegionalization = {
              "x-user-region": "US",
              "x-user-watch-provider": "US",
              "x-user-watch-region": "US",
              "x-user-timezone": "America/New_York",
            };
            await Promise.all([
              storage.setItemAsync("language", "en"),
              storage.setItemAsync("nickname", "Guest"),
              storage.setItemAsync("regionalization", JSON.stringify(defaultRegionalization)),
            ]);
            dispatch(
              roomActions.setSettings({
                nickname: "Guest",
                language: "en",
                regionalization: defaultRegionalization,
              })
            );
          } else {
            router.replace("/onboarding");
            return;
          }
        } else {
          const finalNickname = nickname || (language === "en" ? "Guest" : "Gość");

          dispatch(
            roomActions.setSettings({
              nickname: finalNickname,
              language,
              regionalization: JSON.parse(regionalization || "{}") || ({} as any),
            })
          );
        }
      } catch (error) {
        console.error("Error during app initialization:", error);
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
      <WebDownloadModal />
    </GestureHandlerRootView>
  );
};
