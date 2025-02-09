import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { SocketProvider } from "../../service/SocketContext";
import ContextProvider from "../Room/ContextProvider";
import QRScanner from "./QRScanner";
import Home from "./Home";
import { MovieVoterProvider } from "../../service/useVoter";
import { GestureHandlerRootView } from "react-native-gesture-handler";

const Stack = createNativeStackNavigator();

export default function Main({ navigation }: any) {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SocketProvider namespace="/voter">
        <MovieVoterProvider>
          <ContextProvider navigation={navigation}>
            <Stack.Navigator initialRouteName="Home" screenOptions={{ headerShown: false }}>
              <Stack.Screen name="Home" component={Home} />
            </Stack.Navigator>
          </ContextProvider>
        </MovieVoterProvider>
      </SocketProvider>
    </GestureHandlerRootView>
  );
}
