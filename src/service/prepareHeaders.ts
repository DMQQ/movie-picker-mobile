import * as Updates from "expo-updates";
import { Platform } from "react-native";
import envs from "../constants/envs";
import { BaseQueryApi } from "@reduxjs/toolkit/query";
import { RootState } from "../redux/store";

export default function prepareHeaders(headers: Headers, { getState }: Pick<BaseQueryApi, "getState">) {
  const state = getState() as RootState;

  const appLanguage = state.room.language || "en";
  const regionalization = state.room.regionalization || {};
  const userLanguage = appLanguage === "pl" ? "pl-PL" : "en-US";

  headers.set("authorization", `Bearer ${envs.server_auth_token}`);
  headers.set("x-platform", Platform.OS);
  headers.set("x-app-language", appLanguage);

  const updateId = Updates.updateId;
  if (updateId) {
    headers.set("X-Update-Version", updateId);
    headers.set("x-update-manifest-id", Updates?.manifest?.id || "unknown");
  }

  // Set all regionalization headers from device settings
  Object.entries(regionalization).forEach(([key, value]) => {
    headers.set(key, value);
  });

  // x-user-language is always pl-PL or en-US based on app language
  headers.set("x-user-language", userLanguage);

  return headers;
}
