import "react-native-reanimated";

import { ActivityIndicator, MD2DarkTheme, PaperProvider } from "react-native-paper";
import { DarkTheme, NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Home from "./src/screens/Home";
import QRScanner from "./src/screens/QRScanner";
import Landing from "./src/screens/Landing";
import QRCode from "./src/screens/CreateRoom/Main";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Provider } from "react-redux";
import { store } from "./src/redux/store";
import Overview from "./src/screens/Overview";
import { SocketProvider } from "./src/service/SocketContext";
import { Alert, Platform, StatusBar, View } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import MovieDetails from "./src/screens/MovieDetails";
import { RootStackParamList } from "./src/screens/types";
import SettingsScreen from "./src/screens/Settings";
import { useEffect, useState } from "react";
import { loadAsync } from "expo-font";
import FortuneWheel from "./src/screens/FortuneWheel";
import { FancySpinner } from "./src/components/FancySpinner";
import Favourites from "./src/screens/Favourites";

const Stack = createNativeStackNavigator<RootStackParamList>();

import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

const Fallback = () => (
  <View
    style={{
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    }}
  >
    <FancySpinner size={100} />
  </View>
);

async function loadFonts() {
  if (Platform.OS === "web") {
    const style = document.createElement("style");
    style.textContent = `
      @font-face {
        font-family: 'MaterialCommunityIcons';
        src: url(${require("@expo/vector-icons/build/vendor/react-native-vector-icons/Fonts/MaterialCommunityIcons.ttf")}) format('truetype');
      }
    `;
    document.head.appendChild(style);
  }
}

export default function App() {
  const [isLoaded, setIsLoaded] = useState(false);
  useEffect(() => {
    loadFonts();
    loadAsync({
      Bebas: require("./assets/fonts/BebasNeue-Regular.ttf"),
    }).then(() => {
      setIsLoaded(true);
    });
  }, []);

  if (!isLoaded) return <Fallback />;

  return (
    <SafeAreaProvider>
      <SafeAreaView style={{ flex: 1, backgroundColor: "#000", maxWidth: 756, maxHeight: 1000 }}>
        <SocketProvider>
          <Provider store={store}>
            <PaperProvider
              theme={MD2DarkTheme}
              settings={{
                icon: (props: any) => <MaterialCommunityIcons {...props} />,
              }}
            >
              <NavigationContainer theme={DarkTheme} fallback={<Fallback />}>
                <GestureHandlerRootView style={{ flex: 1, backgroundColor: "#000" }}>
                  <StatusBar backgroundColor="#000" />

                  <Stack.Navigator initialRouteName="Landing" screenOptions={{ headerShown: false }}>
                    <Stack.Screen name="Settings" component={SettingsScreen} />

                    <Stack.Screen name="Landing" component={Landing} />
                    <Stack.Screen name="Home" component={Home} />
                    <Stack.Screen name="QRCode" component={QRCode} />
                    <Stack.Screen name="QRScanner" component={QRScanner} options={{ headerShown: false, title: "Scan QR Code" }} />

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
                        headerTitle: "Movie Details",
                        // animation: "fade",
                        presentation: "modal",

                        title: "",
                      }}
                      initialParams={{
                        id: 0,
                        type: "movie",
                        img: "",
                      }}
                    />
                    <Stack.Screen
                      name="FortuneWheel"
                      component={FortuneWheel}
                      options={{
                        headerShown: false,
                        title: "",
                        presentation: "modal",
                      }}
                    />
                    <Stack.Screen
                      name="Favourites"
                      component={Favourites}
                      options={{
                        headerShown: false,
                        title: "",
                        presentation: "modal",
                      }}
                    />
                  </Stack.Navigator>
                </GestureHandlerRootView>
              </NavigationContainer>
            </PaperProvider>
          </Provider>
        </SocketProvider>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
