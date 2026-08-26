import { useEffect, useRef, useState } from "react";
import { router } from "expo-router";
import { useAppDispatch, useAppSelector } from "../redux/store";
import { partyActions, PartyGameMode } from "../redux/party/partySlice";
import { usePartySocket } from "../context/PartySocketContext";

/**
 * Shared party flow for game summary screens:
 * - Non-hosts: party:configuring sets the "host is setting up" state,
 *   party:ready auto-navigates them into the new game room.
 * - Host: consumes party.nextGame (set by the play-again sheet), emits
 *   party:next-game for non-swipe modes and calls onMode.
 *
 * Returns `configuring` for the waiting overlay. Swipe mode is never emitted
 * on the party socket — swipe restarts go through room:new-game on /swipe.
 */
export function usePartyGameFlow(isHost: boolean, onMode: (mode: PartyGameMode) => void) {
  const dispatch = useAppDispatch();
  const partyId = useAppSelector((st) => st.party.partyId);
  const nextGame = useAppSelector((st) => st.party.nextGame);
  const partySocket = usePartySocket();
  const [configuring, setConfiguring] = useState(false);

  const isHostRef = useRef(isHost);
  useEffect(() => { isHostRef.current = isHost; }, [isHost]);

  const onModeRef = useRef(onMode);
  useEffect(() => { onModeRef.current = onMode; }, [onMode]);

  useEffect(() => {
    if (!partySocket) return;
    const onConfiguring = ({ configuring: c }: { configuring: boolean }) => {
      console.log("[host-trace] party:configuring received", { configuring: c, isHost: isHostRef.current });
      if (!isHostRef.current) setConfiguring(c);
    };
    partySocket.on("party:configuring", onConfiguring);
    return () => { partySocket.off("party:configuring", onConfiguring); };
  }, [partySocket]);

  useEffect(() => {
    if (!partySocket) return;
    const onPartyReady = ({ roomId: gameRoomId, gameMode }: { roomId: string; gameMode: "voter" | "either-or" }) => {
      console.log("[host-trace] party:ready received", {
        roomId: gameRoomId,
        gameMode,
        isHost: isHostRef.current,
        ignoredByHost: isHostRef.current,
      });
      if (isHostRef.current) return;
      setConfiguring(false);
      if (gameMode === "voter") {
        router.navigate({ pathname: "/voter", params: { sessionId: gameRoomId } } as any);
      } else {
        router.navigate(`/either-or/${gameRoomId}` as any);
      }
    };
    partySocket.on("party:ready", onPartyReady);
    return () => { partySocket.off("party:ready", onPartyReady); };
  }, [partySocket]);

  useEffect(() => {
    if (!nextGame) return;
    const mode = nextGame;
    console.log("[host-trace] nextGame consumed", {
      mode,
      partyId,
      isHost: isHostRef.current,
      partySocketConnected: partySocket?.connected,
    });
    dispatch(partyActions.setNextGame(null));
    if (mode !== "swipe") {
      partySocket?.emit("party:next-game", { partyId, gameMode: mode });
      console.log("[host-trace] party:next-game emitted", { partyId, gameMode: mode });
    }
    onModeRef.current(mode);
  }, [nextGame]);

  return configuring;
}
