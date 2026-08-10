import { router } from "expo-router";
import { baseUrl } from "../context/SocketContext";
import envs from "../constants/envs";

export async function handleNativeIntent(url: string): Promise<string | undefined> {
  const [type, value] = url.replace("flickmate://", "/").split("/").filter(Boolean);

  switch (type) {
    case "swipe":
      router.push({
        pathname: "/room/[roomId]",
        params: { roomId: value.toUpperCase() },
      });
      return "/room/[roomId]";

    case "voter":
      router.push({
        pathname: "/voter",
        params: { sessionId: value.toUpperCase() },
      });
      return "/voter";

    case "create-room":
      router.push({
        pathname: "/room/qr-code",
        params: { quickStart: "true" },
      });
      return "/room/qr-code";

    case "invite": {
      try {
        const res = await fetch(`${baseUrl}/api/invites/${value}`, {
          headers: { authorization: `Bearer ${envs.server_auth_token}` },
        });
        if (!res.ok) return undefined;
        const { invite } = await res.json();
        if (invite.status !== "pending") return undefined;

        if (invite.gameType === "voter") {
          router.push({
            pathname: "/voter",
            params: { sessionId: invite.roomId, inviteId: invite.id },
          });
          return "/voter";
        }

        router.push({
          pathname: "/room/[roomId]",
          params: { roomId: invite.roomId, inviteId: invite.id },
        });
        return "/room/[roomId]";
      } catch {
        return undefined;
      }
    }

    default:
      return undefined;
  }
}
