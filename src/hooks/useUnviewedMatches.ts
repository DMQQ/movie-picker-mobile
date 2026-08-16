import { useEffect, useRef } from "react";
import { router } from "expo-router";
import { useMatches } from "../context/DatabaseContext";
import { posthog } from "../constants/posthog";

export function useUnviewedMatches() {
  const { matches: matchesRepo, isReady } = useMatches();
  const hasChecked = useRef(false);

  useEffect(() => {
    if (isReady && matchesRepo && !hasChecked.current) {
      hasChecked.current = true;
      matchesRepo.hasUnviewedMatches().then((hasUnviewed) => {
        if (hasUnviewed) {
          posthog?.capture("unviewed_matches_shown");
          router.push("/unviewed-matches");
        }
      });
    }
  }, [isReady, matchesRepo]);
}
