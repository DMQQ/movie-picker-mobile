import { useCallback, useEffect, useRef, useState } from "react";
import { AppState, AppStateStatus, Platform } from "react-native";
import { useNetInfo } from "@react-native-community/netinfo";
import { router } from "expo-router";
import { url } from "../context/SocketContext";
import { SettingsResponse } from "../../types";

export default function useMaintenance() {
  const { isConnected, isInternetReachable } = useNetInfo();
  const appState = useRef(AppState.currentState);
  const hasNavigated = useRef(false);

  const checkSettings = useCallback(async () => {
    const hasInternet = isConnected && isInternetReachable !== false;

    if (!hasInternet) {
      if (!hasNavigated.current) {
        hasNavigated.current = true;
        router.push({ pathname: "/modal", params: { type: "no-internet", dismissible: "true" } });
      }
      return;
    }

    try {
      const response = await fetch(url + "/device/settings");

      if (!response.ok) {
        if (!hasNavigated.current) {
          hasNavigated.current = true;
          router.push({ pathname: "/modal", params: { type: "server-error", dismissible: "true" } });
        }
        return;
      }

      const data = (await response.json()) as SettingsResponse;

      // Check maintenance
      if (data.maintenance) {
        const isActive = Platform.OS === "ios" ? data.maintenance.available.ios : data.maintenance.available.android;
        if (isActive) {
          if (!hasNavigated.current) {
            hasNavigated.current = true;
            router.push({
              pathname: "/modal",
              params: {
                type: "maintenance",
                dismissible: String(data.maintenance.dismissible ?? false),
                data: JSON.stringify(data),
              },
            });
          }
          return;
        }
      }

      // Check update
      if (data.update) {
        const isAvailable = Platform.OS === "ios" ? data.update.available.ios : data.update.available.android;
        if (isAvailable) {
          if (!hasNavigated.current) {
            hasNavigated.current = true;
            router.push({
              pathname: "/modal",
              params: {
                type: "update",
                dismissible: String(data.update.available.dismissible),
                data: JSON.stringify(data),
              },
            });
          }
          return;
        }
      }

      hasNavigated.current = false;
    } catch {
      if (!hasNavigated.current) {
        hasNavigated.current = true;
        router.push({ pathname: "/modal", params: { type: "server-error", dismissible: "true" } });
      }
    }
  }, [isConnected, isInternetReachable]);

  useEffect(() => {
    if (isConnected === null) return;
    checkSettings();
  }, [isConnected === null]);

  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (appState.current.match(/inactive|background/) && nextAppState === "active") {
        hasNavigated.current = false;
        checkSettings();
      }
      appState.current = nextAppState;
    };

    const subscription = AppState.addEventListener("change", handleAppStateChange);
    return () => subscription.remove();
  }, [checkSettings]);
}
