import { AsyncStorage } from "expo-sqlite/kv-store";
import { useCallback, useEffect, useState } from "react";
import { tutorialActions, TutorialKey, TUTORIAL_KEYS } from "../redux/tutorial/tutorialSlice";
import { useAppDispatch, useAppSelector } from "../redux/store";
import { useIsFocused } from "expo-router";

export function useStableFocus(ms: number): boolean {
  const isFocused = useIsFocused();
  const [stable, setStable] = useState(false);

  useEffect(() => {
    if (!isFocused) {
      setStable(false);
      return;
    }
    const t = setTimeout(() => setStable(true), ms);
    return () => clearTimeout(t);
  }, [isFocused, ms]);

  return stable;
}

export function useTutorialSeen(key: TutorialKey) {
  const dispatch = useAppDispatch();
  const loaded = useAppSelector((s) => s.tutorial.loaded);
  const seen = useAppSelector((s) => s.tutorial.seen[key]);

  const markSeen = useCallback(async () => {
    dispatch(tutorialActions.markSeen(key));
    await AsyncStorage.setItem(key, "1");
  }, [dispatch, key]);

  // Return null while the bulk load hasn't resolved yet (prevents flash)
  return { seen: loaded ? seen : null, markSeen };
}

export function useMarkAllTutorialsSeen() {
  const dispatch = useAppDispatch();
  return useCallback(async () => {
    dispatch(tutorialActions.markAllSeen());
    await AsyncStorage.multiSet(TUTORIAL_KEYS.map((k) => [k, "1"]));
  }, [dispatch]);
}
