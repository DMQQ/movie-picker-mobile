import React, { useEffect, useRef } from "react";
import { ToastAndroid } from "react-native";
import socketIOClient, {
  ManagerOptions,
  Socket,
  SocketOptions,
} from "socket.io-client";

const isDev = false;

export const url = isDev
  ? "http://192.168.0.25:3000"
  : "http://srv25.mikr.us:40056"; //

const userId = Math.random().toString(36).substring(7);

export const SocketContext = React.createContext<{
  socket: Socket | null;
  userId: string;
}>({ socket: null, userId: "" });

const connectionConfig = {
  jsonp: false,
  reconnection: true,
  reconnectionDelay: 100,
  reconnectionAttempts: 100000,
  transports: ["websocket", "polling"],
  autoConnect: true,
  rejectUnauthorized: false,
  secure: false,
  addTrailingSlash: true,
  forceNew: true,
  forceBase64: true,
  protocols: ["websocket", "http"],
  path: "/socket.io",

  extraHeaders: {
    "user-id": userId,
  },
} as Partial<ManagerOptions & SocketOptions>;

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const socket = useRef(socketIOClient(url, connectionConfig));

  useEffect(() => {
    socket.current.on("connection", () => {
      ToastAndroid.show("Connected to server", ToastAndroid.SHORT);
    });

    socket.current.timeout(1000).on("connect_error", (err) => {
      ToastAndroid.show("Connection error", ToastAndroid.SHORT);
      console.log(err);
    });

    socket.current.on("disconnect", (msg) => {
      socket.current = socketIOClient(url, connectionConfig);
    });

    return () => {
      if (socket && socket.current) {
        socket?.current?.removeAllListeners();
        socket?.current?.close();
      }
    };
  }, [url]);

  return (
    <SocketContext.Provider value={{ socket: socket.current, userId }}>
      {children}
    </SocketContext.Provider>
  );
};
