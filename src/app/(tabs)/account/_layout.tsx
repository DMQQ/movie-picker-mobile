import { Stack } from "expo-router";
import { colors } from "../../../constants/design";

export default function SettingsLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.appBackground } }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="scoring-preferences" />
    </Stack>
  );
}
