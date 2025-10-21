import { useContext, useEffect, useRef, useState } from "react";
import { Movie } from "../../types";
import { prefetchThumbnail, ThumbnailSizes } from "../components/Thumbnail";
import { roomActions } from "../redux/room/roomSlice";
import { useAppDispatch, useAppSelector } from "../redux/store";
import { SocketContext } from "./SocketContext";

export default function useRoom() {
  const dispatch = useAppDispatch();
  const { socket, emitter } = useContext(SocketContext);
  const [cardsLoading, setCardsLoading] = useState(false);
  const attemptTimeout = useRef<NodeJS.Timeout | null>(null);
  const roomId = useAppSelector((state) => state.room.room.roomId);

  useEffect(() => {
    if (!roomId) {
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
        const response = await joinGame(roomId);
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
  }, [roomId]);

  const runOnce = useRef(false);
  const initialCardsLength = useRef(0);

  const {
    nickname,
    room: { movies: cards, isFinished },
    isPlaying,
  } = useAppSelector((state) => state.room);

  const setCards = (_movies: Movie[]) => {
    setCardsLoading(true);
    initialCardsLength.current = _movies.length;
    dispatch(roomActions.addMovies(_movies));
    setCardsLoading(false);
  };

  const removeCard = (index: number) => {
    dispatch(roomActions.removeMovie(index));
  };

  useEffect(() => {
    const handleMovies = async (_cards: { movies: Movie[] }) => {
      setCards(_cards.movies);

      Promise.allSettled(
        _cards.movies.map((card: Movie) => prefetchThumbnail(card.poster_path || card.backdrop_path || "", ThumbnailSizes.poster.xxlarge))
      ).catch((err) => {
        console.error("Error prefetching thumbnails:", err);
      });
    };

    const handleRoomState = (data: any) => {
      if (!data) return;

      dispatch(roomActions.setRoom(data));
      dispatch(roomActions.setPlaying(data.isStarted));
    };

    const handleActive = (users: any) => {
      dispatch(roomActions.setActiveUsers(users));
    };

    const handleListeners = (event: string, ...args: any[]) => {
      if (event === "movies") {
        handleMovies(args[0]);
      } else if (event === "room:state") {
        handleRoomState(args[0]);
      } else if (event === "active") {
        handleActive(args[0]);
      }
    };

    socket?.onAny(handleListeners);

    return () => {
      socket?.offAny(handleListeners);
    };
  }, [socket?.on, socket?.id, roomId]);

  useEffect(() => {
    if (isPlaying && runOnce.current === false && cards.length === 0 && socket) {
      runOnce.current = true;
      socket?.emit("get-movies", roomId);
    }
  }, [isPlaying, cards.length, roomId, socket]);

  const removeCardLocally = (index: number) => {
    removeCard(index);
  };

  useEffect(() => {
    if (isFinished && socket && roomId) {
      socket?.emit("finish", roomId);
      socket?.emit("get-buddy-status", roomId);
    }
  }, [isFinished, roomId, socket]);

  const likeCard = async (card: Movie, index: number) => {
    socket?.emit("pick-movie", {
      roomId: roomId,
      index,
      swipe: { type: "like", movie: card.id },
    });
    removeCardLocally(index);
    dispatch(roomActions.likeMovie(card));
  };

  const dislikeCard = (card: Movie, index: number) => {
    socket?.emit("pick-movie", {
      roomId: roomId,
      index,
      swipe: { type: "dislike", movie: card.id },
    });
    dispatch(roomActions.dislikeMovie(card));
    removeCardLocally(index);
  };

  const joinGame = async (code: string) => {
    const response = await socket?.emitWithAck("join-room", code, nickname);

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

  return {
    cards,
    likeCard,
    dislikeCard,

    isPlaying,
    joinGame,
    cardsLoading,

    roomId,
  };
}
