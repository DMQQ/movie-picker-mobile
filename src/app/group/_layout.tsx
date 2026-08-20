import { Platform } from "react-native";
import { Stack } from "expo-router";

export default function FavouritesLayout() {
  return (
    <Stack>
      <Stack.Screen name="[id]" options={{ headerShown: false }} />
      <Stack.Screen name="blocked" options={{ headerShown: false }} />
      <Stack.Screen name="super-liked" options={{ headerShown: false }} />
      <Stack.Screen
        name="manage"
        options={{
          headerShown: false,
          presentation: "formSheet",
          sheetAllowedDetents: [0.45],
          contentStyle: {
            backgroundColor: Platform.OS === "ios" ? "transparent" : "#121212",
          },
        }}
      />
    </Stack>
  );
}
