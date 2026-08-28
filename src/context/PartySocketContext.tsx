import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import socketIOClient, { Socket } from "socket.io-client";
import { shallowEqual } from "react-redux";
import { AsyncStorage } from "expo-sqlite/kv-store";
import { useAppSelector } from "../redux/store";
import { baseUrl, makeHeaders } from "./SocketContext";
import envs from "../constants/envs";

const PartySocketContext = createContext<Socket | null>(null);

export function usePartySocket() {
  return useContext(PartySocketContext);
}

export function PartySocketProvider({ children }: { children: React.ReactNode }) {
  const authToken = useAppSelector((st) => st.auth.token);
  const userId = useAppSelector((st) => st.app.userId);
  const language = useAppSelector((st) => st.app.language);
  const regionalization = useAppSelector((st) => st.app.regionalization, shallowEqual) || {};
  const [partySocket, setPartySocket] = useState<Socket | null>(null);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const storedUserId = await AsyncStorage.getItem("userId");
      const effectiveUserId = userId || storedUserId;

      const s = socketIOClient(baseUrl + "/party", {
        transports: ["websocket"],
        auth: {
          token: authToken ? `Bearer ${authToken}` : `Bearer ${envs.server_auth_token}`,
        },
        extraHeaders: {
          ...(effectiveUserId ? { "user-id": effectiveUserId } : {}),
          ...makeHeaders(language, regionalization),
        },
        reconnection: true,
        reconnectionAttempts: 25,
        reconnectionDelay: 500,
        forceNew: false,
        multiplex: false,
        autoConnect: true,
      });

      if (!mounted) { s.disconnect(); return; }
      socketRef.current = s;
      s.on("connect", () => {
        if (mounted) setPartySocket(s);
      });
      setPartySocket(s);
    })();

    return () => {
      mounted = false;
      socketRef.current?.disconnect();
      socketRef.current = null;
      setPartySocket(null);
    };
  }, [authToken, userId, language, JSON.stringify(regionalization)]);

  return (
    <PartySocketContext.Provider value={partySocket}>
      {children}
    </PartySocketContext.Provider>
  );
}
