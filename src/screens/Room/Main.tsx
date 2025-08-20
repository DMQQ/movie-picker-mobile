import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { SocketProvider } from "../../service/SocketContext";
import useTranslation from "../../service/useTranslation";
import { ScreenProps } from "../types";
import GameSummary from "./GameSummary";
import Home from "./Home";
import QRCodePage from "./QRCodePage";
import QRScanner from "./QRScanner";
import RoomSetup from "./RoomSetup";

const Stack = createNativeStackNavigator();

export default function QRCode({ navigation, route }: ScreenProps<"QRCode">) {
  const t = useTranslation();

  useEffect(() => {
    const listener = navigation.addListener("state", (event) => {
      const route = event.data.state.routes[event.data.state.index].state?.routes;

      if (route && route.length > 0 && route[0].name === "Home") {
        navigation.setOptions({
          gestureEnabled: false,
        });
      }
    });

    return () => {
      listener();
    };
  }, [navigation]);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <SocketProvider namespace="/swipe">
        <Stack.Navigator initialRouteName="RoomSetup" screenOptions={{ headerShown: false }}>
          <Stack.Screen
            name="RoomSetup"
            component={RoomSetup}
            options={{
              headerTitleAlign: "center",
            }}
          />

          <Stack.Screen
            name="CreateQRCode"
            component={QRCodePage}
            options={{
              title: t("room.titles.qr-code"),
              headerTitleAlign: "center",
            }}
          />

          <Stack.Screen name="Home" component={Home} />

          <Stack.Screen name="QRScanner" component={QRScanner} options={{ headerShown: false, title: "", headerTransparent: true }} />

          <Stack.Screen
            name="GameSummary"
            component={GameSummary}
            options={{
              headerShown: false,
              title: "Game Summary",
            }}
          />
        </Stack.Navigator>
      </SocketProvider>
    </SafeAreaView>
  );
}
