import { useEffect } from "react";
import { useFonts } from "expo-font";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as Sentry from "@sentry/react-native";

export default function useInit() {
  const [loaded, error] = useFonts({
    Bebas: require("../../assets/fonts/Bebas.ttf"),
    ...MaterialCommunityIcons.font,
  });

  useEffect(() => {
    if (error) Sentry.captureException(error);
  }, [error]);

  return { isLoaded: loaded, isUpdating: false };
}
