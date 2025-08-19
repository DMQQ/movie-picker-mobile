import AsyncStorage from "@react-native-async-storage/async-storage";
import { DarkTheme, NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useEffect, useState } from "react";
import { Platform, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Button, MD2DarkTheme, PaperProvider, Text } from "react-native-paper";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Provider } from "react-redux";
import { loadFavorites } from "./src/redux/favourites/favourites";
import { roomActions } from "./src/redux/room/roomSlice";
import { store, useAppDispatch } from "./src/redux/store";
import Favourites from "./src/screens/Favourites";
import FortuneWheel from "./src/screens/FortuneWheel";
import GameList from "./src/screens/GameList";
import Group from "./src/screens/Group";
import Landing from "./src/screens/Landing";
import MovieDetails from "./src/screens/MovieDetails";
import Overview from "./src/screens/Overview";
import RegionSelectorScreen from "./src/screens/RegionSelector";
import QRCode from "./src/screens/Room/Main";
import Search from "./src/screens/Search";
import SettingsScreen from "./src/screens/Settings";
import { RootStackParamList } from "./src/screens/types";
import Main from "./src/screens/Voter/Main";

const Stack = createNativeStackNavigator<RootStackParamList>();

import { LinkingOptions } from "@react-navigation/native";
import { Image } from "react-native";
import SearchFilters from "./src/screens/SearchFilters";
import useInit from "./src/service/useInit";

const linking: LinkingOptions<RootStackParamList> = {
  prefixes: ["flickmate://", "https://movie.dmqq.dev"],
  config: {
    screens: {
      Voter: {
        screens: {
          Home: "voter/:sessionId",
        },
      },

      QRCode: {
        screens: {
          Home: "swipe/:roomId",
        },
      },

      MovieDetails: {
        path: "movie/:type/:id",
        parse: {
          id: (movieId: string) => movieId,
          type: (type: string) => type,
        },
      },
    },
  },
};

const Fallback = ({ isUpdating }: { isUpdating?: boolean }) => (
  <View
    style={{
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "#000",
    }}
  >
    <Image source={require("./assets/images/icon-light.png")} style={{ width: 200, height: 200, marginBottom: 20 }} />
    {isUpdating && <Text style={{ fontFamily: "Bebas", marginTop: 10, fontSize: 25 }}>App is updating, please wait...</Text>}
  </View>
);

const theme = MD2DarkTheme;

export default function App() {
  const { isLoaded, isUpdating } = useInit();

  return (
    <SafeAreaProvider style={{ flex: 1 }}>
      <Provider store={store}>
        <PaperProvider theme={theme}>
          <Navigator isLoaded={isLoaded} isUpdating={isUpdating} />
        </PaperProvider>
      </Provider>
    </SafeAreaProvider>
  );
}

const Navigator = ({ isLoaded, isUpdating }: { isLoaded: boolean; isUpdating: boolean }) => {
  const dispatch = useAppDispatch();

  const [loaded, setLoaded] = useState(false);

  const [showLanguageSelector, setShowLanguageSelector] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [language, regionalization] = await Promise.all([AsyncStorage.getItem("language"), AsyncStorage.getItem("regionalization")]);

        if (!language) return setShowLanguageSelector(true);

        const nickname = (await AsyncStorage.getItem("nickname")) || language === "en" ? "Guest" : "Gość";

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
    <NavigationContainer theme={DarkTheme} fallback={<Fallback />} linking={linking}>
      <GestureHandlerRootView style={{ flex: 1, backgroundColor: "#000" }}>
        <Stack.Navigator
          initialRouteName="Landing"
          screenOptions={{
            headerShown: false,

            ...(Platform.OS === "android" && {
              animation: "simple_push",
            }),
          }}
        >
          <Stack.Screen
            name="Settings"
            component={SettingsScreen}
            options={{
              ...(Platform.OS === "ios" && { presentation: "transparentModal", animation: "fade", gestureEnabled: true }),
            }}
          />

          <Stack.Screen
            name="RegionSelector"
            component={RegionSelectorScreen}
            options={{
              headerShown: false,
              ...(Platform.OS === "ios" && { presentation: "transparentModal", animation: "fade", gestureEnabled: true }),
            }}
          />

          <Stack.Screen name="Landing" component={Landing} />
          <Stack.Screen name="QRCode" component={QRCode} />

          <Stack.Screen
            name="Overview"
            component={Overview}
            options={{
              title: Platform.OS === "ios" ? "" : "Overview",
              headerTitleAlign: "center",
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="MovieDetails"
            component={MovieDetails}
            options={{
              headerTransparent: true,
              headerTitleAlign: "center",
              headerTitle: "",
              title: "",
              // presentation: "modal",
              ...(Platform.OS === "android" && { animation: "fade_from_bottom" }),
            }}
            initialParams={{
              id: 0,
              type: "movie",
              img: "",
            }}
          />
          <Stack.Screen
            name="Fortune"
            component={FortuneWheel}
            options={{
              headerShown: false,
              title: "",
            }}
          />
          <Stack.Screen
            name="Favourites"
            component={Favourites}
            options={{
              headerShown: false,
              title: "",
            }}
          />

          <Stack.Screen
            name="Group"
            component={Group}
            options={{
              headerShown: false,
              title: "",
            }}
          />

          <Stack.Screen
            name="Voter"
            component={Main}
            options={{
              headerShown: false,
              title: "",
            }}
          />

          <Stack.Screen
            name="Games"
            component={GameList}
            options={{
              headerShown: false,
            }}
          />

          <Stack.Screen
            name="Search"
            component={Search}
            options={{
              headerShown: false,
              ...(Platform.OS === "ios" && { presentation: "transparentModal", animation: "fade", gestureEnabled: true }),
            }}
          />
          <Stack.Screen
            name="SearchFilters"
            component={SearchFilters}
            options={{
              headerShown: false,
              ...(Platform.OS === "ios" && { presentation: "transparentModal", animation: "fade", gestureEnabled: true }),
            }}
          />
        </Stack.Navigator>
      </GestureHandlerRootView>
    </NavigationContainer>
  );
};
