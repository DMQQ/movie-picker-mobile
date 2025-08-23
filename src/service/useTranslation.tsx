import { useCallback } from "react";
import en from "../../translations/en.json";
import pl from "../../translations/pl.json";
import { useAppSelector } from "../redux/store";

const translations: Record<string, any> = { en, pl };

const getNestedValue = (obj: any, path: string): string => {
  const val = path.split(".").reduce((acc, key) => acc?.[key], obj);

  if (typeof val === "string") {
    return val;
  }

  console.warn(`Translation not found for key: ${path}`);

  return path;
};

export default function useTranslation() {
  const lang = useAppSelector((state) => state.room.language) || "en";

  return useCallback(
    (key: string, args?: Record<string, number | string | boolean>) => {
      const s = getNestedValue(translations[lang], key);

      if (!args) return s;

      return s.replace(/\{(\w+)\}/g, (_, k) => (k in args ? String(args[k]) : `{${k}}`));
    },
    [lang]
  );
}
