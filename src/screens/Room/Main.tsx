import { createNativeStackNavigator } from "@react-navigation/native-stack";
import ContextProvider from "./ContextProvider";
import QRCodePage from "./QRCodePage";
import useTranslation from "../../service/useTranslation";
import { SocketProvider } from "../../service/SocketContext";
import Home from "./Home";
import QRScanner from "./QRScanner";
import RoomSetup from "./RoomSetup";
import GameSummary from "./GameSummary";

const Stack = createNativeStackNavigator();

export default function QRCode({ navigation }: any) {
  const t = useTranslation();
  return (
    <SocketProvider namespace="/swipe">
      <ContextProvider navigation={navigation}>
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
              title: "Game Summary" 
            }} 
          />
        </Stack.Navigator>
      </ContextProvider>
    </SocketProvider>
  );
}
