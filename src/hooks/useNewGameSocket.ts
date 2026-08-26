import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import { SocketContext } from "../context/SocketContext";
import { useAppDispatch } from "../redux/store";
import { roomActions } from "../redux/room/roomSlice";
import { partyActions } from "../redux/party/partySlice";

export function useNewGameSocket(
  roomId: string,
  partyId: string | null,
  isHost: boolean,
) {
  const dispatch = useAppDispatch();
  const { socket } = useContext(SocketContext);
  const [newGameLoading, setNewGameLoading] = useState(false);
  const isHostRef = useRef(isHost);
  useEffect(() => {
    isHostRef.current = isHost;
  }, [isHost]);

  useEffect(() => {
    if (!socket) return;
    const onNewGame = ({
      roomId: newRoomId,
      partyId: newPartyId,
    }: {
      roomId: string;
      partyId?: string;
    }) => {
      if (newPartyId) dispatch(partyActions.setParty({ partyId: newPartyId }));
      if (isHostRef.current) {
        dispatch(roomActions.resetForNewGame(newRoomId));
        router.replace("/room/setup");
      } else {
        dispatch(roomActions.setRoomId(newRoomId));
        router.replace(`/room/${newRoomId}` as any);
      }
    };
    socket.on("room:new-game", onNewGame);
    return () => {
      socket.off("room:new-game", onNewGame);
    };
  }, [socket, dispatch]);

  const handleNewGame = useCallback(() => {
    if (!socket || !isHost || newGameLoading) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setNewGameLoading(true);
    socket.emit(
      "room:new-game",
      roomId,
      partyId ?? undefined,
      (ack: {
        success: boolean;
        roomId?: string;
        partyId?: string;
        error?: string;
      }) => {
        if (!ack.success) {
          setNewGameLoading(false);
          return;
        }
        if (ack.partyId) dispatch(partyActions.setParty({ partyId: ack.partyId }));
      },
    );
  }, [socket, isHost, newGameLoading, roomId, partyId, dispatch]);

  return { newGameLoading, handleNewGame };
}
