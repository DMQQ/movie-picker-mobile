import { Stack } from "expo-router";

export default function FortuneLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />

      <Stack.Screen name="filters" />
    </Stack>
  );
}
