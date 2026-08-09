import { Stack } from "expo-router";
import { Platform } from "react-native";
import useTranslation from "../../../service/useTranslation";
import { colors } from "../../../constants/design";

export default function SearchLayout() {
  const t = useTranslation();
  return (
    <Stack
      screenOptions={{
        contentStyle: { backgroundColor: colors.appBackground },
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          headerShown: Platform.OS === "ios",
          headerStyle: { backgroundColor: colors.appBackground },
          headerTitle: t("search.title", { query: "" }) as string,
        }}
      />
    </Stack>
  );
}
