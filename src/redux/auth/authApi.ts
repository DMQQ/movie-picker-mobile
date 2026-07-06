import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { baseUrl } from "../../context/SocketContext";
import { AuthUser, authActions } from "./authSlice";
import { RootState } from "../store";

interface AuthResponse {
  token: string;
  user: AuthUser;
}

interface MeResponse {
  user: AuthUser;
}

export const authApi = createApi({
  reducerPath: "authApi",
  baseQuery: fetchBaseQuery({
    baseUrl: baseUrl + "/api/auth",
    prepareHeaders(headers, { getState }) {
      const token = (getState() as RootState).auth.token;
      if (token) headers.set("authorization", `Bearer ${token}`);
      return headers;
    },
  }),
  endpoints: (build) => ({
    login: build.mutation<AuthResponse, { email: string; password: string }>({
      query: (body) => ({ url: "/login", method: "POST", body }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(authActions.setCredentials(data));
        } catch {}
      },
    }),
    register: build.mutation<AuthResponse, { name: string; email: string; password: string }>({
      query: (body) => ({ url: "/register", method: "POST", body }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(authActions.setCredentials(data));
        } catch {}
      },
    }),
    googleAuth: build.mutation<AuthResponse, { idToken: string }>({
      query: (body) => ({ url: "/oauth/google", method: "POST", body }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(authActions.setCredentials(data));
        } catch {}
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
        } catch {}
      },
    }),
    me: build.query<MeResponse, void>({
      query: () => "/me",
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(authActions.setUser(data.user));
        } catch {}
      },
    }),
    deleteMe: build.mutation<{ ok: boolean }, void>({
      query: () => ({ url: "/me", method: "DELETE" }),
    }),

    updateMe: build.mutation<MeResponse, FormData>({
      queryFn: (body, { getState }) => {
        const token = (getState() as RootState).auth.token;
        return new Promise((resolve) => {
          const xhr = new XMLHttpRequest();
          xhr.open("PATCH", `${baseUrl}/api/auth/me`);
          xhr.setRequestHeader("Authorization", `Bearer ${token}`);
          xhr.onload = () => {
            try {
              const data = JSON.parse(xhr.responseText);
              console.log("[Avatar] XHR response:", xhr.status, data);
              if (xhr.status >= 200 && xhr.status < 300) resolve({ data });
              else resolve({ error: { status: xhr.status, data } });
            } catch {
              console.log("[Avatar] XHR parse error:", xhr.responseText);
              resolve({ error: { status: "PARSING_ERROR", error: xhr.responseText } });
            }
          };
          xhr.onerror = () => {
            console.log("[Avatar] XHR network error");
            resolve({ error: { status: "FETCH_ERROR", error: "Network error" } });
          };
          xhr.send(body);
        });
      },
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(authActions.setUser(data.user));
        } catch {}
      },
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useGoogleAuthMutation,
  useAppleAuthMutation,
  useMeQuery,
  useDeleteMeMutation,
  useUpdateMeMutation,
} = authApi;
