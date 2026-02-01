import * as Updates from "expo-updates";
import { useEffect, useState } from "react";

export default function useInit() {
  const [isUpdating, setIsUpdating] = useState(false);

  const { isUpdateAvailable, isUpdatePending, checkError, downloadError } = Updates.useUpdates();

  console.log("[useInit] isUpdateAvailable:", isUpdateAvailable);
  console.log("[useInit] isUpdatePending:", isUpdatePending);

  if (checkError) {
    console.error("[useInit] Update check error:", checkError);
  }

  if (downloadError) {
    console.error("[useInit] Update download error:", downloadError);
  }

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

  return { isLoaded: true, isUpdating };
}
