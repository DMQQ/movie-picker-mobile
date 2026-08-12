import {
  fetchBaseQuery,
  type BaseQueryFn,
  type FetchArgs,
  type FetchBaseQueryError,
} from "@reduxjs/toolkit/query/react";
import type { BaseQueryApi } from "@reduxjs/toolkit/query";
import { authActions } from "./auth/authSlice";
import { baseUrl } from "../context/SocketContext";
import { posthog } from "../constants/posthog";

const lastReported = new Map<string, number>();
const DEDUPE_MS = 60_000;

let refreshPromise: Promise<{ token: string; refreshToken: string } | null> | null = null;

function reportNetworkError(
  endpointName: string,
  args: FetchArgs | string,
  api: BaseQueryApi,
  error: FetchBaseQueryError,
) {
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

  posthog?.captureException(
    new Error(`API ${endpointName} failed: ${statusKey} (${method} ${url})`),
    {
      endpoint: endpointName,
      http_status: statusKey,
      url,
      method,
      rtk_endpoint: api.endpoint,
      network_error: typeof error.status === "number" ? null : error.error ?? null,
    },
  );
}

async function tryRefresh(refreshToken: string): Promise<{ token: string; refreshToken: string } | null> {
  try {
    const res = await fetch(`${baseUrl}/api/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return { token: data.token, refreshToken: data.refreshToken };
  } catch {
    return null;
  }
}

export function createReportingBaseQuery(
  endpointName: string,
  baseQuery: ReturnType<typeof fetchBaseQuery>,
): BaseQueryFn<FetchArgs | string, unknown, FetchBaseQueryError> {
  return async (args, api, extraOptions) => {
    const result = await baseQuery(args, api, extraOptions);
    if (result.error) {
      reportNetworkError(endpointName, args, api, result.error);
      if (
        result.error.status === 403 &&
        (result.error.data as { message?: string })?.message ===
          "Full account required"
      ) {
        api.dispatch(authActions.setAnonymousBlocked());
      }

      // Try token refresh on 401
      if (result.error.status === 401) {
        const state = api.getState() as {
          auth: { refreshToken: string | null; token: string | null; wasRealAccount: boolean };
        };
        const storedRefreshToken = state.auth.refreshToken;

        if (storedRefreshToken) {
          if (!refreshPromise) {
            refreshPromise = tryRefresh(storedRefreshToken).finally(() => {
              refreshPromise = null;
            });
          }

          const newTokens = await refreshPromise;

          if (newTokens) {
            api.dispatch(authActions.setToken({ token: newTokens.token, refreshToken: newTokens.refreshToken }));
            // Retry the original request with the new token
            return baseQuery(args, api, extraOptions);
          }
        }

        // Only flag session expired for real accounts — anonymous users just need a fresh token
        if (state.auth.wasRealAccount) {
          api.dispatch(authActions.setSessionExpired());
        }
        api.dispatch(authActions.clearAuth());
      }
    }
    return result;
  };
}
