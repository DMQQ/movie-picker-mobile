import * as Sentry from "@sentry/react-native";
import {
  fetchBaseQuery,
  type BaseQueryFn,
  type FetchArgs,
  type FetchBaseQueryError,
} from "@reduxjs/toolkit/query/react";
import type { BaseQueryApi } from "@reduxjs/toolkit/query";

// At most one Sentry event per (url, status) per 60s — survives server flaps
// and offline storms without flooding the dashboard.
const lastReported = new Map<string, number>();
const DEDUPE_MS = 60_000;

function reportNetworkError(
  endpointName: string,
  args: FetchArgs | string,
  api: BaseQueryApi,
  error: FetchBaseQueryError,
) {
  // 4xx are client errors the UI already handles (401 = session-expiry flow).
  if (
    typeof error.status === "number" &&
    error.status >= 400 &&
    error.status < 500
  ) {
    return;
  }

  const url =
    typeof args === "string"
      ? args
      : typeof args.url === "string"
        ? args.url
        : JSON.stringify(args.url);
  const method = typeof args === "string" ? "GET" : args.method ?? "GET";
  const statusKey =
    typeof error.status === "number" ? String(error.status) : error.status;

  const dedupeKey = `${method} ${url} | ${statusKey}`;
  const now = Date.now();
  if ((lastReported.get(dedupeKey) ?? 0) > now - DEDUPE_MS) return;
  lastReported.set(dedupeKey, now);

  Sentry.withScope((scope) => {
    scope.setTag("endpoint", endpointName);
    scope.setTag("http.status", statusKey);
    scope.setContext("network", {
      url,
      method,
      rtkEndpoint: api.endpoint,
      error: typeof error.status === "number" ? undefined : error.error,
    });
    Sentry.captureMessage(
      `API ${endpointName} failed: ${statusKey} (${method} ${url})`,
      "error",
    );
  });
}

export function createReportingBaseQuery(
  endpointName: string,
  baseQuery: ReturnType<typeof fetchBaseQuery>,
): BaseQueryFn<FetchArgs | string, unknown, FetchBaseQueryError> {
  return async (args, api, extraOptions) => {
    const result = await baseQuery(args, api, extraOptions);
    if (result.error) {
      reportNetworkError(endpointName, args, api, result.error);
    }
    return result;
  };
}
