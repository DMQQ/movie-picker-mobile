import { Stack } from "expo-router";
import { colors } from "../../constants/design";

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.surface },
        animation: "none",
      }}
    >
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
      <Stack.Screen name="recover" />
      <Stack.Screen name="recovery-codes" />
    </Stack>
  );
}
