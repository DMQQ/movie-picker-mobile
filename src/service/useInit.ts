import { useEffect, useState } from "react";
import { Platform } from "react-native";
import { loadAsync } from "expo-font";

export default function useInit() {
  const [isLoaded, setIsLoaded] = useState(Platform.OS !== "ios");

  useEffect(() => {
    loadAsync({
      Bebas: require("../../assets/fonts/Bebas.ttf"),
    }).then(() => {
      setIsLoaded(true);
    });
  }, []);

  return { isLoaded: isLoaded, isUpdating: false };
}
