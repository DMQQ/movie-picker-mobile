import { useCallback, useEffect, useState } from "react";
import { Alert } from "react-native";
import { AsyncStorage } from "expo-sqlite/kv-store";
import { useAppDispatch, useAppSelector } from "../redux/store";
import { loadFavorites } from "../redux/favourites/favourites";
import { useMigrateLibrary } from "./useMigrateLibrary";
import useTranslation from "../service/useTranslation";

const MIGRATION_OFFERED_KEY = "migration_prompt_offered";

export function useMigrationPrompt() {
  const token = useAppSelector((s) => s.auth.token);
  const user = useAppSelector((s) => s.auth.user);
  const isFullAccount = !!token && !!user && user.provider !== "anonymous";
  const dispatch = useAppDispatch();
  const t = useTranslation();
  const { migrateLibrary, getLocalDataCount, isLoading: isMigrating } = useMigrateLibrary();

  const [showModal, setShowModal] = useState(false);
  const [showBanner, setShowBanner] = useState(false);
  const [counts, setCounts] = useState({ movies: 0, interactions: 0 });

  useEffect(() => {
    if (!isFullAccount) return;
    (async () => {
      const { movies, interactions } = await getLocalDataCount();
      if (movies === 0 && interactions === 0) return;
      setCounts({ movies, interactions });
      setShowBanner(true);
      const alreadyOffered = await AsyncStorage.getItem(MIGRATION_OFFERED_KEY);
      if (!alreadyOffered) {
        await AsyncStorage.setItem(MIGRATION_OFFERED_KEY, "1");
        setShowModal(true);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFullAccount]);

  const migrate = useCallback(async () => {
    try {
      await migrateLibrary();
      setShowModal(false);
      setShowBanner(false);
      dispatch(loadFavorites());

      const total = counts.movies + counts.interactions;
      const message =
        total > 150
          ? (t("migration.successLarge") as string)
          : (t("migration.success") as string);
      Alert.alert("Done", message);
    } catch {
      setShowModal(false);
    }
  }, [migrateLibrary, dispatch, counts, t]);

  const dismissModal = useCallback(() => setShowModal(false), []);
  const dismissBanner = useCallback(() => setShowBanner(false), []);

  return { showModal, showBanner, counts, isMigrating, migrate, dismissModal, dismissBanner };
}
