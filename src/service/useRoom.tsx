import { useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { Movie } from "../../types";
import { prefetchThumbnail, ThumbnailSizes } from "../components/Thumbnail";
import { roomActions } from "../redux/room/roomSlice";
import { useAppDispatch, useAppSelector } from "../redux/store";
import { SocketContext } from "./SocketContext";

export default function useRoom(room: string) {
  const dispatch = useAppDispatch();
  const { socket, emitter } = useContext(SocketContext);
  const [cardsLoading, setCardsLoading] = useState(false);
  const attemptTimeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!room) {
      return;
    }
    async function onReconnected(args: unknown, attempt = 0) {
      if (attemptTimeout.current) {
        clearTimeout(attemptTimeout.current);
      }

      if (attempt > 5) {
        return;
      }

      try {
        const response = await joinGame(room);
        if (!response) {
          throw new Error("Failed to rejoin room after reconnection");
        }
      } catch (error) {
        attemptTimeout.current = setTimeout(() => {
          onReconnected(args, attempt + 1);
        }, 100 * attempt);
      }
    }

    emitter.on("reconnected", onReconnected);

    return () => {
      emitter.off("reconnected", onReconnected);
    };
  }, [room]);

  const runOnce = useRef(false);
  const initialCardsLength = useRef(0);

  const {
    nickname,
    room: { movies: cards, roomId, isFinished },
    isPlaying,
  } = useAppSelector((state) => state.room);

  const setCards = useCallback((_movies: Movie[]) => {
    setCardsLoading(true);
    initialCardsLength.current = _movies.length;
    dispatch(roomActions.addMovies(_movies));
    setCardsLoading(false);
  }, []);

  const removeCard = useCallback((index: number) => {
    dispatch(roomActions.removeMovie(index));
  }, []);

  const handleMovies = useCallback(async (_cards: { movies: Movie[] }) => {
    try {
      Promise.allSettled(
        _cards.movies.map((card: Movie) => prefetchThumbnail(card.poster_path || card.backdrop_path || "", ThumbnailSizes.poster.xxlarge))
      );
    } catch (error) {}

    setCards(_cards.movies);
  }, []);

  const handleRoomState = useCallback((data: any) => {
    if (!data) return;

    dispatch(roomActions.setRoom(data));
    dispatch(roomActions.setPlaying(data.isStarted));
  }, []);

  const handleActive = useCallback((users: any) => dispatch(roomActions.setActiveUsers(users)), []);

  useEffect(() => {
    if (!socket || !room) return;

    socket.on("movies", handleMovies);
    socket.on("room:state", handleRoomState);
    socket.on("active", handleActive);

    return () => {
      socket.off("movies", handleMovies);
      socket.off("room:state", handleRoomState);
      socket.off("active", handleActive);
    };
  }, [socket]);

  useEffect(() => {
    if (isPlaying && runOnce.current === false && cards.length === 0 && socket) {
      runOnce.current = true;
      socket?.emit("get-movies", room);
    }
  }, [isPlaying, cards.length, room, socket]);

  const removeCardLocally = useCallback((index: number) => {
    removeCard(index);
  }, []);

  useEffect(() => {
    if (isFinished && socket && room) {
      socket?.emit("finish", room);
      socket?.emit("get-buddy-status", room);
    }
  }, [isFinished, room, socket]);

  const likeCard = useCallback(
    async (card: Movie, index: number) => {
      socket?.emit("pick-movie", {
        roomId: room,
        index,
        swipe: { type: "like", movie: card.id },
      });
      removeCardLocally(index);
      dispatch(roomActions.likeMovie(card));
    },
    [room]
  );

  const dislikeCard = (card: Movie, index: number) => {
    socket?.emit("pick-movie", {
      roomId: room,
      index,
      swipe: { type: "dislike", movie: card.id },
    });
    removeCardLocally(index);
  };

  const joinGame = async (code: string) => {
    const response = await socket?.emitWithAck("join-room", code, nickname);

    if (response) {
      console.log("💡 Joined room:", response);
    }

    return response;
  };

  useEffect(() => {
    if (cards.length === Math.trunc(initialCardsLength.current / 4) && initialCardsLength.current > 0) {
      socket?.emitWithAck("get-next-page", roomId).then((response) => {
        if (response?.movies && response.movies.length > 0) {
          dispatch(roomActions.appendMovies(response.movies));
        }
      });
    }
  }, [cards.length]);

  return useMemo(
    () => ({
      cards,
      likeCard,
      dislikeCard,

      isPlaying,
      joinGame,
      cardsLoading,
    }),
    [cards, likeCard, dislikeCard, isPlaying, joinGame, cardsLoading]
  );
}
