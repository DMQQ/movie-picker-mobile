import * as SecureStore from "expo-secure-store";
import React, { useEffect, useRef, useState } from "react";
import { AppState, AppStateStatus } from "react-native";
import { useSelector } from "react-redux";
import socketIOClient, { ManagerOptions, Socket, SocketOptions } from "socket.io-client";
import envs from "../constants/envs";
import { RootState } from "../redux/store";
import { EventEmitter, useEventEmitter } from "../service/useEventEmitter";

const isDev = envs.mode !== "production";

export const baseUrl = isDev ? "http://192.168.1.20:3000" : "https://flickmate.app";
export const url = baseUrl + "/api";

export const SocketContext = React.createContext<{
  socket: Socket | null;
  reconnect: () => void;
  emitter: EventEmitter<{ reconnected: () => void }>;
}>({
  socket: null,
  reconnect: () => {},

  emitter: new EventEmitter<{ reconnected: any }>(),
});

const connectionConfig = {
  transports: ["websocket"],
  auth: {
    token: `Bearer ${envs.server_auth_token}`,
  },
  path: "/socket.io",
  reconnection: true,
  reconnectionAttempts: 25,
  reconnectionDelay: 500,
  timeout: 10000,
  forceNew: false,
  multiplex: false,
  autoConnect: true,
  pingInterval: 5000,
  pingTimeout: 2500,
} as Partial<ManagerOptions & SocketOptions>;

const makeHeaders = (language: string) => {
  const headers = new Map<string, string>();
  headers.set("authorization", `Bearer ${envs.server_auth_token}`);
  headers.set("X-User-Language", language || "en");

  if (language === "pl") {
    headers.set("x-user-language", "pl-PL");
    headers.set("x-user-region", "PL");
    headers.set("x-user-timezone", "Europe/Warsaw");
    headers.set("x-user-watch-provider", "PL");
    headers.set("x-user-watch-region", "PL");
  } else {
    headers.set("x-user-language", "en-US");
    headers.set("x-user-region", "US");
    headers.set("x-user-timezone", "America/New_York");
    headers.set("x-user-watch-provider", "US");
    headers.set("x-user-watch-region", "US");
  }

  return Object.fromEntries(headers);
};

export const SocketProvider = ({ children, namespace }: { children: React.ReactNode; namespace: "/swipe" | "/voter" }) => {
  const language = useSelector((st: RootState) => st.room.language);
  const socketRef = useRef<Socket | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);
  const appState = useRef(AppState.currentState);
  const reconnectTimeout = useRef<NodeJS.Timeout | null>(null);
  const backgroundTimer = useRef<NodeJS.Timeout | null>(null);
  const wasConnected = useRef(false);

  const emitter = useEventEmitter<{ reconnected: any }>();

  const initializeSocket = async () => {
    try {
      const userId = (await SecureStore.getItemAsync("userId")) || Math.random().toString(36).substring(7);
      await SecureStore.setItemAsync("userId", userId);

      const newSocket = socketIOClient(baseUrl + namespace, {
        ...connectionConfig,
        extraHeaders: {
          "user-id": userId,
          ...makeHeaders(language),
        },
      });

      newSocket.on("connect", () => {
        console.log("✅ Socket connected successfully");

        wasConnected.current = true;
        socketRef.current = newSocket;
        setSocket(newSocket);
      });

      newSocket.on("disconnect", (reason) => {
        console.log("❌ Socket disconnected, reason:", reason);
        setSocket(null);
        socketRef.current = null;
        if (wasConnected.current && reason === "transport close") {
          console.log("🔄 Scheduling reconnect due to transport close");
          scheduleReconnect();
        }
      });

      newSocket.on("connect_error", (error) => {
        console.log("🚨 Socket connection error:", error);
        scheduleReconnect();
      });

      socketRef.current = newSocket;
    } catch (error) {}
  };

  const scheduleReconnect = () => {
    if (reconnectTimeout.current) {
      clearTimeout(reconnectTimeout.current);
    }
    reconnectTimeout.current = setTimeout(() => {
      reconnect();
    }, 500);
  };

  const handleAppStateChange = async (nextAppState: AppStateStatus) => {
    if (appState.current.match(/inactive|background/) && nextAppState === "active") {
      reconnect();
    }
    appState.current = nextAppState;
  };

  useEffect(() => {
    initializeSocket();

    const subscription = AppState.addEventListener("change", handleAppStateChange);

    return () => {
      subscription.remove();
      if (reconnectTimeout.current) clearTimeout(reconnectTimeout.current);
      if (backgroundTimer.current) clearTimeout(backgroundTimer.current);

      const s = socketRef.current;

      if (s) {
        s.removeAllListeners();
        if (s.connected) {
          s.emit("client_cleanup");
          s.disconnect();
        } else s.close();
      }
    };
  }, []);

  useEffect(() => {
    if (wasConnected.current && socket) {
      emitter.emit("reconnected", true);
    }
  }, [socket]);

  const reconnect = async () => {
    if (socketRef.current) {
      socketRef.current.connect();
    } else {
      initializeSocket();
    }
  };

  const memoizedValue = React.useMemo(() => ({ socket, reconnect, emitter }), [socket]);

  return <SocketContext.Provider value={memoizedValue}>{children}</SocketContext.Provider>;
};
