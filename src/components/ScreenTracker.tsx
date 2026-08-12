import { useEffect } from "react";
import { usePathname } from "expo-router";
import { posthog } from "../constants/posthog";

const SCREEN_NAMES: Record<string, string> = {
  "/": "home",
  "/discover": "discover",
  "/favourites": "lists",
  "/search": "search",
  "/account": "profile",
};

export default function ScreenTracker() {
  const pathname = usePathname();

  useEffect(() => {
    posthog?.screen(SCREEN_NAMES[pathname] ?? pathname);
  }, [pathname]);

  return null;
}
