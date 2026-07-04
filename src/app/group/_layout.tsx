import { Stack } from "expo-router";

export default function FavouritesLayout() {
  return (
    <Stack>
      <Stack.Screen name="[id]" options={{ headerShown: false }} />
      <Stack.Screen name="blocked" options={{ headerShown: false }} />
      <Stack.Screen name="super-liked" options={{ headerShown: false }} />
    </Stack>
  );
}
