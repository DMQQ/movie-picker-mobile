import { Platform } from "react-native";
import { Stack } from "expo-router";

export default function FavouritesLayout() {
  return (
    <Stack>
      <Stack.Screen name="[id]" options={{ headerShown: false }} />
      <Stack.Screen name="blocked" options={{ headerShown: false }} />
      <Stack.Screen name="super-liked" options={{ headerShown: false }} />
      <Stack.Screen
        name="rate-movie"
        options={{
          headerShown: false,
          gestureEnabled: true,
          presentation: "formSheet",
          sheetGrabberVisible: true,
          contentStyle: {
            backgroundColor: Platform.OS === "android" ? "#121212" : "transparent",
          },
          sheetAllowedDetents: [0.5],
          sheetInitialDetentIndex: 0,
        }}
      />
    </Stack>
  );
}
