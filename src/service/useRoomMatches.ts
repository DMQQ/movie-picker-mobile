import { useCallback, useContext, useEffect, useMemo } from "react";
import { Movie } from "../../types";
import { roomActions } from "../redux/room/roomSlice";
import { useAppDispatch, useAppSelector } from "../redux/store";
import { SocketContext } from "../context/SocketContext";
import { useIsFocused } from "@react-navigation/native";

export default function useRoomMatches(room: string) {
  const dispatch = useAppDispatch();
  const { socket } = useContext(SocketContext);
  const isFocused = useIsFocused();

  const match = useAppSelector((st) => st.room.room.match);

  const setMatch = useCallback((movie: Movie) => {
    dispatch(roomActions.setMatch(movie));
  }, []);

  const handleMatched = useCallback((data: Movie) => {
    if (!data) return;
    setMatch(data);
    dispatch(roomActions.addMatch(data));
  }, []);

  const hideMatchModal = useCallback(() => {
    dispatch(roomActions.removeCurrentMatch());
  }, []);

  useEffect(() => {
    if (!socket || !room) return;

    socket?.on("matched", handleMatched);

    return () => {
      socket?.off("matched", handleMatched);
    };
  }, [socket]);

  return useMemo(() => ({ match, hideMatchModal, isFocused }), [match, hideMatchModal, isFocused]);
}
