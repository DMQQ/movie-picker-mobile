import { Stack } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { SocketProvider } from "../../context/SocketContext";
import { RoomContextProvider } from "../../context/RoomContext";
import { useEffect } from "react";
import { useAppDispatch } from "../../redux/store";
import { roomActions } from "../../redux/room/roomSlice";
import { View } from "react-native";
import { reset } from "../../redux/roomBuilder/roomBuilderSlice";
import { Image } from "expo-image";

export default function RootLayout() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    return () => {
      console.log("Resetting room state");
      dispatch(roomActions.reset());
      dispatch(reset());

      Image.clearMemoryCache();
    };
  }, []);

  const insets = useSafeAreaInsets();

  return (
    <View style={{ flex: 1, backgroundColor: "#000", paddingTop: insets.top, paddingBottom: insets.bottom }}>
      <SocketProvider namespace="/swipe">
        <RoomContextProvider>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="setup" options={{ headerShown: false }} />

            <Stack.Screen name="summary" options={{ headerShown: false }} />

            <Stack.Screen name="[roomId]" options={{ headerShown: false }} />

            <Stack.Screen name="overview" options={{ headerShown: false }} />

            <Stack.Screen name="qr-code" options={{ headerShown: false }} />
          </Stack>
        </RoomContextProvider>
      </SocketProvider>
    </View>
  );
}
