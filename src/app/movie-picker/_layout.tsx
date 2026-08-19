import { Stack } from "expo-router";
import { colors } from "../../constants/design";

export default function MoviePickerLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.surface },
        animation: "slide_from_right",
      }}
    />
  );
}
