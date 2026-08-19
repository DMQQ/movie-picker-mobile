import { router } from "expo-router";
import { baseUrl } from "../context/SocketContext";
import envs from "../constants/envs";

export interface InviteRoutePayload {
  inviteId: string;
  roomId: string;
  gameType: "voter" | "either-or" | "swipe";
}

export async function fetchAndRouteInvite(
  inviteId: string,
  token?: string,
  signal?: AbortSignal,
): Promise<InviteRoutePayload | null> {
  try {
    const headers: Record<string, string> = {};

    if (token) {
      headers.authorization = `Bearer ${token}`;
    } else {
      headers.authorization = `Bearer ${envs.server_auth_token}`;
    }

    const res = await fetch(`${baseUrl}/api/invites/${inviteId}`, {
      headers,
      signal,
    });

    if (!res.ok) return null;

    const { invite } = await res.json();

    if (signal?.aborted) return null;
    if (invite.status !== "pending") return null;

    return {
      inviteId: invite.id,
      roomId: invite.roomId,
      gameType: invite.gameType || "swipe",
    };
  } catch {
    return null;
  }
}

export function routeToGameByInvite(
  payload: InviteRoutePayload,
  options: { method?: "replace" | "push"; onError?: () => void } = {},
) {
  const { method = "replace", onError } = options;
  const routerMethod = method === "replace" ? router.replace : router.push;

  switch (payload.gameType) {
    case "voter":
      routerMethod({
        pathname: "/voter",
        params: { sessionId: payload.roomId, inviteId: payload.inviteId },
      });
      break;

    case "either-or":
      routerMethod({
        pathname: "/either-or/[roomId]",
        params: { roomId: payload.roomId, inviteId: payload.inviteId },
      });
      break;

    case "swipe":
    default:
      routerMethod({
        pathname: "/room/[roomId]",
        params: { roomId: payload.roomId, inviteId: payload.inviteId },
      });
  }
}

export async function handleInviteDeeplink(
  inviteId: string,
  token?: string,
  signal?: AbortSignal,
) {
  const payload = await fetchAndRouteInvite(inviteId, token, signal);
  if (payload) {
    routeToGameByInvite(payload);
  } else {
    router.replace("/");
  }
}
