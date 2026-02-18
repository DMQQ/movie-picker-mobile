import { Stack } from "expo-router";
import { Platform } from "react-native";
import useTranslation from "../../../service/useTranslation";

export default function SearchLayout() {
  const t = useTranslation();
  return (
    <Stack
      screenOptions={{
        contentStyle: { backgroundColor: "#000" },
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          headerShown: Platform.OS === "ios",
          headerStyle: { backgroundColor: "#000" },
          headerTitle: t("search.title", { query: "" }) as string,
        }}
      />
    </Stack>
  );
}
