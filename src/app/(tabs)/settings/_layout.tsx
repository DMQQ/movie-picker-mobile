import { Stack } from "expo-router";

export default function SettingsLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="blocked-movies" />
      <Stack.Screen name="super-liked" />
    </Stack>
  );
}
