import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import * as Sentry from "@sentry/react-native";
import { baseUrl } from "../../context/SocketContext";
import { AuthUser, authActions } from "./authSlice";
import prepareHeaders from "../../service/prepareHeaders";
import { createReportingBaseQuery } from "../baseQuery";

interface AuthResponse {
  token: string;
  refreshToken: string;
  user: AuthUser;
}

interface RegisterResponse extends AuthResponse {
  recoveryCodes: string[];
}

interface MeResponse {
  user: AuthUser;
}

interface RecoveryCodesResponse {
  recoveryCodes: string[];
}

interface DeviceUpdate {
  platform: string;
  pushNotificationToken: string | null;
  notificationsEnabled: boolean;
}

export const authApi = createApi({
  reducerPath: "authApi",
  baseQuery: createReportingBaseQuery("auth", fetchBaseQuery({
    baseUrl: baseUrl + "/api/auth",
    prepareHeaders,
  })),
  endpoints: (build) => ({
    login: build.mutation<AuthResponse, { email: string; password: string; anonymousId?: string }>({
      query: (body) => ({ url: "/login", method: "POST", body }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(authActions.setCredentials(data));
        } catch (err) {
          Sentry.captureException(err, { tags: { auth: "login" } });
        }
      },
    }),
    register: build.mutation<RegisterResponse, { name: string; email: string; password: string; anonymousId?: string }>({
      query: (body) => ({ url: "/register", method: "POST", body }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(authActions.setCredentials({ token: data.token, refreshToken: data.refreshToken, user: data.user }));
        } catch (err) {
          Sentry.captureException(err, { tags: { auth: "register" } });
        }
      },
    }),
    googleAuth: build.mutation<AuthResponse, { idToken: string }>({
      query: (body) => ({ url: "/oauth/google", method: "POST", body }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(authActions.setCredentials(data));
        } catch (err) {
          Sentry.captureException(err, { tags: { auth: "google" } });
        }
      },
    }),
    appleAuth: build.mutation<
      AuthResponse,
      { identityToken: string; fullName?: { givenName: string | null; familyName: string | null } | null }
    >({
      query: (body) => ({ url: "/oauth/apple", method: "POST", body }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(authActions.setCredentials(data));
        } catch (err) {
          Sentry.captureException(err, { tags: { auth: "apple" } });
        }
      },
    }),
    me: build.query<MeResponse, void>({
      query: () => "/me",
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(authActions.setUser(data.user));
        } catch (err) {
          Sentry.captureException(err, { tags: { auth: "me" } });
        }
      },
    }),
    recover: build.mutation<AuthResponse, { email: string; code: string }>({
      query: (body) => ({ url: "/recover", method: "POST", body }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(authActions.setCredentials(data));
        } catch (err) {
          Sentry.captureException(err, { tags: { auth: "recover" } });
        }
      },
    }),

    regenerateCodes: build.mutation<RecoveryCodesResponse, void>({
      query: () => ({ url: "/me/recovery-codes", method: "POST" }),
    }),

    updateDevice: build.mutation<{ ok: boolean }, DeviceUpdate>({
      query: (body) => ({ url: "/me/device", method: "PATCH", body }),
    }),

    refresh: build.mutation<AuthResponse, { refreshToken: string }>({
      query: (body) => ({ url: "/refresh", method: "POST", body }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(authActions.setCredentials(data));
        } catch (err) {
          Sentry.captureException(err, { tags: { auth: "refresh" } });
        }
      },
    }),

    deleteMe: build.mutation<{ ok: boolean }, void>({
      query: () => ({ url: "/me", method: "DELETE" }),
    }),

    updateMe: build.mutation<MeResponse, { name: string }>({
      query: (body) => ({ url: "/me", method: "PATCH", body }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(authActions.setUser(data.user));
        } catch (err) {
          Sentry.captureException(err, { tags: { auth: "updateMe" } });
        }
      },
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useGoogleAuthMutation,
  useAppleAuthMutation,
  useRecoverMutation,
  useRegenerateCodesMutation,
  useMeQuery,
  useRefreshMutation,
  useDeleteMeMutation,
  useUpdateMeMutation,
  useUpdateDeviceMutation,
} = authApi;
