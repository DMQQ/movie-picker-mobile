import * as Updates from "expo-updates";
import { useEffect, useState } from "react";
import { Platform } from "react-native";
import { loadAsync } from "expo-font";

export default function useInit() {
  const [isUpdating, setIsUpdating] = useState(false);
  const [isLoaded, setIsLoaded] = useState(Platform.OS !== "ios");

  useEffect(() => {
    loadAsync({
      Bebas: require("../../assets/fonts/Bebas.ttf"),
    }).then(() => {
      setIsLoaded(true);
    });
  }, []);

  const { isUpdateAvailable, isUpdatePending, checkError, downloadError } = Updates.useUpdates();

  console.log("[useInit] isUpdateAvailable:", isUpdateAvailable);
  console.log("[useInit] isUpdatePending:", isUpdatePending);

  useEffect(() => {
    if (checkError) {
      console.error("[useInit] Update check error:", checkError);
    }
  }, [checkError]);

  useEffect(() => {
    if (downloadError) {
      console.error("[useInit] Update download error:", downloadError);
      setIsUpdating(false);
    }
  }, [downloadError]);

  useEffect(() => {
    if (isUpdateAvailable) {
      setIsUpdating(true);
      Updates.fetchUpdateAsync();
    }
  }, [isUpdateAvailable]);

  useEffect(() => {
    if (isUpdatePending) {
      Updates.reloadAsync();
    }
  }, [isUpdatePending]);

  return { isLoaded: isLoaded, isUpdating };
}
