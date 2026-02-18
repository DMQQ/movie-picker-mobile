import { useEffect, useCallback } from "react";
import { useAppDispatch, useAppSelector } from "../redux/store";
import {
  loadFilterPreferences,
  saveFilterPreferences,
  clearFilterPreferences,
  selectFilterPreferences,
  selectFilterPreferencesLoading,
  selectFilterPreferencesHydrated,
} from "../redux/filterPreferences/filterPreferencesSlice";

interface FilterPreferences {
  providers: number[];
  savedAt: number;
}

export const useFilterPreferences = () => {
  const dispatch = useAppDispatch();

  const preferences = useAppSelector(selectFilterPreferences);
  const isLoading = useAppSelector(selectFilterPreferencesLoading);
  const hydrated = useAppSelector(selectFilterPreferencesHydrated);

  // Hydrate Redux on first load
  useEffect(() => {
    if (!hydrated) {
      dispatch(loadFilterPreferences());
    }
  }, [hydrated, dispatch]);

  const loadPreferences = useCallback(async () => {
    const result = await dispatch(loadFilterPreferences()).unwrap();
    return result;
  }, [dispatch]);

  const savePreferences = useCallback(
    async (newPreferences: Partial<FilterPreferences>) => {
      try {
        await dispatch(saveFilterPreferences(newPreferences)).unwrap();
        return true;
      } catch {
        return false;
      }
    },
    [dispatch]
  );

  const clearPreferences = useCallback(async () => {
    try {
      await dispatch(clearFilterPreferences()).unwrap();
      return true;
    } catch {
      return false;
    }
  }, [dispatch]);

  return {
    preferences,
    isLoading,
    loadPreferences,
    savePreferences,
    clearPreferences,
  };
};
