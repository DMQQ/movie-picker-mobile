import { useContext, useEffect, useRef } from "react";
import { SocketContext, type ConnectionStatus } from "../context/SocketContext";
import { useAppSelector } from "../redux/store";
import { useToast } from "../components/Toast";
import useTranslation from "../service/useTranslation";

function userName(u: unknown): string {
  if (typeof u === "string") return u;
  if (u && typeof u === "object" && "name" in u) return (u as { name: string }).name;
  return "?";
}

function userId(u: unknown): string {
  if (typeof u === "string") return u;
  if (u && typeof u === "object" && "id" in u) return String((u as { id: unknown }).id);
  if (u && typeof u === "object" && "name" in u) return (u as { name: string }).name;
  return "?";
}

export default function useRoomToasts() {
  const users = useAppSelector((s) => s.room.users);
  const rejoinStatus = useAppSelector((s) => s.room.rejoinStatus);
  const toast = useToast();
  const t = useTranslation();
  const { connectionStatus } = useContext(SocketContext);
  const prevIds = useRef<Set<string>>(new Set());
  const prevStatus = useRef<ConnectionStatus>("idle");
  const hasInit = useRef(false);
  const connToastId = useRef<string | null>(null);

  // User join/leave detection
  useEffect(() => {
    const currentIds = new Set(users.map(userId));

    if (!hasInit.current) {
      if (users.length === 0) return;
      hasInit.current = true;
      prevIds.current = currentIds;
      toast.show(t("room.toast.joined-room"), { type: "success", duration: 2500 });
      return;
    }

    const joined = users.filter((u) => !prevIds.current.has(userId(u)));
    const left = [...prevIds.current].filter((id) => !currentIds.has(id));

    for (const u of joined) {
      toast.show(t("room.toast.joined", { name: userName(u) }), { type: "success", duration: 2500 });
    }
    if (left.length === 1) {
      toast.show(t("room.toast.player-left"), { type: "info", duration: 2500 });
    } else if (left.length > 1) {
      toast.show(t("room.toast.players-left", { count: left.length }), { type: "info", duration: 2500 });
    }

    prevIds.current = currentIds;
  }, [users]); // eslint-disable-line react-hooks/exhaustive-deps

  // Connection status detection
  useEffect(() => {
    const prev = prevStatus.current;
    prevStatus.current = connectionStatus;
    if (prev === connectionStatus) return;

    if (connectionStatus === "reconnecting") {
      connToastId.current = toast.replace(connToastId.current, t("room.toast.connection-lost"), { type: "error", duration: 3000 });
    } else if (connectionStatus === "disconnected") {
      connToastId.current = toast.replace(connToastId.current, t("room.toast.connection-lost-refresh"), { type: "error", duration: 0 });
    } else if (connectionStatus === "connected" && (prev === "reconnecting" || prev === "disconnected")) {
      // Don't toast yet — wait for join-room to confirm the room still exists
    }
  }, [connectionStatus]); // eslint-disable-line react-hooks/exhaustive-deps

  // Rejoin result — fires after RoomContext confirms whether the room survived
  const prevRejoinStatus = useRef<typeof rejoinStatus>("idle");
  useEffect(() => {
    if (rejoinStatus === prevRejoinStatus.current) return;
    prevRejoinStatus.current = rejoinStatus;

    if (rejoinStatus === "success") {
      connToastId.current = toast.replace(connToastId.current, t("room.toast.reconnected"), { type: "success", duration: 2000 });
    }
    // "failed" cases (room_not_found / join error) are handled by the room-not-found UI
    // so we just dismiss the connection-lost toast silently
    if (rejoinStatus === "failed") {
      if (connToastId.current) toast.dismiss(connToastId.current);
      connToastId.current = null;
    }
  }, [rejoinStatus]); // eslint-disable-line react-hooks/exhaustive-deps
}
