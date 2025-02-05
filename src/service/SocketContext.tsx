import React, { useEffect, useRef } from "react";
import { ToastAndroid } from "react-native";
import socketIOClient, { ManagerOptions, Socket, SocketOptions } from "socket.io-client";
import { useAppSelector } from "../redux/store";

const isDev = true;

export const url = isDev ? "http://192.168.0.16:3000" : "https://movie.dmqq.dev"; //

const userId = Math.random().toString(36).substring(7);

export const SocketContext = React.createContext<{
  socket: Socket | null;
  userId: string;
}>({ socket: null, userId: "" });

const connectionConfig = {
  transports: ["websocket"],
  auth: {
    token: `Bearer ${(process.env as any).EXPO_PUBLIC_API_KEY}`,
  },
  extraHeaders: {
    "user-id": userId,
  },
  path: "/socket.io",
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  timeout: 20000,
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

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const language = useAppSelector((st) => st.room.language);
  const socket = useRef(
    socketIOClient(url, {
      ...connectionConfig,
      extraHeaders: {
        "user-id": userId,
        ...makeHeaders(language),
      },
    })
  );

  useEffect(() => {
    socket.current.on("connection", (ev) => {
      console.log("connected", ev);
    });

    socket.current.timeout(1000).on("connect_error", (err) => {
      console.log("connect_error", err);
    });

    return () => {
      if (socket && socket.current) {
        socket?.current?.removeAllListeners();

        socket.current?.disconnect();

        socket?.current?.close();
      }
    };
  }, [language]);

  return <SocketContext.Provider value={{ socket: socket.current, userId }}>{children}</SocketContext.Provider>;
};
