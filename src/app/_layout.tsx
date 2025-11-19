import * as SecureStore from "expo-secure-store";
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
  const [migrationComplete, setMigrationComplete] = useState(false);

  useEffect(() => {
    migrateToSecureStore().then(() => {
      setMigrationComplete(true);
    });
  }, []);

  if (!migrationComplete) {
    return null;
  }

  return (
    <AppErrorBoundary>
      <SafeAreaProvider style={{ flex: 1 }}>
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
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const initializeApp = async () => {
      if (!isLoaded || isUpdating) return;

      try {
        const [language, regionalization, nickname] = await Promise.all([
          SecureStore.getItemAsync("language"),
          SecureStore.getItemAsync("regionalization"),
          SecureStore.getItemAsync("nickname"),
        ]);

        if (!language) {
          setLoaded(true);
          router.replace("/onboarding");
          return;
        }

        const finalNickname = nickname || (language === "en" ? "Guest" : "Gość");

        dispatch(
          roomActions.setSettings({
            nickname: finalNickname,
            language,
            regionalization: JSON.parse(regionalization || "{}") || ({} as any),
          })
        );

        setLoaded(true);
        router.replace("/(tabs)");
      } catch (error) {
        console.error("Error during app initialization:", error);
        setLoaded(true);
        router.replace("/(tabs)");
      }
    };

    initializeApp();
  }, [isLoaded, isUpdating, dispatch]);

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: "#000" }}>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: {
            backgroundColor: "#000",
          },
        }}
        initialRouteName={!loaded || !isLoaded || isUpdating ? "loading" : "(tabs)"}
      >
        <Stack.Screen name="loading" options={{ headerShown: false }} />

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
