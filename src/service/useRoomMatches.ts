import { useCallback, useContext, useEffect, useMemo, useRef } from "react";
import { Movie } from "../../types";
import { roomActions } from "../redux/room/roomSlice";
import { useAppDispatch, useAppSelector } from "../redux/store";
import { SocketContext } from "../context/SocketContext";
import { useIsFocused } from "expo-router";
import { useMovieInteractions, useMatches } from "../context/DatabaseContext";

export default function useRoomMatches(room: string) {
  const dispatch = useAppDispatch();
  const { socket } = useContext(SocketContext);
  const isFocused = useIsFocused();
  const { movieInteractions } = useMovieInteractions();
  const { matches: matchesRepo } = useMatches();

  // Refs so handleMatched stays stable across DB init — no listener re-registration gap.
  const movieInteractionsRef = useRef(movieInteractions);
  movieInteractionsRef.current = movieInteractions;
  const matchesRepoRef = useRef(matchesRepo);
  matchesRepoRef.current = matchesRepo;
  const roomRef = useRef(room);
  roomRef.current = room;

  const match = useAppSelector((st) => st.room.match);
  const partialMatch = useAppSelector((st) => st.room.partialMatch);

  const setMatch = useCallback((movie: Movie) => {
    dispatch(roomActions.setMatch(movie));
  }, []);

  const handleMatched = useCallback(
    async (data: Movie) => {
      if (!data) return;
      const isSuperLiked = await movieInteractionsRef.current?.exists(data.id, data.type!, "super_liked");
      const matchWithSuperLike = { ...data, isSuperLiked };

      setMatch(matchWithSuperLike);
      dispatch(roomActions.addMatch(matchWithSuperLike));

      if (matchesRepoRef.current && roomRef.current) {
        matchesRepoRef.current.add({
          movie_id: data.id,
          movie_type: data.type || "movie",
          title: data.title || data.name || null,
          poster_path: data.poster_path || null,
          session_id: roomRef.current,
        });
      }
    },
    [],
  );

  const handlePartialMatch = useCallback(
    (data: { movie: Movie; likedBy: { userId: string; username: string }[]; totalUsers: number }) => {
      if (!data?.movie) return;
      dispatch(roomActions.setPartialMatch(data));
    },
    [dispatch],
  );

  const hideMatchModal = useCallback(() => {
    dispatch(roomActions.removeCurrentMatch());
  }, []);

  const hidePartialMatch = useCallback(() => {
    dispatch(roomActions.clearPartialMatch());
  }, [dispatch]);

  useEffect(() => {
    if (!socket || !room) return;

    socket.on("matched", handleMatched);
    socket.on("partial_match", handlePartialMatch);

    return () => {
      socket.off("matched", handleMatched);
      socket.off("partial_match", handlePartialMatch);
    };
  }, [socket, room]);

  return useMemo(
    () => ({ match, hideMatchModal, isFocused, partialMatch, hidePartialMatch }),
    [match, hideMatchModal, isFocused, partialMatch, hidePartialMatch],
  );
}
