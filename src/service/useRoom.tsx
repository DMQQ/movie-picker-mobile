import { useContext, useEffect, useRef, useState } from "react";
import { Movie } from "../../types";
import { prefetchThumbnail, ThumbnailSizes } from "../components/Thumbnail";
import { roomActions } from "../redux/room/roomSlice";
import { useAppDispatch, useAppSelector } from "../redux/store";
import { SocketContext } from "../context/SocketContext";
import { useBlockedMovies } from "../hooks/useBlockedMovies";
import { useSuperLikedMovies } from "../hooks/useSuperLikedMovies";

export default function useRoom() {
  const dispatch = useAppDispatch();
  const { socket, emitter } = useContext(SocketContext);
  const attemptTimeout = useRef<NodeJS.Timeout | null>(null);
  const roomId = useAppSelector((state) => state.room.room.roomId);
  const { getBlockedIds, addDislikedMovie, isReady: blockedReady } = useBlockedMovies();
  const { getSuperLikedIds, isReady: superLikedReady } = useSuperLikedMovies();

  useEffect(() => {
    if (!roomId || !blockedReady || !superLikedReady) {
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
        const [blockedMovies, superLikedMovies] = await Promise.all([getBlockedIds(), getSuperLikedIds()]);
        const response = await joinGame(roomId, blockedMovies, superLikedMovies);
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
  }, [roomId, blockedReady, superLikedReady]);

  const runOnce = useRef(false);
  const initialCardsLength = useRef(0);

  const {
    nickname,
    room: { movies: cards, isFinished },
    isPlaying,
  } = useAppSelector((state) => state.room);

  const setCards = (_movies: Movie[]) => {
    // setCardsLoading(true);
    initialCardsLength.current = _movies.length;
    dispatch(roomActions.addMovies(_movies));
    // setCardsLoading(false);
  };

  const removeCard = (index: number) => {
    dispatch(roomActions.removeMovie(index));
  };

  useEffect(() => {
    const handleMovies = async (_cards: { movies: Movie[] }) => {
      setCards(_cards.movies);

      Promise.allSettled(
        _cards.movies.map((card: Movie) => prefetchThumbnail(card.poster_path || card.backdrop_path || "", ThumbnailSizes.poster.xxlarge)),
      ).catch(console.error);
    };

    const handleRoomState = (data: any) => {
      if (!data) return;

      dispatch(roomActions.setRoom(data));
      dispatch(roomActions.setPlaying(data.isStarted));
    };

    const handleActive = (users: any) => {
      dispatch(roomActions.setActiveUsers(users));
    };

    const handleBlockedUpdate = (_cards: { movies: Movie[] }) => {
      setCards(_cards.movies);
    };

    const handleListeners = (event: string, ...args: any[]) => {
      if (event === "movies") {
        handleMovies(args[0]);
      } else if (event === "room:state") {
        handleRoomState(args[0]);
      } else if (event === "active") {
        handleActive(args[0]);
      } else if (event === "movies:blocked-update") {
        handleBlockedUpdate(args[0]);
      }
    };

    socket?.onAny(handleListeners);

    return () => {
      socket?.offAny(handleListeners);
    };
  }, [socket?.on, socket?.id, roomId]);

  useEffect(() => {
    // Only attempt if playing, no cards, and socket exists
    if (!isPlaying || cards.length > 0 || !socket) return;

    let attempts = 0;
    const maxAttempts = 3;
    const retryDelay = 1500;
    let timeoutId: NodeJS.Timeout | null = null;
    let cancelled = false;

    const attemptFetch = () => {
      if (cancelled || attempts >= maxAttempts) {
        if (attempts >= maxAttempts) {
        }
        return;
      }

      attempts++;

      socket?.emit("get-movies", roomId);

      timeoutId = setTimeout(attemptFetch, retryDelay);
    };

    attemptFetch();

    return () => {
      cancelled = true;
      if (timeoutId) clearTimeout(timeoutId);
    };
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
    addDislikedMovie(card);
    removeCardLocally(index);
  };

  const joinGame = async (
    code: string,
    blockedMovies: { id: number; type: "movie" | "tv" }[] = [],
    superLikedMovies: { id: number; type: "movie" | "tv" }[] = [],
  ) => {
    const mappedBlocked = blockedMovies.map((m) => `${m.type === "movie" ? "m" : "t"}${m.id}`);
    const mappedSuperLiked = superLikedMovies.map((m) => `${m.type === "movie" ? "m" : "t"}${m.id}`);
    const response = await socket?.emitWithAck("join-room", code, nickname, mappedBlocked, mappedSuperLiked);

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
    cardsLoading: false,

    roomId,

    socket,
  };
}
