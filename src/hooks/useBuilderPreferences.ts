import { useState, useEffect, useCallback } from "react";
import { AsyncStorage } from "expo-sqlite/kv-store";

const PREFERENCES_KEY = "room_builder_preferences";

interface BuilderPreferences {
  providers: number[];
  savedAt: number;
}

export const useBuilderPreferences = () => {
  const [preferences, setPreferences] = useState<BuilderPreferences | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load preferences on mount
  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = useCallback(async () => {
    try {
      setIsLoading(true);
      const saved = await AsyncStorage.getItem(PREFERENCES_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as BuilderPreferences;
        setPreferences(parsed);
        return parsed;
      }
      return null;
    } catch (error) {
      console.error("Failed to load builder preferences:", error);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const savePreferences = useCallback(async (newPreferences: Partial<BuilderPreferences>) => {
    try {
      const toSave: BuilderPreferences = {
        providers: newPreferences.providers || [],
        savedAt: Date.now(),
      };

      await AsyncStorage.setItem(PREFERENCES_KEY, JSON.stringify(toSave));
      setPreferences(toSave);
      return true;
    } catch (error) {
      console.error("Failed to save builder preferences:", error);
      return false;
    }
  }, []);

  const clearPreferences = useCallback(async () => {
    try {
      await AsyncStorage.removeItem(PREFERENCES_KEY);
      setPreferences(null);
      return true;
    } catch (error) {
      console.error("Failed to clear builder preferences:", error);
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
