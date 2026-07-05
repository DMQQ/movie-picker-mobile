import { Stack } from "expo-router";
import { MD2DarkTheme } from "react-native-paper";

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: MD2DarkTheme.colors.surface },
        animation: "none",
      }}
    >
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
    </Stack>
  );
}
