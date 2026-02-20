import { useCallback } from "react";
import en from "../../translations/en.json";
import pl from "../../translations/pl.json";
import { useAppSelector } from "../redux/store";

const translations: Record<string, any> = { en, pl };

const getNestedValue = <T extends string | string[]>(obj: any, path: string): T => {
  const val = path.split(".").reduce((acc, key) => acc?.[key], obj);

  if (typeof val === "string") {
    return val as T;
  }

  if (Array.isArray(val)) {
    return val as T;
  }

  console.warn(`Translation not found for key: ${path}`);

  return path as T;
};

export default function useTranslation() {
  const lang = useAppSelector((state) => state.room.language) || "en";

  return useCallback(
    (key: string, args?: Record<string, number | string | boolean>): string => {
      const val = getNestedValue(translations[lang], key);

      if (Array.isArray(val)) {
        // @ts-ignore
        return val;
      }

      if (!args) return val;

      return val.replace(/\{(\w+)\}/g, (_, k) => (k in args ? String(args[k]) : `{${k}}`));
    },
    [lang],
  );
}
