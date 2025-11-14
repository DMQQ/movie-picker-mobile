import { Stack } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { SocketProvider } from "../../service/SocketContext";
import { RoomContextProvider } from "../../screens/Room/RoomContext";

export default function RootLayout() {
  return (
    <SocketProvider namespace="/swipe">
      <RoomContextProvider>
        <SafeAreaView style={{ flex: 1, backgroundColor: "#000" }}>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="setup" options={{ headerShown: false }} />

            <Stack.Screen name="qr-scanner" options={{ headerShown: false }} />

            <Stack.Screen name="summary" options={{ headerShown: false }} />

            <Stack.Screen name="[roomId]" options={{ headerShown: false }} />

            <Stack.Screen name="overview" options={{ headerShown: false }} />
          </Stack>
        </SafeAreaView>
      </RoomContextProvider>
    </SocketProvider>
  );
}
