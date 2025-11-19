import * as Updates from "expo-updates";
import { Platform } from "react-native";
import envs from "../constants/envs";
import * as SecureStore from "expo-secure-store";

const language = SecureStore.getItem("language") || "en";
const regionalization = (JSON.parse(SecureStore.getItem("regionalization") ?? "{}") || {}) as Record<string, string>;

export default function prepareHeaders(headers: Headers) {
  headers.set("authorization", `Bearer ${envs.server_auth_token}`);
  headers.set("x-platform", Platform.OS);

  const updateId = Updates.updateId;
  if (updateId) {
    headers.set("X-Update-Version", updateId);
    headers.set("x-update-manifest-id", Updates?.manifest?.id || "unknown");
  }

  const userLanguage = language === "pl" || language === "pl-PL" ? "pl-PL" : "en-US";

  const defaultHeaders =
    userLanguage === "pl-PL"
      ? {
          "x-user-language": "pl-PL",
          "x-user-region": "PL",
          "x-user-timezone": "Europe/Warsaw",
          "x-user-watch-provider": "PL",
          "x-user-watch-region": "PL",
        }
      : {
          "x-user-language": "en-US",
          "x-user-region": "US",
          "x-user-timezone": "America/New_York",
          "x-user-watch-provider": "US",
          "x-user-watch-region": "US",
        };

  Object.entries(Object.keys(regionalization || {}).length > 0 ? regionalization : defaultHeaders).forEach(([key, value]) => {
    headers.set(key, value);
  });

  headers.set("x-user-language", userLanguage);

  return headers;
}
