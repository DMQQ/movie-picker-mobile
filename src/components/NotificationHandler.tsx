import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import { useEffect } from "react";
import { router } from "expo-router";
import { useAppSelector } from "../redux/store";
import { posthog } from "../constants/posthog";
import { handleInviteDeeplink } from "../utils/inviteRouter";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

if (Platform.OS === "android") {
  Notifications.setNotificationChannelAsync("default", {
    name: "Default",
    importance: Notifications.AndroidImportance.MAX,
    color: "#4169E1",
  });
}

export default function NotificationHandler() {
  const token = useAppSelector((s) => s.auth.token);
  const isRestored = useAppSelector((s) => s.auth.isRestored);
  const lastResponse = Notifications.useLastNotificationResponse();

  useEffect(() => {
    if (!isRestored || !lastResponse) return;

    const data = lastResponse.notification.request.content.data as Record<
      string,
      unknown
    > | null;
    if (!data?.screen) return;

    posthog?.capture("push_notification_opened", { screen: String(data.screen) });

    if (data.screen === "invite") {
      const inviteId = data.inviteId as string | undefined;
      if (!inviteId) return;
      handleInviteDeeplink(inviteId, token);
    }

    if (data.screen === "GameDetail") {
      const gameId = data.gameId as string | undefined;
      if (!gameId) return;
      router.push({ pathname: "/games/[id]", params: { id: gameId } });
    }
  }, [lastResponse, isRestored, token]);

  return null;
}
