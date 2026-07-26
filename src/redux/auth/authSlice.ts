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
}

const initialState: AuthState = {
  token: null,
  user: null,
  sessionExpired: false,
};

export const restoreSession = createAsyncThunk(
  "auth/restoreSession",
  async (token: string) => {
    const res = await fetch(`${baseUrl}/api/auth/me`, {
      headers: { authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      const { user } = await res.json();
      return { token, user };
    }
    await SecureStore.deleteItemAsync("user_auth_token");
    throw new Error("Session expired");
  },
);

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials(state, action: PayloadAction<{ token: string; user: AuthUser }>) {
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
  },
  extraReducers: (builder) => {
    builder
      .addCase(restoreSession.fulfilled, (state, action) => {
        state.token = action.payload.token;
        state.user = action.payload.user;
        state.sessionExpired = false;
      })
      .addCase(restoreSession.rejected, (state) => {
        state.sessionExpired = true;
      });
  },
});

export const authActions = authSlice.actions;
