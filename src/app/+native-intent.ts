import { router } from "expo-router";
import { fetchAndRouteInvite, routeToGameByInvite } from "../utils/inviteRouter";

const GAME_TYPE_PATHS: Record<string, string> = {
  voter: "/voter",
  "either-or": "/either-or/[roomId]",
  swipe: "/room/[roomId]",
};

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

    case "either-or":
      router.push({
        pathname: "/either-or/[roomId]",
        params: { roomId: value.toUpperCase() },
      });
      return "/either-or/[roomId]";

    case "create-room":
      router.push({
        pathname: "/room/qr-code",
        params: { quickStart: "true" },
      });
      return "/room/qr-code";

    case "invite": {
      const payload = await fetchAndRouteInvite(value);
      if (!payload) return undefined;

      routeToGameByInvite(payload, { method: "push" });
      return GAME_TYPE_PATHS[payload.gameType] || "/room/[roomId]";
    }

    default:
      return undefined;
  }
}
