import React, { useEffect, useRef, useState } from "react";
import socketIOClient, { ManagerOptions, Socket, SocketOptions } from "socket.io-client";
import { useAppSelector } from "../redux/store";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AppState, AppStateStatus, Platform } from "react-native";

const isDev = false;
const BACKGROUND_TIMEOUT = 5 * 60 * 1000; // 5 minutes in milliseconds

export const url = isDev ? "http://192.168.0.11:3000" : "https://movie.dmqq.dev";

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
  const language = useAppSelector((st) => st.room.language);
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

      const newSocket = socketIOClient(url + namespace, {
        ...connectionConfig,
        extraHeaders: {
          "user-id": userId,
          ...makeHeaders(language),
        },
      });

      newSocket.on("connect", () => {
        console.log("Socket connected");
        wasConnected.current = true;
      });

      newSocket.on("disconnect", (reason) => {
        console.log("Socket disconnected:", reason);
        if (wasConnected.current && reason === "transport close") {
          scheduleReconnect();
        }
      });

      newSocket.on("connect_error", (error) => {
        console.log("Connection error:", error);
        scheduleReconnect();
      });

      setSocket(newSocket);
    } catch (error) {
      console.error("Socket initialization error:", error);
    }
  };

  const scheduleReconnect = () => {
    if (reconnectTimeout.current) {
      clearTimeout(reconnectTimeout.current);
    }
    reconnectTimeout.current = setTimeout(() => {
      if (socket) {
        socket.connect();
      } else {
        initializeSocket();
      }
    }, 1000);
  };

  const handleAppStateChange = (nextAppState: AppStateStatus) => {
    if (appState.current.match(/inactive|background/) && nextAppState === "active") {
      // App has come to foreground
      if (backgroundTimer.current) {
        clearTimeout(backgroundTimer.current);
        backgroundTimer.current = undefined;
      }

      // Check if we exceeded background time limit
      if (backgroundStartTime.current) {
        const timeInBackground = Date.now() - backgroundStartTime.current;
        if (timeInBackground >= BACKGROUND_TIMEOUT) {
          // Reconnect if we exceeded the time limit
          reconnect();
        }
      }

      backgroundStartTime.current = null;
    } else if (nextAppState.match(/inactive|background/)) {
      // App has gone to background
      backgroundStartTime.current = Date.now();

      if (Platform.OS === "ios") {
        socket?.emit("background");
      }

      // Set timer to disconnect after 5 minutes
      backgroundTimer.current = setTimeout(() => {
        if (socket?.connected) {
          console.log("Disconnecting socket after background timeout");
          socket.disconnect();
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
      if (reconnectTimeout.current) {
        clearTimeout(reconnectTimeout.current);
      }
      if (backgroundTimer.current) {
        clearTimeout(backgroundTimer.current);
      }
      if (socket) {
        socket.removeAllListeners();
        socket.close();
      }
    };
  }, []);

  const reconnect = () => {
    if (socket) {
      socket.connect();
    } else {
      initializeSocket();
    }
  };

  if (!socket) {
    return null;
  }

  return <SocketContext.Provider value={{ socket, reconnect }}>{children}</SocketContext.Provider>;
};
