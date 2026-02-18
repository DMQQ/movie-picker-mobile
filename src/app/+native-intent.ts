import { router } from "expo-router";

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
        pathname: "/voter/[sessionId]",
        params: { sessionId: value.toUpperCase() },
      });
      return "/voter/[sessionId]";

    default:
      return undefined;
  }
}
