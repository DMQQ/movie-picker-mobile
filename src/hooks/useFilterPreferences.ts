import { useState, useEffect, useCallback } from "react";
import * as SecureStore from "expo-secure-store";

const FILTER_PREFERENCES_KEY = "room_builder_preferences";

interface FilterPreferences {
  providers: number[];
  savedAt: number;
}

export const useFilterPreferences = () => {
  const [preferences, setPreferences] = useState<FilterPreferences | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = useCallback(async () => {
    try {
      setIsLoading(true);
      const saved = await SecureStore.getItemAsync(FILTER_PREFERENCES_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as FilterPreferences;
        setPreferences(parsed);
        return parsed;
      }
      return null;
    } catch (error) {
      console.error("Failed to load filter preferences:", error);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const savePreferences = useCallback(async (newPreferences: Partial<FilterPreferences>) => {
    try {
      const toSave: FilterPreferences = {
        providers: newPreferences.providers || [],
        savedAt: Date.now(),
      };

      await SecureStore.setItemAsync(FILTER_PREFERENCES_KEY, JSON.stringify(toSave));
      setPreferences(toSave);
      return true;
    } catch (error) {
      console.error("Failed to save filter preferences:", error);
      return false;
    }
  }, []);

  const clearPreferences = useCallback(async () => {
    try {
      await SecureStore.deleteItemAsync(FILTER_PREFERENCES_KEY);
      setPreferences(null);
      return true;
    } catch (error) {
      console.error("Failed to clear filter preferences:", error);
      return false;
    }
  }, []);

  return {
    preferences,
    isLoading,
    loadPreferences,
    savePreferences,
    clearPreferences,
  };
};
