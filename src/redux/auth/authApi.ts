import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { baseUrl } from "../../context/SocketContext";
import { AuthUser, authActions } from "./authSlice";
import { setUserId } from "../app/appSlice";
import prepareHeaders from "../../service/prepareHeaders";
import { createReportingBaseQuery } from "../baseQuery";
import { posthog } from "../../constants/posthog";

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

const saveAuthUserId = (dispatch: any, user: AuthUser) => {
  dispatch(setUserId(user.id));
};

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
          await saveAuthUserId(dispatch, data.user);
          posthog?.capture("sign_in", { provider: "email" });
        } catch (err) {
          posthog?.captureException(err, { auth: "login" });
        }
      },
    }),
    register: build.mutation<RegisterResponse, { name: string; email: string; password: string; anonymousId?: string }>({
      query: (body) => ({ url: "/register", method: "POST", body }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(authActions.setCredentials({ token: data.token, refreshToken: data.refreshToken, user: data.user }));
          await saveAuthUserId(dispatch, data.user);
          posthog?.capture("sign_up_completed", { provider: "email" });
        } catch (err) {
          posthog?.captureException(err, { auth: "register" });
        }
      },
    }),
    googleAuth: build.mutation<AuthResponse, { idToken: string }>({
      query: (body) => ({ url: "/oauth/google", method: "POST", body }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(authActions.setCredentials(data));
          await saveAuthUserId(dispatch, data.user);
        } catch (err) {
          posthog?.captureException(err, { auth: "google" });
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
          await saveAuthUserId(dispatch, data.user);
        } catch (err) {
          posthog?.captureException(err, { auth: "apple" });
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
          posthog?.captureException(err, { auth: "me" });
        }
      },
    }),
    recover: build.mutation<AuthResponse, { email: string; code: string }>({
      query: (body) => ({ url: "/recover", method: "POST", body }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(authActions.setCredentials(data));
          await saveAuthUserId(dispatch, data.user);
          posthog?.capture("sign_in", { provider: "recovery" });
        } catch (err) {
          posthog?.captureException(err, { auth: "recover" });
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
          await saveAuthUserId(dispatch, data.user);
        } catch (err) {
          posthog?.captureException(err, { auth: "refresh" });
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
          posthog?.captureException(err, { auth: "updateMe" });
        }
      },
    }),

    changePassword: build.mutation<{ ok: boolean }, { newPassword: string; currentPassword?: string }>({
      query: (body) => ({ url: "/me/password", method: "PATCH", body }),
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
  useChangePasswordMutation,
} = authApi;
