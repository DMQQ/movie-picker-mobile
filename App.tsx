import { MD2DarkTheme, PaperProvider } from "react-native-paper";
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
import { StatusBar } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MovieDetails from "./src/screens/MovieDetails";
import { RootStackParamList } from "./src/screens/types";

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <SocketProvider>
        <Provider store={store}>
          <PaperProvider theme={MD2DarkTheme}>
            <NavigationContainer
              theme={DarkTheme}
              linking={{
                prefixes: ["qr-mobile://"],
                config: {
                  screens: {
                    Home: "home/:roomId",
                    QRCode: "qr-code",
                    QRScanner: "qr-scanner",
                    Overview: "overview",
                  },
                },
              }}
              onStateChange={(state) => {
                const currentRoute =
                  state?.routes[state.index]?.name || "Landing";

                if (
                  ["Home", "QRCode", "QRScanner", "Overview"].includes(
                    currentRoute
                  )
                ) {
                  StatusBar.setBackgroundColor(MD2DarkTheme.colors.surface);
                } else {
                  StatusBar.setBackgroundColor("#000");
                }
              }}
            >
              <GestureHandlerRootView
                style={{ flex: 1, backgroundColor: "#000" }}
              >
                <StatusBar backgroundColor="#000" />

                <Stack.Navigator
                  initialRouteName="Landing"
                  screenOptions={{ headerShown: false }}
                >
                  <Stack.Screen name="Landing" component={Landing} />
                  <Stack.Screen name="Home" component={Home} />
                  <Stack.Screen name="QRCode" component={QRCode} />
                  <Stack.Screen
                    name="QRScanner"
                    component={QRScanner}
                    options={{ headerShown: true, title: "Scan QR Code" }}
                  />

                  <Stack.Screen
                    name="Overview"
                    component={Overview}
                    options={{
                      headerShown: false,
                      title: "",
                    }}
                  />
                  <Stack.Screen
                    name="MovieDetails"
                    component={MovieDetails}
                    initialParams={{
                      id: 0,
                      type: "movie",
                      img: "",
                    }}
                  />
                </Stack.Navigator>
              </GestureHandlerRootView>
            </NavigationContainer>
          </PaperProvider>
        </Provider>
      </SocketProvider>
    </SafeAreaView>
  );
}
