import { useCallback } from "react";
import { useAppSelector } from "../redux/store";
import { translate } from "./translationUtils";

export default function useTranslation() {
  const lang = useAppSelector((state) => state.room.language) || "en";

  return useCallback(
    (key: string, args?: Record<string, number | string | boolean>): string =>
      translate(lang, key, args),
    [lang],
  );
}
