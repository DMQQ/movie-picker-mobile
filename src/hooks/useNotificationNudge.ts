import { useEffect, useRef, useState } from "react";
import * as Notifications from "expo-notifications";
import { AsyncStorage } from "expo-sqlite/kv-store";
import { useToast } from "../components/Toast";
import useTranslation from "../service/useTranslation";

const SNOOZE_KEY = "notification_nudge_snoozed_until";
const SNOOZE_MS = 8 * 60 * 60 * 1000; // 8 hours

export function useNotificationNudge(context: "post_game" | "room_setup") {
  const [shouldShow, setShouldShow] = useState(false);
  const { show } = useToast();
  const t = useTranslation();
  const shownRef = useRef(false);

  useEffect(() => {
    let cancelled = false;
    async function check() {
      const { status, canAskAgain } = await Notifications.getPermissionsAsync();
      if (status === "granted" || !canAskAgain) return;

      const raw = await AsyncStorage.getItemAsync(SNOOZE_KEY);
      if (raw && Date.now() < parseInt(raw, 10)) return;

      if (!cancelled) setShouldShow(true);
    }
    check();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!shouldShow || shownRef.current) return;
    shownRef.current = true;

    show(t(`nudge.${context}`), {
      type: "info",
      duration: 0,
      onPress: async () => {
        await Notifications.requestPermissionsAsync();
      },
      onDismiss: async () => {
        await AsyncStorage.setItemAsync(SNOOZE_KEY, String(Date.now() + SNOOZE_MS));
      },
    });
  }, [shouldShow, context, show]);
}
