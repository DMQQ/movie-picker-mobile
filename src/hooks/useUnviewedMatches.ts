import { useEffect, useRef } from "react";
import { router } from "expo-router";
import { useMatches } from "../context/DatabaseContext";

export function useUnviewedMatches() {
  const { matches: matchesRepo, isReady } = useMatches();
  const hasChecked = useRef(false);

  useEffect(() => {
    if (isReady && matchesRepo && !hasChecked.current) {
      hasChecked.current = true;
      matchesRepo.hasUnviewedMatches().then((hasUnviewed) => {
        if (hasUnviewed) {
          router.push("/unviewed-matches");
        }
      });
    }
  }, [isReady, matchesRepo]);
}
