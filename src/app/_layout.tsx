import AsyncStorage from "@react-native-async-storage/async-storage";
import { Stack } from "expo-router";
import { useEffect, useState } from "react";
import { Image, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Button, MD2DarkTheme, PaperProvider, Text } from "react-native-paper";
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

  const [showLanguageSelector, setShowLanguageSelector] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [language, regionalization] = await Promise.all([AsyncStorage.getItem("language"), AsyncStorage.getItem("regionalization")]);

        if (!language) return setShowLanguageSelector(true);

        const nickname = (await AsyncStorage.getItem("nickname")) || (language === "en" ? "Guest" : "Gość");

        dispatch(roomActions.setSettings({ nickname, language, regionalization: JSON.parse(regionalization || "{}") || ({} as any) }));
      } catch (error) {
      } finally {
        setLoaded(true);
      }
    })();
    dispatch(loadFavorites());
  }, [showLanguageSelector]);

  const chooseLanguage = (language: string) => {
    return async () => {
      await AsyncStorage.setItem("language", language);
      dispatch(roomActions.setLanguage(language));
      setShowLanguageSelector(false);
    };
  };

  if (!loaded || !isLoaded || isUpdating) return <Fallback isUpdating={isUpdating} />;

  if (showLanguageSelector) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#000" }}>
        <View style={{ flexDirection: "row", gap: 10 }}>
          <Button onPress={chooseLanguage("en")}>English</Button>
          <Button onPress={chooseLanguage("pl")}>Polski</Button>
        </View>
      </View>
    );
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
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />

        <Stack.Screen name="room" options={{ headerShown: false }} />

        <Stack.Screen name="fortune" options={{ headerShown: false }} />

        <Stack.Screen name="settings" options={{ headerShown: false }} />

        <Stack.Screen name="group" options={{ headerShown: false }} />

        <Stack.Screen name="search-filters" options={{ headerShown: false }} />
      </Stack>
    </GestureHandlerRootView>
  );
};
