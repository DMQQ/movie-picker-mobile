import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { SafeAreaView } from "react-native-safe-area-context";
import { SocketProvider } from "../../service/SocketContext";
import useTranslation from "../../service/useTranslation";
import GameSummary from "./GameSummary";
import Home from "./Home";
import QRCodePage from "./QRCodePage";
import QRScanner from "./QRScanner";
import RoomSetup from "./RoomSetup";

const Stack = createNativeStackNavigator();

export default function QRCode({ navigation }: any) {
  const t = useTranslation();
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <SocketProvider namespace="/swipe">
        <Stack.Navigator initialRouteName="RoomSetup" screenOptions={{ headerShown: false }}>
          <Stack.Screen
            name="RoomSetup"
            component={RoomSetup}
            options={{
              title: t("room.titles.setup"),
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
