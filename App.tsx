import { MD2DarkTheme, PaperProvider } from "react-native-paper";
import { StatusBar } from "expo-status-bar";
import { DarkTheme, NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Home from "./src/screens/Home";
import QRScanner from "./src/screens/QRScanner";
import Landing from "./src/screens/Landing";
import QRCode from "./src/screens/QRCode";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Provider } from "react-redux";
import { store } from "./src/redux/store";
import Overview from "./src/screens/Overview";
import { SocketProvider } from "./src/service/SocketContext";

import { SafeAreaView } from "react-native-safe-area-context";

const Stack = createNativeStackNavigator();

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
            >
              <GestureHandlerRootView
                style={{ flex: 1, backgroundColor: "#000" }}
              >
                <StatusBar style="auto" backgroundColor="#000" />

                <Stack.Navigator
                  initialRouteName="Landing"
                  screenOptions={{ headerShown: false }}
                >
                  <Stack.Screen name="Landing" component={Landing} />
                  <Stack.Screen name="Home" component={Home} />
                  <Stack.Screen
                    name="QRCode"
                    component={QRCode}
                    options={{
                      headerShown: true,
                    }}
                  />
                  <Stack.Screen name="QRScanner" component={QRScanner} />

                  <Stack.Screen
                    name="Overview"
                    component={Overview}
                    options={{
                      headerShown: true,
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
