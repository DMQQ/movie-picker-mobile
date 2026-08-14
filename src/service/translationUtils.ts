import en from "../../translations/en.json";
import pl from "../../translations/pl.json";
import de from "../../translations/de.json";
import es from "../../translations/es.json";
import pt from "../../translations/pt.json";

import * as Localization from "expo-localization";

const translations: Record<string, any> = { en, pl, de, es, pt };

export const isAvailable = (language: string) =>
  translations[language] !== undefined;

const LANGUAGE_TO_LOCALE: Record<string, string> = {
  en: "en-US",
  pl: "pl-PL",
  de: "de-DE",
  es: "es-ES",
  pt: "pt-PT",
};

export const getLocaleForLanguage = (language: string) =>
  LANGUAGE_TO_LOCALE[language] ?? LANGUAGE_TO_LOCALE.en;

export function getDeviceSettings() {
  const locales = Localization.getLocales();
  const calendars = Localization.getCalendars();
  const deviceLocale = locales[0];
  const deviceCalendar = calendars[0];

  const detectedLanguage = deviceLocale?.languageCode || "en";
  const language = isAvailable(detectedLanguage) ? detectedLanguage : "en";
  const regionCode = deviceLocale?.regionCode || "US";
  const languageTag = `${deviceLocale?.languageCode || "en"}-${regionCode || "US"}`;

  return {
    language,
    nickname: language === "pl" ? "Gość" : "Guest",
    regionalization: {
      "x-device-language": languageTag,
      "x-user-region": regionCode || "US",
      "x-user-watch-provider": regionCode || "US",
      "x-user-watch-region": regionCode || "US",
      "x-user-timezone": deviceCalendar?.timeZone || "America/New_York",
    },
  };
}

const getNestedValue = <T extends string | string[]>(
  obj: any,
  path: string,
): T => {
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

/** Non-hook translate for use outside React (slices, services). */
export function translate(
  language: string,
  key: string,
  args?: Record<string, number | string | boolean>,
): string {
  const dict = translations[language] ?? translations.en;
  let val = getNestedValue(dict, key);

  if (val === key && language !== "en") {
    // Missing key in the active language — fall back to English before
    // surfacing the raw key.
    val = getNestedValue(translations.en, key);
  }

  if (Array.isArray(val)) {
    // @ts-ignore
    return val;
  }

  if (!args) return val;

  return val.replace(/\{(\w+)\}/g, (_, k) =>
    k in args ? String(args[k]) : `{${k}}`,
  );
}
