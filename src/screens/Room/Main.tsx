import { createStackNavigator } from "@react-navigation/stack";
import { SafeAreaView } from "react-native-safe-area-context";
import { SocketProvider } from "../../service/SocketContext";
import useTranslation from "../../service/useTranslation";
import { ScreenProps } from "../types";
import GameSummary from "./GameSummary";
import Home from "./Home";
import QRCodePage from "./QRCodePage";
import QRScanner from "./QRScanner";
import RoomSetup from "./RoomSetup";
import { RoomContextProvider } from "./RoomContext";

const Stack = createStackNavigator();

export default function QRCode({ navigation, route }: ScreenProps<"QRCode">) {
  const t = useTranslation();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#000" }}>
      <SocketProvider namespace="/swipe">
        <RoomContextProvider>
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
        </RoomContextProvider>
      </SocketProvider>
    </SafeAreaView>
  );
}
