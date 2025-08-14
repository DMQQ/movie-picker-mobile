import AsyncStorage from "@react-native-async-storage/async-storage";
import { DarkTheme, NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { loadAsync } from "expo-font";
import * as Updates from "expo-updates";
import { useEffect, useState } from "react";
import { Platform, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Button, MD2DarkTheme, PaperProvider } from "react-native-paper";
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
    {/* <FancySpinner size={100} /> */}
    <Image source={require("./assets/images/icon-light.png")} style={{ width: 200, height: 200, marginBottom: 20 }} />
  </View>
);

const theme = MD2DarkTheme;

export default function App() {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        console.log("🚀 App initialization started");
        console.log("📱 Environment - DEV mode:", __DEV__);

        // Check for updates on startup

        console.log("🔍 Checking for updates...");
        console.log("📦 Updates configuration:", {
          updateUrl: Updates?.url,
          runtimeVersion: Updates.runtimeVersion,
          channel: Updates.channel,
        });

        console.log("🔗 Linking configuration:", Updates.manifest, Updates);

        const update = await Updates.checkForUpdateAsync();
        console.log("📊 Update check result:", {
          isAvailable: update.isAvailable,
          isRollBackToEmbedded: update.isRollBackToEmbedded,
          manifest: update.manifest ? "Present" : "Not present",
          reason: update.reason,
        });

        if (update.isAvailable) {
          console.log("⬇️ Update available! Starting fetch...");
          const fetchResult = await Updates.fetchUpdateAsync();
          console.log("📥 Fetch result:", {
            isNew: fetchResult.isNew,
            manifest: fetchResult.manifest ? "Present" : "Not present",
          });

          console.log("🔄 Reloading app with new update...");
          await Updates.reloadAsync();
        } else {
          console.log("✅ No update available, continuing with current version");
          if (update.reason) {
            console.log("❓ No update reason:", update.reason);
          }
        }

        console.log("✅ App initialization completed successfully");
        setIsLoaded(true);
      } catch (error) {
        console.error("❌ App initialization failed:", error);
        console.error("🔍 Error details:", {
          name: error?.name,
          message: error?.message,
          stack: error?.stack,
        });
        setIsLoaded(true); // Still show app even if initialization fails
      }
    };

    console.log("🎯 Starting Promise.allSettled for app initialization");
    Promise.allSettled([
      loadAsync({
        Bebas: require("./assets/fonts/BebasNeue-Regular.ttf"),
      })
        .then(() => console.log("🔤 Fonts loaded successfully"))
        .catch((error) => console.error("🔤 Font loading failed:", error)),
      initializeApp(),
    ]).then((results) => {
      console.log(
        "🏁 Promise.allSettled completed:",
        results.map((result, index) => ({
          index,
          status: result.status,
          ...(result.status === "rejected" && { reason: result.reason }),
        }))
      );
    });
  }, []);

  return (
    <SafeAreaProvider style={{ flex: 1 }}>
      <Provider store={store}>
        <PaperProvider theme={theme}>
          <Navigator isLoaded={isLoaded} />
        </PaperProvider>
      </Provider>
    </SafeAreaProvider>
  );
}

const Navigator = ({ isLoaded }: { isLoaded: boolean }) => {
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

  if (!loaded || !isLoaded) return <Fallback />;

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
              headerShown: Platform.OS !== "ios",
              title: Platform.OS === "ios" ? "" : "Overview",
              headerTitleAlign: "center",
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
