import { useAppSelector } from "../redux/store";
import en from "../../translations/en.json";
import pl from "../../translations/pl.json";

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

  return (key: string) => {
    return getNestedValue(translations[lang], key);
  };
}
