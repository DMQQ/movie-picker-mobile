import { useEffect } from "react";
import { useFonts } from "expo-font";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { posthog } from "../constants/posthog";

export default function useInit() {
  const [loaded, error] = useFonts({
    Bebas: require("../../assets/fonts/Bebas.ttf"),
    ...MaterialCommunityIcons.font,
  });

  useEffect(() => {
    if (error) posthog?.captureException(error);
  }, [error]);

  return { isLoaded: loaded, isUpdating: false };
}
