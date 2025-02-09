import React, { useEffect, useRef, useState } from "react";
import socketIOClient, { ManagerOptions, Socket, SocketOptions } from "socket.io-client";
import { useAppSelector } from "../redux/store";
import AsyncStorage from "@react-native-async-storage/async-storage";

const isDev = true;

export const url = isDev ? "http://192.168.0.11:3000" : "https://movie.dmqq.dev"; //

export const SocketContext = React.createContext<{
  socket: Socket | null;
}>({ socket: null });

const connectionConfig = {
  transports: ["websocket"],
  auth: {
    token: `Bearer ${(process.env as any).EXPO_PUBLIC_API_KEY}`,
  },
  extraHeaders: {
    "user-id": "",
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

export const SocketProvider = ({ children, namespace }: { children: React.ReactNode; namespace: "/swipe" | "/voter" }) => {
  const language = useAppSelector((st) => st.room.language);

  const [socket, setSocket] = useState<{ current: Socket }>({
    current: null as any,
  });

  useEffect(() => {
    (async () => {
      const userId = (await AsyncStorage.getItem("userId")) || Math.random().toString(36).substring(7);

      const socket = socketIOClient(url + namespace, {
        ...connectionConfig,
        extraHeaders: {
          "user-id": userId,
          ...makeHeaders(language),
        },
      });
      setSocket({ current: socket });

      await AsyncStorage.setItem("userId", userId);
    })();
  }, []);

  useEffect(() => {
    if (!socket.current) return;

    socket.current.on("connection", (ev) => {
      console.log("connected", ev);
    });

    socket.current.timeout(1000).on("connect_error", (err) => {
      console.log("connect_error", err);
    });

    return () => {
      socket?.current?.removeAllListeners();

      socket.current?.disconnect();

      socket?.current?.close();
    };
  }, [socket?.current]);

  if (!socket.current) {
    return null;
  }

  return <SocketContext.Provider value={{ socket: socket.current }}>{children}</SocketContext.Provider>;
};
