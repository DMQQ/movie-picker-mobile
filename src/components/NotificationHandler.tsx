import * as Notifications from "expo-notifications";
import { router } from "expo-router";
import { useEffect } from "react";
import { baseUrl } from "../context/SocketContext";
import envs from "../constants/envs";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function NotificationHandler() {
  const lastResponse = Notifications.useLastNotificationResponse();

  useEffect(() => {
    if (!lastResponse) return;

    const data = lastResponse.notification.request.content.data as Record<
      string,
      unknown
    > | null;
    if (!data?.screen) return;

    if (data.screen === "invite") {
      const inviteId = data.inviteId as string | undefined;
      if (!inviteId) return;

      fetch(`${baseUrl}/api/invites/${inviteId}`, {
        headers: { authorization: `Bearer ${envs.server_auth_token}` },
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
  }, [lastResponse]);

  return null;
}
