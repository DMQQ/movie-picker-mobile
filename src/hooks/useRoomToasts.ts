import { useContext, useEffect, useRef } from "react";
import { SocketContext, type ConnectionStatus } from "../context/SocketContext";
import { useAppSelector } from "../redux/store";
import { useToast } from "../components/Toast";

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
  const toast = useToast();
  const { connectionStatus } = useContext(SocketContext);
  const prevIds = useRef<Set<string>>(new Set());
  const prevStatus = useRef<ConnectionStatus>("idle");
  const hasInit = useRef(false);

  // User join/leave detection
  useEffect(() => {
    const currentIds = new Set(users.map(userId));

    if (!hasInit.current) {
      if (users.length === 0) return;
      hasInit.current = true;
      prevIds.current = currentIds;
      toast.show("You joined the room", { type: "success", duration: 2500 });
      return;
    }

    const joined = users.filter((u) => !prevIds.current.has(userId(u)));
    const left = [...prevIds.current].filter((id) => !currentIds.has(id));

    for (const u of joined) {
      toast.show(`${userName(u)} joined`, { type: "success", duration: 2500 });
    }
    if (left.length === 1) {
      toast.show("A player left", { type: "info", duration: 2500 });
    } else if (left.length > 1) {
      toast.show(`${left.length} players left`, { type: "info", duration: 2500 });
    }

    prevIds.current = currentIds;
  }, [users]); // eslint-disable-line react-hooks/exhaustive-deps

  // Connection status detection
  useEffect(() => {
    const prev = prevStatus.current;
    prevStatus.current = connectionStatus;
    if (prev === connectionStatus) return;

    if (connectionStatus === "reconnecting") {
      toast.show("Connection lost, reconnecting...", { type: "error", duration: 0 });
    } else if (connectionStatus === "disconnected") {
      toast.show("Connection lost, pull to refresh", { type: "error", duration: 0 });
    } else if (connectionStatus === "connected" && (prev === "reconnecting" || prev === "disconnected")) {
      toast.show("Reconnected", { type: "success", duration: 2000 });
    }
  }, [connectionStatus]); // eslint-disable-line react-hooks/exhaustive-deps
}
