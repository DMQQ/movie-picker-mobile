import { Stack } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { View } from "react-native";
import { SocketProvider } from "../../context/SocketContext";
import { EitherOrContextProvider } from "../../context/EitherOrContext";
import { useAppSelector } from "../../redux/store";
import { colors } from "../../constants/design";

export default function EitherOrLayout() {
  const insets = useSafeAreaInsets();
  const isStarted = useAppSelector((state) => state.eitherOr.isStarted);

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.appBackground,
        paddingTop: insets.top,
        paddingBottom: insets.bottom,
      }}
    >
      <Stack.Screen options={{ gestureEnabled: !isStarted, headerShown: false }} />
      <SocketProvider namespace="/either-or">
        <EitherOrContextProvider>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="setup" options={{ headerShown: false }} />
            <Stack.Screen name="[roomId]" options={{ headerShown: false, gestureEnabled: false }} />
            <Stack.Screen name="results" options={{ headerShown: false, gestureEnabled: false }} />
          </Stack>
        </EitherOrContextProvider>
      </SocketProvider>
    </View>
  );
}
