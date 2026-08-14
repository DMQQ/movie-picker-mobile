import { AsyncStorage } from "expo-sqlite/kv-store";
import * as Updates from "expo-updates";
import React, { useEffect, useRef, useState } from "react";
import { AppState, AppStateStatus, Platform } from "react-native";
import { shallowEqual, useSelector } from "react-redux";
import { posthog } from "../constants/posthog";
import socketIOClient, {
  ManagerOptions,
  Socket,
  SocketOptions,
} from "socket.io-client";
import envs from "../constants/envs";
import { RootState } from "../redux/store";
import { EventEmitter, useEventEmitter } from "../service/useEventEmitter";

const isDev = envs.mode !== "production";

export const baseUrl = isDev
  ? Platform.OS === "ios"
    ? "http://192.168.1.20:3000"
    : "http://192.168.1.20:3000"
  : "https://flickmate.app";
export const url = baseUrl + "/api";

export type ConnectionStatus =
  "idle" | "connected" | "reconnecting" | "disconnected";

export const SocketContext = React.createContext<{
  socket: Socket | null;
  reconnect: () => void;
  emitter: EventEmitter<{ reconnected: () => void }>;
  connectionStatus: ConnectionStatus;
}>({
  socket: null,
  reconnect: () => {},
  emitter: new EventEmitter<{ reconnected: any }>(),
  connectionStatus: "idle",
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

const makeHeaders = (
  appLanguage: string,
  regionalization: Record<string, string> = {},
) => {
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

export const SocketProvider = ({
  children,
  namespace,
}: {
  children: React.ReactNode;
  namespace: "/swipe" | "/voter";
}) => {
  const language = useSelector((st: RootState) => st.room.language);
  const regionalization =
    useSelector((st: RootState) => st.room.regionalization, shallowEqual) || {};
  const authToken = useSelector((st: RootState) => st.auth.token);
  const socketRef = useRef<Socket | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connectionStatus, setConnectionStatus] =
    useState<ConnectionStatus>("idle");
  const appState = useRef(AppState.currentState);
  const wasConnected = useRef(false);

  const emitter = useEventEmitter<{ reconnected: any }>();

  const initializeSocket = async () => {
    try {
      const userId = await AsyncStorage.getItem("userId");

      const newSocket = socketIOClient(baseUrl + namespace, {
        ...connectionConfig,
        auth: {
          token: authToken
            ? `Bearer ${authToken}`
            : `Bearer ${envs.server_auth_token}`,
        },
        extraHeaders: {
          ...(userId ? { "user-id": userId } : {}),
          ...makeHeaders(language, regionalization),
        },
      });

      newSocket.on("connect", () => {
        console.log("✅ Socket connected successfully", {
          id: newSocket.id,
          namespace,
        });
        setConnectionStatus("connected");

        // Emit before updating refs so listeners registered against the previous
        // socket object are still alive when onReconnected runs.
        const isReconnect = wasConnected.current;
        wasConnected.current = true;
        socketRef.current = newSocket;
        setSocket(newSocket);

        if (isReconnect) {
          emitter.emit("reconnected", true);
        }
      });

      newSocket.on("disconnect", (reason) => {
        console.log("❌ Socket disconnected, reason:", reason);
        // Only flag reconnecting after we've had a successful connection.
        // Do NOT null socket state or socketRef — socket.io reconnects the same
        // object internally (reconnectionAttempts: 25). Nulling would tear down
        // all onAny listeners and create a gap where events are missed.
        if (wasConnected.current) {
          setConnectionStatus("reconnecting");
        }
      });

      newSocket.on("connect_error", (error) => {
        console.log("🚨 Socket connection error:", error);
        posthog?.captureException(error, { namespace });
        // socket.io's internal reconnect handles retries.
      });

      newSocket.io.on("reconnect_failed", () => {
        console.log("🔴 Socket reconnect failed — all attempts exhausted");
        setConnectionStatus("disconnected");
      });

      socketRef.current = newSocket;
    } catch (error) {
      posthog?.captureException(error, { namespace });
    }
  };

  const handleAppStateChange = async (nextAppState: AppStateStatus) => {
    if (
      appState.current.match(/inactive|background/) &&
      nextAppState === "active"
    ) {
      reconnect();
    }
    appState.current = nextAppState;
  };

  useEffect(() => {
    initializeSocket();

    const subscription = AppState.addEventListener(
      "change",
      handleAppStateChange,
    );

    return () => {
      subscription.remove();
      wasConnected.current = false;

      const s = socketRef.current;

      if (s) {
        try {
          if (s.connected) {
            s.emit("client_cleanup");
          }
          s.disconnect();
        } catch (error) {
          posthog?.captureException(error, { namespace });
        }
        s.removeAllListeners();
        socketRef.current = null;
      }
    };
  }, [language, regionalization, authToken]);

  const reconnect = async () => {
    if (socketRef.current) {
      // Force a full cycle. On iOS, the OS can kill the WebSocket transport
      // without firing a disconnect event, leaving socket.connected stale-true.
      // Calling connect() alone is a no-op in that state. disconnect() first
      // resets the internal state so the subsequent connect() actually fires
      // the 'connect' event and triggers join-room via the reconnected emitter.
      socketRef.current.disconnect();
      socketRef.current.connect();
    } else {
      initializeSocket();
    }
  };

  const memoizedValue = React.useMemo(
    () => ({ socket, reconnect, emitter, connectionStatus }),
    [socket, connectionStatus],
  );

  return (
    <SocketContext.Provider value={memoizedValue}>
      {children}
    </SocketContext.Provider>
  );
};
