import { SafeAreaView } from "react-native";
import { Button, MD2DarkTheme, PaperProvider } from "react-native-paper";
import { StatusBar } from "expo-status-bar";
import { DarkTheme, NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Home from "./src/screens/Home";
import QRScanner from "./src/screens/QRScanner";
import Landing from "./src/screens/Landing";
import QRCode from "./src/screens/QRCode";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useEffect, useState } from "react";
import { socket } from "./src/service/socket";
import { Provider } from "react-redux";
import { store } from "./src/redux/store";
import Overview from "./src/screens/Overview";

const Stack = createNativeStackNavigator();

export default function App() {
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const unsubscribe = socket.on("connection", () => {
      setIsConnected(true);
    });

    return () => {
      unsubscribe.disconnect();
    };
  }, []);

  return (
    <Provider store={store}>
      <PaperProvider theme={MD2DarkTheme}>
        <NavigationContainer theme={DarkTheme}>
          <GestureHandlerRootView style={{ flex: 1, backgroundColor: "#000" }}>
            <SafeAreaView style={{ flex: 1 }}>
              <StatusBar style="auto" backgroundColor="#000" />

              <Stack.Navigator
                initialRouteName="Landing"
                screenOptions={{ headerShown: false }}
              >
                <Stack.Screen name="Landing" component={Landing} />
                <Stack.Screen
                  name="Home"
                  component={Home}
                  options={{
                    headerShown: true,
                  }}
                />
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
            </SafeAreaView>
          </GestureHandlerRootView>
        </NavigationContainer>
      </PaperProvider>
    </Provider>
  );
}
