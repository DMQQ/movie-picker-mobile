import { useEffect, useRef } from "react";
import { Platform } from "react-native";
import { AsyncStorage } from "expo-sqlite/kv-store";
import * as Notifications from "expo-notifications";
import { useUpdateDeviceMutation } from "../redux/auth/authApi";
import { useAppSelector } from "../redux/store";

export function usePushToken() {
  const authToken = useAppSelector((state) => state.auth.token);
  const [updateDevice] = useUpdateDeviceMutation();
  const lastTokenRef = useRef<string | null>(null);
  const authTokenRef = useRef(authToken);
  authTokenRef.current = authToken;

  useEffect(() => {
    async function register(token: string) {
      if (!authTokenRef.current) return;
      if (token === lastTokenRef.current) return;
      lastTokenRef.current = token;

      try {
        await updateDevice({
          platform: Platform.OS,
          pushNotificationToken: token,
          notificationsEnabled: true,
        }).unwrap();
      } catch {}
    }

    async function maybeRegister() {
      const enabled = await AsyncStorage.getItemAsync("notificationsEnabled");
      if (enabled === "false") return;

      const { status } = await Notifications.getPermissionsAsync();
      if (status !== "granted") return;

      const { data } = await Notifications.getExpoPushTokenAsync();
      await register(data);
    }

    if (authToken) {
      maybeRegister();
    } else {
      lastTokenRef.current = null;
    }

    const sub = Notifications.addPushTokenListener(async ({ data }) => {
      const enabled = await AsyncStorage.getItemAsync("notificationsEnabled");
      if (enabled === "false") return;
      register(data);
    });
    return () => sub.remove();
  }, [authToken]);
}
