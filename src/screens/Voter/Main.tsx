import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";
import { SocketProvider } from "../../service/SocketContext";
import { MovieVoterProvider } from "../../service/useVoter";
import ContextProvider from "../Room/ContextProvider";
import Home from "./Home";

const Stack = createNativeStackNavigator();

export default function Main({ navigation }: any) {
  return (
    <SafeAreaView style={{ flex: 1 }}>
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
    </SafeAreaView>
  );
}
