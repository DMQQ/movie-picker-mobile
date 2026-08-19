import { router, useLocalSearchParams } from "expo-router";
import { useEffect } from "react";
import { View } from "react-native";
import { colors } from "../constants/design";
import { handleInviteDeeplink } from "../utils/inviteRouter";

export default function Unmatched() {
  const params = useLocalSearchParams();

  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;

    const url = Array.isArray(params.unmatched) ? params.unmatched.join("/") : params.unmatched || "";

    console.log("Unmatched route detected:", { url, params });

    if (url.startsWith("swipe/")) {
      const roomId = url.replace("swipe/", "");
      router.replace({
        pathname: "/room/[roomId]",
        params: { roomId: roomId.toUpperCase() },
      });
    } else if (url.startsWith("voter/")) {
      const sessionId = url.replace("voter/", "");
      router.replace({
        pathname: "/voter",
        params: { sessionId: sessionId.toUpperCase() },
      });
    } else if (url.startsWith("either-or/")) {
      const roomId = url.replace("either-or/", "");
      router.replace({
        pathname: "/either-or/[roomId]",
        params: { roomId: roomId.toUpperCase() },
      });
    } else if (url.startsWith("create-room")) {
      router.replace({
        pathname: "/room/qr-code",
        params: { quickStart: "true" },
      });
    } else if (url.startsWith("invite/")) {
      const inviteId = url.replace("invite/", "");
      handleInviteDeeplink(inviteId, undefined, signal);
    } else {
      router.replace("/");
    }

    return () => controller.abort();
  }, [params]);

  return <View style={{ flex: 1, backgroundColor: colors.appBackground }} />;
}
