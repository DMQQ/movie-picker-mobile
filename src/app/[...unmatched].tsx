import { Redirect, router, useLocalSearchParams } from "expo-router";
import { useEffect } from "react";
import { View } from "react-native";

export default function Unmatched() {
  const params = useLocalSearchParams();

  useEffect(() => {
    const url = Array.isArray(params.unmatched) ? params.unmatched.join("/") : params.unmatched || "";

    if (url.startsWith("swipe/")) {
      const roomId = url.replace("swipe/", "");
      router.replace({
        pathname: "/room/[roomId]",
        params: { roomId },
      });
      return;
    }

    if (url.startsWith("voter/")) {
      const sessionId = url.replace("voter/", "");
      router.replace({
        pathname: "/voter/[sessionId]",
        params: { sessionId },
      });
      return;
    }
  }, [params]);

  const url = Array.isArray(params.unmatched) ? params.unmatched.join("/") : params.unmatched;

  return <Redirect href="/(tabs)" />;
}
