import { BaseQueryApi } from "@reduxjs/toolkit/query";
import * as Updates from "expo-updates";
import { Platform } from "react-native";
import envs from "../constants/envs";
import type { RootState } from "../redux/store";

export default function prepareHeaders(
  headers: Headers,
  { getState }: Pick<BaseQueryApi, "getState" | "extra" | "endpoint" | "type" | "forced">
) {
  headers.set("authorization", `Bearer ${envs.server_auth_token}`);

  headers.set("X-User-Language", (getState() as RootState)?.room?.language || "en");
  headers.set("x-platform", Platform.OS);

  const updateId = Updates.updateId;
  if (updateId) {
    headers.set("X-Update-Version", updateId);
    headers.set("x-update-manifest-id", Updates?.manifest?.id || "unknown");
  }

  const state = getState() as RootState;
  const userLanguage = state?.room?.language || "en";

  const defaultHeaders =
    userLanguage === "pl" || userLanguage === "pl-PL"
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

  const regionalization = Object.keys(state?.room?.regionalization).length > 0 ? state?.room?.regionalization : defaultHeaders;

  Object.entries(regionalization).forEach(([key, value]) => {
    headers.set(key, value);
  });

  return headers;
}
