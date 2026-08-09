import { Stack } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { SocketProvider } from "../../context/SocketContext";
import { RoomContextProvider } from "../../context/RoomContext";
import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../redux/store";
import { roomActions } from "../../redux/room/roomSlice";
import { View } from "react-native";
import { reset } from "../../redux/roomBuilder/roomBuilderSlice";
import { Image } from "expo-image";
import { colors } from "../../constants/design";

export default function RootLayout() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    return () => {
      dispatch(roomActions.reset());
      dispatch(reset());

      Image.clearMemoryCache();
    };
  }, []);

  const insets = useSafeAreaInsets();
  const isPlaying = useAppSelector((s) => s.room.isPlaying);

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.appBackground,
        paddingTop: insets.top,
        paddingBottom: insets.bottom,
      }}
    >
      <Stack.Screen
        options={{ gestureEnabled: !isPlaying, headerShown: false }}
      />
      <SocketProvider namespace="/swipe">
        <RoomContextProvider>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="setup" options={{ headerShown: false }} />

            <Stack.Screen name="summary" options={{ headerShown: false }} />

            <Stack.Screen
              name="[roomId]"
              options={{ headerShown: false, gestureEnabled: false }}
            />

            <Stack.Screen name="overview" options={{ headerShown: false }} />

            <Stack.Screen name="qr-code" options={{ headerShown: false }} />
          </Stack>
        </RoomContextProvider>
      </SocketProvider>
    </View>
  );
}
