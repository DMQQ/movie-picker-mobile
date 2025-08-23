import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect, useRef, useState } from "react";
import { AppState, AppStateStatus } from "react-native";
import { useSelector } from "react-redux";
import socketIOClient, { ManagerOptions, Socket, SocketOptions } from "socket.io-client";
import envs from "../constants/envs";
import { RootState } from "../redux/store";

const isDev = envs.mode !== "production";

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
    token: `Bearer ${envs.server_auth_token}`,
  },
  path: "/socket.io",
  reconnection: true,
  reconnectionAttempts: 10,
  reconnectionDelay: 1000,
  timeout: 20000,
  forceNew: false,
  multiplex: false,
  autoConnect: true,
  pingInterval: 25000,
  pingTimeout: 30000,
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
  const reconnectTimeout = useRef<NodeJS.Timeout>();
  const backgroundTimer = useRef<NodeJS.Timeout>();
  const wasConnected = useRef(false);

  const initializeSocket = async () => {
    console.log("Initializing socket connection...");
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
        console.log("✅ Socket connected successfully");
        wasConnected.current = true;
        socketRef.current = newSocket;
        setSocket(newSocket); // Ensure state is updated when connected
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
      if (socketRef.current) {
        socketRef.current.connect();
      } else {
        initializeSocket();
      }
    }, 1000);
  };

  const handleAppStateChange = (nextAppState: AppStateStatus) => {
    if (appState.current.match(/inactive|background/) && nextAppState === "active") {
      console.log("App has come to the foreground!");
      socketRef?.current?.emit("reconnect");
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
    console.log("🔄 Manual reconnect triggered");
    if (socketRef.current) {
      console.log("🔌 Reconnecting existing socket");
      socketRef.current.connect();
    } else {
      console.log("🆕 Initializing new socket");
      initializeSocket();
    }
  };

  return <SocketContext.Provider value={{ socket, reconnect }}>{children}</SocketContext.Provider>;
};
