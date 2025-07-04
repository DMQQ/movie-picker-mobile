import "react-native-reanimated";

import { Button, MD2DarkTheme, PaperProvider } from "react-native-paper";
import { DarkTheme, NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Landing from "./src/screens/Landing";
import QRCode from "./src/screens/Room/Main";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Provider } from "react-redux";
import { store, useAppDispatch } from "./src/redux/store";
import Overview from "./src/screens/Overview";
import { Alert, Linking, Platform, StatusBar, View } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import MovieDetails from "./src/screens/MovieDetails";
import { RootStackParamList } from "./src/screens/types";
import SettingsScreen from "./src/screens/Settings";
import { useEffect, useState } from "react";
import { loadAsync } from "expo-font";
import FortuneWheel, { SectionSelector } from "./src/screens/FortuneWheel";
import { FancySpinner } from "./src/components/FancySpinner";
import Favourites from "./src/screens/Favourites";
import { loadFavorites } from "./src/redux/favourites/favourites";
import { roomActions } from "./src/redux/room/roomSlice";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Group from "./src/screens/Group";
import Main from "./src/screens/Voter/Main";
import GameList from "./src/screens/GameList";
import Search from "./src/screens/Search";

const Stack = createNativeStackNavigator<RootStackParamList>();

import { LinkingOptions } from "@react-navigation/native";
import SearchFilters from "./src/screens/SearchFilters";

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

const Fallback = () => (
  <View
    style={{
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "#000",
    }}
  >
    <FancySpinner size={100} />
  </View>
);

const theme = MD2DarkTheme;

export default function App() {
  const [isLoaded, setIsLoaded] = useState(false);
  useEffect(() => {
    loadAsync({
      Bebas: require("./assets/fonts/BebasNeue-Regular.ttf"),
    }).then(() => {
      setIsLoaded(true);
    });
  }, []);

  if (!isLoaded) return <Fallback />;

  return (
    <SafeAreaProvider style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1, backgroundColor: "#000" }}>
        <Provider store={store}>
          <PaperProvider theme={theme}>
            <Navigator />
          </PaperProvider>
        </Provider>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const Navigator = () => {
  const dispatch = useAppDispatch();

  const [loaded, setLoaded] = useState(false);

  const [showLanguageSelector, setShowLanguageSelector] = useState(false);

  useEffect(() => {
    // Handle deep links when app is already open
    const subscription = Linking.addEventListener("url", handleDeepLink);

    // Handle deep link that launched the app
    (async () => {
      const initialUrl = await Linking.getInitialURL();
      if (initialUrl) {
        handleDeepLink({ url: initialUrl });
      }
    })();

    return () => {
      subscription.remove();
    };
  }, []);

  const handleDeepLink = ({ url }: { url: string }) => {};

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

  if (!loaded) return <Fallback />;

  if (showLanguageSelector) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#000" }}>
        <View style={{ flexDirection: "row", gap: 10 }}>
          <Button
            onPress={async () => {
              await AsyncStorage.setItem("language", "en");
              dispatch(roomActions.setLanguage("en"));
              setShowLanguageSelector(false);
            }}
          >
            English
          </Button>
          <Button
            onPress={async () => {
              await AsyncStorage.setItem("language", "pl");
              dispatch(roomActions.setLanguage("pl"));
              setShowLanguageSelector(false);
            }}
          >
            Polski
          </Button>
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
          <Stack.Screen name="Settings" component={SettingsScreen} />

          <Stack.Screen name="Landing" component={Landing} />
          <Stack.Screen name="QRCode" component={QRCode} />

          <Stack.Screen
            name="Overview"
            component={Overview}
            options={{
              headerShown: false,
              title: "",
              presentation: "modal",
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
              presentation: "modal",
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
            }}
          />
          <Stack.Screen name="SearchFilters" component={SearchFilters} options={{ headerShown: false }} />
        </Stack.Navigator>
      </GestureHandlerRootView>
    </NavigationContainer>
  );
};
