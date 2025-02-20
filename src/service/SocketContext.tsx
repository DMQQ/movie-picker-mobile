import React, { useEffect, useRef, useState } from "react";
import socketIOClient, { ManagerOptions, Socket, SocketOptions } from "socket.io-client";
import { useAppSelector } from "../redux/store";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AppState, AppStateStatus, Platform } from "react-native";

const isDev = false;
const BACKGROUND_TIMEOUT = 5 * 60 * 1000; // 5 minutes

export const url = isDev ? "http://192.168.0.26:3000" : "https://movie.dmqq.dev";

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
  const socketRef = useRef<Socket | null>(null); // ✅ Fix: Use ref instead of state
  const [isSocketInitialized, setIsSocketInitialized] = useState(false); // To track initialization
  const appState = useRef(AppState.currentState);
  const reconnectTimeout = useRef<NodeJS.Timeout>();
  const backgroundTimer = useRef<NodeJS.Timeout>();
  const wasConnected = useRef(false);
  const backgroundStartTime = useRef<number | null>(null);

  const initializeSocket = async () => {
    try {
      console.log("🚀 Initializing socket...");
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
        console.log("✅ Socket connected");
        wasConnected.current = true;
      });

      newSocket.on("disconnect", (reason) => {
        console.log("⚠️ Socket disconnected:", reason);
        if (wasConnected.current && reason === "transport close") {
          scheduleReconnect();
        }
      });

      newSocket.on("connect_error", (error) => {
        console.log("❌ Connection error:", error);
        scheduleReconnect();
      });

      socketRef.current = newSocket;
      setIsSocketInitialized(true);
    } catch (error) {
      console.error("Socket initialization error:", error);
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
          console.log("🔌 Disconnecting socket after background timeout");
          socketRef.current.disconnect();
        }
      }, BACKGROUND_TIMEOUT);
    }

    appState.current = nextAppState;
  };

  useEffect(() => {
    initializeSocket().then(() => {
      console.log("✅ Socket initialized");
    });

    const subscription = AppState.addEventListener("change", handleAppStateChange);

    return () => {
      console.log("🔄 Running cleanup function...");
      subscription.remove();
      clearTimeout(reconnectTimeout.current);
      clearTimeout(backgroundTimer.current);

      console.log("Cleaning up socket", !!socketRef.current);

      if (socketRef.current) {
        console.log("🧹 Cleaning up socket...");
        socketRef.current.removeAllListeners();
        socketRef.current.emit("client_cleanup");
        socketRef.current.disconnect();
        socketRef.current.close();
      } else {
        console.log("⚠️ No socket to clean up");
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

  return (
    <SocketContext.Provider value={{ socket: socketRef.current, reconnect }}>
      {isSocketInitialized ? children : null}
    </SocketContext.Provider>
  );
};
