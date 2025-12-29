import { Stack } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { SocketProvider } from "../../context/SocketContext";
import { RoomContextProvider } from "../../context/RoomContext";
import { useEffect } from "react";
import { useAppDispatch } from "../../redux/store";
import { roomActions } from "../../redux/room/roomSlice";

export default function RootLayout() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    return () => {
      console.log("Resetting room state on unmount of RootLayout");
      dispatch(roomActions.reset());
    };
  }, []);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#000" }}>
      <SocketProvider namespace="/swipe">
        <RoomContextProvider>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="setup" options={{ headerShown: false }} />

            <Stack.Screen name="summary" options={{ headerShown: false }} />

            <Stack.Screen name="[roomId]" options={{ headerShown: false }} />

            <Stack.Screen name="overview" options={{ headerShown: false }} />
          </Stack>
        </RoomContextProvider>
      </SocketProvider>
    </SafeAreaView>
  );
}
