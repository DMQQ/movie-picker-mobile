import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect, useRef, useState } from "react";
import { AppState, AppStateStatus, Platform } from "react-native";
import { useSelector } from "react-redux";
import socketIOClient, { ManagerOptions, Socket, SocketOptions } from "socket.io-client";
import { RootState } from "../redux/store";

const isDev = process.env.EXPO_PUBLIC_ENV !== "production";
const BACKGROUND_TIMEOUT = 5 * 60 * 1000; // 5 minutes

const baseUrl = isDev ? "http://192.168.1.20:3000" : "https://movie.dmqq.dev";
export const url = baseUrl + "/api";

export const SocketContext = React.createContext<{
  socket: Socket | null;
  reconnect: () => void;
}>({
  socket: null,
  reconnect: () => {},
});

const connectionConfig = {
  transports: ["websocket"],
  auth: {
    token: `Bearer ${(process.env as any).EXPO_PUBLIC_API_KEY}`,
  },
  path: "/socket.io",
  reconnection: true,
  reconnectionAttempts: 10,
  reconnectionDelay: 1000,
  timeout: 20000,
  forceNew: false,
  multiplex: false,
  autoConnect: true,
  pingInterval: 10000,
  pingTimeout: 5000,
} as Partial<ManagerOptions & SocketOptions>;

const makeHeaders = (language: string) => {
  const headers = new Map<string, string>();
  headers.set("authorization", `Bearer ${(process.env as any).EXPO_PUBLIC_API_KEY as string}`);
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
  const reconnectTimeout = useRef<NodeJS.Timeout>();
  const backgroundTimer = useRef<NodeJS.Timeout>();
  const wasConnected = useRef(false);
  const backgroundStartTime = useRef<number | null>(null);

  const initializeSocket = async () => {
    try {
      const userId = (await AsyncStorage.getItem("userId")) || Math.random().toString(36).substring(7);
      await AsyncStorage.setItem("userId", userId);

      const newSocket = socketIOClient(baseUrl + namespace, {
        ...connectionConfig,
        extraHeaders: {
          "user-id": userId,
          ...makeHeaders(language),
        },
      });

      newSocket.on("connect", () => {
        wasConnected.current = true;
        setSocket(newSocket);
      });

      newSocket.on("disconnect", (reason) => {
        setSocket(null);
        if (wasConnected.current && reason === "transport close") {
          scheduleReconnect();
        }
      });

      newSocket.on("connect_error", (error) => {
        scheduleReconnect();
      });

      socketRef.current = newSocket;
    } catch (error) {
      // Handle error silently
    }
  };

  const scheduleReconnect = () => {
    if (reconnectTimeout.current) {
      clearTimeout(reconnectTimeout.current);
    }
    reconnectTimeout.current = setTimeout(() => {
      if (socketRef.current) {
        socketRef.current.connect();
      } else {
        initializeSocket();
      }
    }, 1000);
  };

  const handleAppStateChange = (nextAppState: AppStateStatus) => {
    if (appState.current.match(/inactive|background/) && nextAppState === "active") {
      if (backgroundTimer.current) {
        clearTimeout(backgroundTimer.current);
        backgroundTimer.current = undefined;
      }

      if (backgroundStartTime.current) {
        const timeInBackground = Date.now() - backgroundStartTime.current;
        if (timeInBackground >= BACKGROUND_TIMEOUT) {
          reconnect();
        }
      }

      backgroundStartTime.current = null;
    } else if (nextAppState.match(/inactive|background/)) {
      backgroundStartTime.current = Date.now();

      if (Platform.OS === "ios") {
        socketRef.current?.emit("background");
      }

      backgroundTimer.current = setTimeout(() => {
        if (socketRef.current?.connected) {
          socketRef.current.disconnect();
        }
      }, BACKGROUND_TIMEOUT);
    }

    appState.current = nextAppState;
  };

  useEffect(() => {
    initializeSocket();

    const subscription = AppState.addEventListener("change", handleAppStateChange);

    return () => {
      subscription.remove();
      clearTimeout(reconnectTimeout.current);
      clearTimeout(backgroundTimer.current);

      if (socketRef.current) {
        socketRef.current.removeAllListeners();
        socketRef.current.emit("client_cleanup");
        socketRef.current.disconnect();
        socketRef.current.close();
      }
    };
  }, []);

  const reconnect = () => {
    if (socketRef.current) {
      socketRef.current.connect();
    } else {
      initializeSocket();
    }
  };

  return <SocketContext.Provider value={{ socket, reconnect }}>{children}</SocketContext.Provider>;
};
