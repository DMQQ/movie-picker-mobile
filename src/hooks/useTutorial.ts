import { useIsFocused } from "expo-router";
import { AsyncStorage } from "expo-sqlite/kv-store";
import { useCallback, useEffect, useState } from "react";

export function useTutorialSeen(key: string) {
  const [seen, setSeen] = useState<boolean | null>(null);
  const isFocused = useIsFocused();

  useEffect(() => {
    AsyncStorage.getItem(key).then(val => setSeen(val === "1"));
  }, [key]);

  const markSeen = useCallback(async () => {
    await AsyncStorage.setItem(key, "1");
    setSeen(true);
  }, [key]);

  return { seen: isFocused ? seen : null, markSeen };
}
