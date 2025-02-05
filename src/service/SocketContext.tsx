import React, { useEffect, useRef } from "react";
import { ToastAndroid } from "react-native";
import socketIOClient, { ManagerOptions, Socket, SocketOptions } from "socket.io-client";

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

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const socket = useRef(socketIOClient(url, connectionConfig));

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
  }, []);

  return <SocketContext.Provider value={{ socket: socket.current, userId }}>{children}</SocketContext.Provider>;
};
