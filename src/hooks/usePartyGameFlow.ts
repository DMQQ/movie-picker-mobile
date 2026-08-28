import { useEffect, useRef, useState } from "react";
import { router } from "expo-router";
import { useAppDispatch, useAppSelector } from "../redux/store";
import { partyActions, PartyGameMode } from "../redux/party/partySlice";
import { usePartySocket } from "../context/PartySocketContext";

/**
 * Shared party flow for game summary screens:
 * - Non-hosts: party:configuring sets the "host is setting up" state,
 *   party:ready auto-navigates them into the new game room (swipe included —
 *   guests land on /room/[roomId] and auto-join like a deeplink).
 * - Host: consumes party.nextGame (set by the play-again sheet), emits
 *   party:next-game for all modes and calls onMode.
 *
 * Returns `configuring` for the waiting overlay. Swipe restarts from a swipe
 * summary still go through room:new-game on /swipe — party:next-game for swipe
 * only shows the configuring strip on guests during that restart.
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
      if (!isHostRef.current) setConfiguring(c);
    };
    partySocket.on("party:configuring", onConfiguring);
    return () => { partySocket.off("party:configuring", onConfiguring); };
  }, [partySocket]);

  useEffect(() => {
    if (!partySocket) return;
    const onPartyReady = ({ roomId: gameRoomId, gameMode }: { roomId: string; gameMode: "voter" | "either-or" | "swipe" }) => {
      if (isHostRef.current) return;
      setConfiguring(false);
      if (gameMode === "voter") {
        router.navigate({ pathname: "/voter", params: { sessionId: gameRoomId } } as any);
      } else if (gameMode === "either-or") {
        router.navigate(`/either-or/${gameRoomId}` as any);
      } else {
        router.navigate({ pathname: "/room/[roomId]", params: { roomId: gameRoomId } } as any);
      }
    };
    partySocket.on("party:ready", onPartyReady);
    return () => { partySocket.off("party:ready", onPartyReady); };
  }, [partySocket]);

  useEffect(() => {
    if (!nextGame) return;
    const mode = nextGame;
    dispatch(partyActions.setNextGame(null));
    if (partyId) {
      partySocket?.emit("party:next-game", { partyId, gameMode: mode });
    }
    onModeRef.current(mode);
  }, [nextGame]);

  return configuring;
}
