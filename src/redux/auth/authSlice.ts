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
  user: AuthUser | null;
  sessionExpired: boolean;
  anonymousBlocked: boolean;
}

const initialState: AuthState = {
  token: null,
  user: null,
  sessionExpired: false,
  anonymousBlocked: false,
};

export const restoreSession = createAsyncThunk(
  "auth/restoreSession",
  async (token: string, { rejectWithValue }) => {
    const url = `${baseUrl}/api/auth/me`;
    let res: Response;
    try {
      res = await fetch(url, {
        headers: { authorization: `Bearer ${token}` },
      });
    } catch {
      // Offline at boot — keep the stored token, retry next launch.
      throw new Error("Network error");
    }
    if (res.ok) {
      const { user } = await res.json();
      return { token, user };
    }
    if (res.status === 401) {
      // Token revoked/expired — the only case that ends the session.
      await SecureStore.deleteItemAsync("user_auth_token");
      return rejectWithValue("expired");
    }
    // 5xx / maintenance — token is still valid, don't destroy it.
    throw new Error(`Restore failed: ${res.status}`);
  },
);

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials(
      state,
      action: PayloadAction<{ token: string; user: AuthUser }>,
    ) {
      state.token = action.payload.token;
      state.user = action.payload.user;
      state.sessionExpired = false;
    },
    setUser(state, action: PayloadAction<AuthUser>) {
      state.user = action.payload;
    },
    clearAuth(state) {
      state.token = null;
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
        state.user = action.payload.user;
        state.sessionExpired = false;
      })
      .addCase(restoreSession.rejected, (state, action) => {
        if (action.payload === "expired") state.sessionExpired = true;
      });
  },
});

export const authActions = authSlice.actions;
