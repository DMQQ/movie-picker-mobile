import * as Notifications from "expo-notifications";
import { router } from "expo-router";
import { Platform } from "react-native";
import { useEffect } from "react";
import { baseUrl } from "../context/SocketContext";
import { useAppSelector } from "../redux/store";
import { posthog } from "../constants/posthog";

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

      fetch(`${baseUrl}/api/invites/${inviteId}`, {
        headers: token
          ? { authorization: `Bearer ${token}` }
          : {},
      })
        .then((res) => {
          if (!res.ok) throw new Error("invite fetch failed");
          return res.json();
        })
        .then(({ invite }) => {
          if (invite.status !== "pending") {
            router.replace("/");
            return;
          }
          if (invite.gameType === "voter") {
            router.replace({
              pathname: "/voter",
              params: { sessionId: invite.roomId, inviteId: invite.id },
            });
          } else {
            router.replace({
              pathname: "/room/[roomId]",
              params: { roomId: invite.roomId, inviteId: invite.id },
            });
          }
        })
        .catch(() => router.replace("/"));
    }
  }, [lastResponse, isRestored, token]);

  return null;
}
