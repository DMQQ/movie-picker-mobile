import { Stack } from "expo-router";
import { formSheet } from "../_layout";

export default function FavouritesLayout() {
  return (
    <Stack>
      <Stack.Screen name="[id]" options={{ headerShown: false }} />
      <Stack.Screen name="blocked" options={{ headerShown: false }} />
      <Stack.Screen name="super-liked" options={{ headerShown: false }} />
      <Stack.Screen
        name="manage"
        options={formSheet([0.45, 0.7])}
      />
    </Stack>
  );
}
