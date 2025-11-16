import AsyncStorage from "@react-native-async-storage/async-storage";
import { Stack, router } from "expo-router";
import { useEffect, useState } from "react";
import { Image, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { MD2DarkTheme, PaperProvider, Text } from "react-native-paper";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Provider } from "react-redux";
import { loadFavorites } from "../redux/favourites/favourites";
import { roomActions } from "../redux/room/roomSlice";
import { store, useAppDispatch } from "../redux/store";
import useInit from "../service/useInit";

const Fallback = ({ isUpdating }: { isUpdating?: boolean }) => (
  <View
    style={{
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "#000",
    }}
  >
    <Image source={require("../../assets/images/icon-light.png")} style={{ width: 200, height: 200, marginBottom: 20 }} />
    {isUpdating && <Text style={{ fontFamily: "Bebas", marginTop: 10, fontSize: 25 }}>App is updating, please wait...</Text>}
  </View>
);

const theme = MD2DarkTheme;

export default function RootLayout() {
  const { isLoaded, isUpdating } = useInit();

  return (
    <SafeAreaProvider style={{ flex: 1 }}>
      <Provider store={store}>
        <PaperProvider theme={theme}>
          <RootNavigator isLoaded={isLoaded} isUpdating={isUpdating} />
        </PaperProvider>
      </Provider>
    </SafeAreaProvider>
  );
}

const RootNavigator = ({ isLoaded, isUpdating }: { isLoaded: boolean; isUpdating: boolean }) => {
  const dispatch = useAppDispatch();

  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [language, regionalization, nickname] = await Promise.all([
          AsyncStorage.getItem("language"),
          AsyncStorage.getItem("regionalization"),
          AsyncStorage.getItem("nickname"),
        ]);

        // Check if this is first launch (no language set)
        if (!language) {
          // Redirect to onboarding
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
      } catch (error) {
      } finally {
        setLoaded(true);
      }
    })();
    dispatch(loadFavorites());
  }, []);

  if (!loaded || !isLoaded || isUpdating) return <Fallback isUpdating={isUpdating} />;

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: "#000" }}>
      <Stack
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

        <Stack.Screen name="settings" options={{ headerShown: false }} />

        <Stack.Screen name="group" options={{ headerShown: false }} />

        <Stack.Screen name="onboarding" options={{ headerShown: false }} />
      </Stack>
    </GestureHandlerRootView>
  );
};
