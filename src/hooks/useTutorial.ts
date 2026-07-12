import { AsyncStorage } from "expo-sqlite/kv-store";
import { useCallback, useEffect, useState } from "react";

export function useTutorialSeen(key: string) {
  const [seen, setSeen] = useState<boolean | null>(null);

  useEffect(() => {
    AsyncStorage.getItem(key).then(val => setSeen(val === "1"));
  }, [key]);

  const markSeen = useCallback(async () => {
    await AsyncStorage.setItem(key, "1");
    setSeen(true);
  }, [key]);

  return { seen, markSeen };
}
