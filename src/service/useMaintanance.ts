import { useCallback, useEffect, useRef, useState } from "react";
import { AppState, AppStateStatus, Platform } from "react-native";
import { useNetInfo } from "@react-native-community/netinfo";
import { router } from "expo-router";
import { url } from "../context/SocketContext";
import { SettingsResponse } from "../../types";

export interface MaintenanceCheckResult {
  success: boolean;
  type?: "no-internet" | "server-error" | "maintenance" | "update";
  data?: SettingsResponse;
}

export default function useMaintenance(initialCheck = true) {
  const { isConnected, isInternetReachable } = useNetInfo();
  const appState = useRef(AppState.currentState);
  const hasNavigated = useRef(false);

  const [isRetrying, setIsRetrying] = useState(false);

  const checkSettings = useCallback(
    async (manual = false): Promise<MaintenanceCheckResult> => {
      const isManualRetry = manual || !initialCheck;
      if (isManualRetry) {
        setIsRetrying(true);
      }

      const hasInternet = isConnected && isInternetReachable !== false;

      const handleFailure = (
        type: "no-internet" | "server-error" | "maintenance" | "update",
        dismissible: string,
        data?: SettingsResponse,
      ) => {
        if (!isManualRetry) {
          if (!hasNavigated.current) {
            hasNavigated.current = true;
            router.push({
              pathname: "/modal",
              params: { type, dismissible, ...(data && { data: JSON.stringify(data) }) },
            });
          }
        }
        if (isManualRetry) setIsRetrying(false);
        return { success: false, type, data };
      };

      if (!hasInternet) {
        return handleFailure("no-internet", "true");
      }

      try {
        const response = await fetch(url + "/device/settings");

        if (!response.ok) {
          return handleFailure("server-error", "false");
        }

        const data = (await response.json()) as SettingsResponse;

        if (data.maintenance) {
          const isActive = Platform.OS === "ios" ? data.maintenance.available.ios : data.maintenance.available.android;

          if (isActive) {
            return handleFailure("maintenance", String(data.maintenance.dismissible ?? false), data);
          }
        }

        if (data.update) {
          const isAvailable = Platform.OS === "ios" ? data.update.available.ios : data.update.available.android;

          if (isAvailable) {
            return handleFailure("update", String(data.update.available.dismissible ?? false), data);
          }
        }

        hasNavigated.current = false;
        if (isManualRetry) setIsRetrying(false);
        return { success: true };
      } catch {
        return handleFailure("server-error", "false");
      }
    },
    [isConnected, isInternetReachable, initialCheck],
  );

  useEffect(() => {
    if (isConnected === null) return;
    checkSettings(false);
  }, [isConnected, checkSettings]);

  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (appState.current.match(/inactive|background/) && nextAppState === "active") {
        hasNavigated.current = false;
        checkSettings(false);
      }
      appState.current = nextAppState;
    };

    const subscription = AppState.addEventListener("change", handleAppStateChange);
    return () => subscription.remove();
  }, [checkSettings]);

  const handleRetryPress = async () => {
    const result = await checkSettings(true);

    if (result.success) {
      router.back();
    } else {
      console.log("Still failing:", result.type);
    }
  };

  return { retry: handleRetryPress, isRetrying };
}
