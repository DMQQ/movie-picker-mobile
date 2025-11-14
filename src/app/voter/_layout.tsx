import { Stack } from "expo-router";
import ContextProvider from "../../screens/Voter/ContextProvider";
import { MovieVoterProvider } from "../../service/useVoter";
import { SocketProvider } from "../../service/SocketContext";
import { SafeAreaView } from "react-native-safe-area-context";

export default function VoterLayout() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "black" }} edges={["top", "bottom"]}>
      <SocketProvider namespace="/voter">
        <MovieVoterProvider>
          <ContextProvider>
            <Stack
              screenOptions={{
                headerShown: false,
                animation: "fade",
                contentStyle: { backgroundColor: "black" },
              }}
            >
              <Stack.Screen name="index" />
            </Stack>
          </ContextProvider>
        </MovieVoterProvider>
      </SocketProvider>
    </SafeAreaView>
  );
}
