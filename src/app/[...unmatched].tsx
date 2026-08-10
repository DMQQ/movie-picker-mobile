import { router, useLocalSearchParams } from "expo-router";
import { useEffect } from "react";
import { View } from "react-native";
import { colors } from "../constants/design";
import { baseUrl } from "../context/SocketContext";
import envs from "../constants/envs";

export default function Unmatched() {
  const params = useLocalSearchParams();

  useEffect(() => {
    const url = Array.isArray(params.unmatched) ? params.unmatched.join("/") : params.unmatched || "";

    console.log("Unmatched route detected:", { url, params });

    if (url.startsWith("swipe/")) {
      const roomId = url.replace("swipe/", "");
      router.replace({
        pathname: "/room/[roomId]",
        params: { roomId: roomId.toUpperCase() },
      });
      return;
    }

    if (url.startsWith("voter/")) {
      const sessionId = url.replace("voter/", "");
      router.replace({
        pathname: "/voter",
        params: { sessionId: sessionId.toUpperCase() },
      });
      return;
    }

    if (url.startsWith("create-room")) {
      router.replace({
        pathname: "/room/qr-code",
        params: { quickStart: "true" },
      });
      return;
    }

    if (url.startsWith("invite/")) {
      const inviteId = url.replace("invite/", "");
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
      return;
    }

    // Default fallback - redirect to home
    router.replace("/");
  }, [params]);

  return <View style={{ flex: 1, backgroundColor: colors.appBackground }} />;
}
