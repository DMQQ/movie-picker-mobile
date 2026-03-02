import { AsyncStorage } from "expo-sqlite/kv-store";
import * as Updates from "expo-updates";
import React, { useEffect, useRef, useState } from "react";
import { AppState, AppStateStatus, Platform } from "react-native";
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
  userId: string | null;
}>({
  socket: null,
  reconnect: () => {},
  userId: "",
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

const makeHeaders = (appLanguage: string, regionalization: Record<string, string> = {}) => {
  const headers = new Map<string, string>();
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

  return Object.fromEntries(headers);
};

export const SocketProvider = ({ children, namespace }: { children: React.ReactNode; namespace: "/swipe" | "/voter" }) => {
  const language = useSelector((st: RootState) => st.room.language);
  const regionalization = useSelector((st: RootState) => st.room.regionalization) || {};
  const socketRef = useRef<Socket | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);
  const appState = useRef(AppState.currentState);
  const reconnectTimeout = useRef<NodeJS.Timeout | null>(null);
  const backgroundTimer = useRef<NodeJS.Timeout | null>(null);
  const wasConnected = useRef(false);
  const [userId, setUserId] = useState<string | null>(null);

  const emitter = useEventEmitter<{ reconnected: any }>();

  const initializeSocket = async () => {
    try {
      const userId = (await AsyncStorage.getItem("userId")) || Math.random().toString(36).substring(7);
      await AsyncStorage.setItem("userId", userId);

      setUserId(userId);

      const newSocket = socketIOClient(baseUrl + namespace, {
        ...connectionConfig,
        extraHeaders: {
          "user-id": userId,
          ...makeHeaders(language, regionalization),
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
        try {
          if (s.connected) {
            s.emit("client_cleanup");
          }
          s.disconnect();
        } catch {}
        s.removeAllListeners();
      }
    };
  }, [language, regionalization]);

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

  const memoizedValue = React.useMemo(() => ({ socket, reconnect, emitter, userId }), [socket, userId]);

  return <SocketContext.Provider value={memoizedValue}>{children}</SocketContext.Provider>;
};
