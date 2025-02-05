import { createNativeStackNavigator } from "@react-navigation/native-stack";
import ChooseCategory from "./ChooseCategory";
import ChooseGenre from "./ChooseGenre";
import ContextProvider from "./ContextProvider";
import ChoosePageRange from "./ChoosePageRange";
import QRCodePage from "./QRCodePage";
import useTranslation from "../../service/useTranslation";
import { SocketProvider } from "../../service/SocketContext";
import Home from "./Home";
import QRScanner from "./QRScanner";

const Stack = createNativeStackNavigator();

export default function QRCode({ navigation }: any) {
  const t = useTranslation();
  return (
    <SocketProvider>
      <ContextProvider navigation={navigation}>
        <Stack.Navigator initialRouteName="ChooseCategory" screenOptions={{ headerShown: false }}>
          <Stack.Screen
            name="ChooseCategory"
            component={ChooseCategory}
            options={{
              title: t("room.titles.category"),
              headerTitleAlign: "center",
            }}
          />
          <Stack.Screen
            name="ChooseGenre"
            component={ChooseGenre}
            options={{
              title: t("room.titles.genre"),
              headerTitleAlign: "center",
            }}
          />
          <Stack.Screen
            name="ChoosePage"
            component={ChoosePageRange}
            options={{
              title: t("room.titles.page-range"),
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

          <Stack.Screen name="QRScanner" component={QRScanner} options={{ headerShown: false, title: "Scan QR Code" }} />
        </Stack.Navigator>
      </ContextProvider>
    </SocketProvider>
  );
}
