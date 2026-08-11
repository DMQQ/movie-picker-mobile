import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import * as SecureStore from "expo-secure-store";
import { baseUrl } from "../../context/SocketContext";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  provider: string;
  avatarUrl: string | null;
}

interface AuthState {
  token: string | null;
  refreshToken: string | null;
  user: AuthUser | null;
  sessionExpired: boolean;
  anonymousBlocked: boolean;
}

const initialState: AuthState = {
  token: null,
  refreshToken: null,
  user: null,
  sessionExpired: false,
  anonymousBlocked: false,
};

export const restoreSession = createAsyncThunk(
  "auth/restoreSession",
  async (
    { token, refreshToken }: { token: string; refreshToken: string | null },
    { rejectWithValue },
  ) => {
    const url = `${baseUrl}/api/auth/me`;
    let res: Response;
    try {
      res = await fetch(url, {
        headers: { authorization: `Bearer ${token}` },
      });
    } catch {
      throw new Error("Network error");
    }
    if (res.ok) {
      const { user } = await res.json();
      return { token, refreshToken, user };
    }
    if (res.status !== 401) {
      throw new Error(`Restore failed: ${res.status}`);
    }

    // Token expired — try refresh if we have a refresh token
    if (!refreshToken) {
      await SecureStore.deleteItemAsync("user_auth_token");
      return rejectWithValue("expired");
    }

    try {
      const refreshRes = await fetch(`${baseUrl}/api/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      });
      if (!refreshRes.ok) throw new Error("Refresh failed");
      const { token: newToken, refreshToken: newRefreshToken, user } = await refreshRes.json();
      await SecureStore.setItemAsync("user_auth_token", newToken);
      if (newRefreshToken) await SecureStore.setItemAsync("user_refresh_token", newRefreshToken);
      return { token: newToken, refreshToken: newRefreshToken, user };
    } catch {
      await SecureStore.deleteItemAsync("user_auth_token");
      await SecureStore.deleteItemAsync("user_refresh_token");
      return rejectWithValue("expired");
    }
  },
);

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials(
      state,
      action: PayloadAction<{ token: string; refreshToken?: string; user: AuthUser }>,
    ) {
      state.token = action.payload.token;
      if (action.payload.refreshToken) state.refreshToken = action.payload.refreshToken;
      state.user = action.payload.user;
      state.sessionExpired = false;
    },
    setUser(state, action: PayloadAction<AuthUser>) {
      state.user = action.payload;
    },
    setToken(state, action: PayloadAction<{ token: string; refreshToken?: string }>) {
      state.token = action.payload.token;
      if (action.payload.refreshToken) state.refreshToken = action.payload.refreshToken;
    },
    clearAuth(state) {
      state.token = null;
      state.refreshToken = null;
      state.user = null;
      state.sessionExpired = false;
    },
    setSessionExpired(state) {
      state.sessionExpired = true;
    },
    setAnonymousBlocked(state) {
      state.anonymousBlocked = true;
    },
    clearAnonymousBlocked(state) {
      state.anonymousBlocked = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(restoreSession.fulfilled, (state, action) => {
        state.token = action.payload.token;
        state.refreshToken = action.payload.refreshToken ?? state.refreshToken;
        state.user = action.payload.user;
        state.sessionExpired = false;
      })
      .addCase(restoreSession.rejected, (state, action) => {
        if (action.payload === "expired") state.sessionExpired = true;
      });
  },
});

export const authActions = authSlice.actions;
