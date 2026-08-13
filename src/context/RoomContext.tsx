import { createContext, useCallback, useContext, useEffect, useMemo, useRef } from "react";
import { Platform } from "react-native";
import { posthog } from "../constants/posthog";
import type { Movie } from "../../types";
import { prefetchThumbnail, ThumbnailSizes } from "../components/Thumbnail";
import { useDatabase, useMatches } from "./DatabaseContext";
import { SocketContext } from "./SocketContext";
import { useBlockedMovies } from "../hooks/useBlockedMovies";
import { useSuperLikedMovies } from "../hooks/useSuperLikedMovies";
import { roomActions } from "../redux/room/roomSlice";
import { useAppDispatch, useAppSelector } from "../redux/store";
import ReviewManager from "../utils/rate";
import * as StoreReview from "expo-store-review";

type RoomActions = {
  likeCard: (card: Movie, index: number) => Promise<void>;
  dislikeCard: (card: Movie, index: number) => void;
  blockAndDislikeCard: (card: Movie, index: number) => Promise<void>;
  superLikeAndLikeCard: (card: Movie, index: number) => Promise<void>;
};

const noop = () => {};
const noopAsync = async () => {};

const RoomContext = createContext<RoomActions>({
  likeCard: noopAsync,
  dislikeCard: noop,
  blockAndDislikeCard: noopAsync,
  superLikeAndLikeCard: noopAsync,
});

export default function useRoomContext() {
  return useContext(RoomContext);
}

export function RoomContextProvider({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();
  const { socket, emitter } = useContext(SocketContext);
  const userId = useAppSelector((state) => state.app.userId);
  const userIdRef = useRef(userId);
  userIdRef.current = userId;

  const { blockMovie, addDislikedMovie, getBlockedIds, isReady: blockedReady } = useBlockedMovies();
  const { superLikeMovie, getSuperLikedIds, isReady: superLikedReady } = useSuperLikedMovies();
  const { matches: matchesRepo } = useMatches();
  const { movieInteractions, isReady } = useDatabase();

  const roomId = useAppSelector((state) => state.room.roomId);
  const nickname = useAppSelector((state) => state.room.nickname);
  const joined = useAppSelector((state) => state.room.joined);
  const cards = useAppSelector((state) => state.room.movies);
  const isFinished = useAppSelector((state) => state.room.isFinished);
  const isPlaying = useAppSelector((state) => state.room.isPlaying);
  const movieIndex = useAppSelector((state) => state.room.index);
  const usersCount = useAppSelector((state) => state.room.usersCount);

  const isPlayingRef = useRef(isPlaying);
  isPlayingRef.current = isPlaying;
  const movieIndexRef = useRef(movieIndex);
  movieIndexRef.current = movieIndex;
  const cardsRef = useRef(cards);
  cardsRef.current = cards;

  const hasJoined = useRef(false);
  const lastJoinedRoomId = useRef<string | null>(null);
  const joinCancelToken = useRef(0);
  const attemptTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasSentFinish = useRef(false);

  const attemptJoin = useCallback(
    async (code: string) => {
      const token = ++joinCancelToken.current;
      try {
        const [blocked, superLiked] = await Promise.all([getBlockedIds(), getSuperLikedIds()]);
        if (joinCancelToken.current !== token) return;
        const mappedBlocked = blocked.map((m) => `${m.type === "movie" ? "m" : "t"}${m.id}`);
        const mappedSuperLiked = superLiked.map((m) => `${m.type === "movie" ? "m" : "t"}${m.id}`);
        const response = await socket!.timeout(10000).emitWithAck("join-room", code, nickname, mappedBlocked, mappedSuperLiked);
        if (joinCancelToken.current !== token) return;
        if (!response?.joined) {
          dispatch(roomActions.setJoinError(true));
          hasJoined.current = false;
        }
      } catch (error) {
        posthog?.captureException(error, { context: "room_join" });
        if (joinCancelToken.current !== token) return;
        dispatch(roomActions.setJoinError(true));
        hasJoined.current = false;
      }
    },
    [socket, nickname, getBlockedIds, getSuperLikedIds, dispatch],
  );

  // Initial join
  useEffect(() => {
    if (roomId !== lastJoinedRoomId.current) {
      hasJoined.current = false;
    }
    if (!roomId || !socket?.connected || !blockedReady || !superLikedReady || !joined || hasJoined.current) return;

    hasJoined.current = true;
    lastJoinedRoomId.current = roomId;
    dispatch(roomActions.setIsJoining(true));
    dispatch(roomActions.setJoinError(false));
    attemptJoin(roomId).finally(() => dispatch(roomActions.setIsJoining(false)));
  }, [roomId, socket?.connected, blockedReady, superLikedReady, joined, attemptJoin, dispatch]);

  // Reconnect join
  useEffect(() => {
    if (!roomId || !joined || !blockedReady || !superLikedReady || !socket) return;

    const onReconnected = async (_: unknown, attempt = 0) => {
      if (attemptTimeout.current) clearTimeout(attemptTimeout.current);
      if (attempt > 5) return;

      await new Promise<void>((resolve) => setTimeout(resolve, 300));

      ++joinCancelToken.current;
      hasJoined.current = false;

      try {
        const [blocked, superLiked] = await Promise.all([getBlockedIds(), getSuperLikedIds()]);
        const mappedBlocked = blocked.map((m) => `${m.type === "movie" ? "m" : "t"}${m.id}`);
        const mappedSuperLiked = superLiked.map((m) => `${m.type === "movie" ? "m" : "t"}${m.id}`);
        const response = await socket.timeout(10000).emitWithAck(
          "join-room",
          roomId,
          nickname,
          mappedBlocked,
          mappedSuperLiked,
        );
        if (!response?.joined) throw new Error("join-room rejected");
        hasJoined.current = true;
      } catch (error) {
        posthog?.captureException(error, { context: "room_reconnect_join" });
        if (attempt >= 5) {
          dispatch(roomActions.setJoinError(true));
          return;
        }
        attemptTimeout.current = setTimeout(() => onReconnected(_, attempt + 1), 100 * attempt);
      }
    };

    emitter.on("reconnected", onReconnected);
    return () => {
      emitter.off("reconnected", onReconnected);
      if (attemptTimeout.current) clearTimeout(attemptTimeout.current);
    };
  }, [roomId, joined, blockedReady, superLikedReady, socket, nickname, emitter, getBlockedIds, getSuperLikedIds]);

  // Socket event listeners
  useEffect(() => {
    if (!socket) return;

    const handleMovies = async (_cards: { movies: Movie[]; index?: number }) => {
      hasSentFinish.current = false;
      dispatch(roomActions.addMovies({ movies: _cards.movies, index: _cards.index }));

      Promise.allSettled(
        _cards.movies.flatMap((card: Movie) => [
          prefetchThumbnail(card.poster_path || card.backdrop_path || "", ThumbnailSizes.poster.xxlarge),
          prefetchThumbnail(card.poster_path || "", ThumbnailSizes.logo.tiny),
        ]),
      ).catch((error) => {
        console.error(error);
        posthog?.captureException(error, { context: "room_prefetch" });
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

    const handleBlockedUpdate = (_cards: { movies: Movie[]; index?: number }) => {
      hasSentFinish.current = false;
      dispatch(roomActions.addMovies({ movies: _cards.movies, index: _cards.index }));
    };

    const handleHostChanged = (data: { host: string }) => {
      dispatch(roomActions.setHost(data.host === userIdRef.current));
    };

    socket.on("movies", handleMovies);
    socket.on("room:state", handleRoomState);
    socket.on("active", handleActive);
    socket.on("movies:blocked-update", handleBlockedUpdate);
    socket.on("room:host:changed", handleHostChanged);

    return () => {
      socket.off("movies", handleMovies);
      socket.off("room:state", handleRoomState);
      socket.off("active", handleActive);
      socket.off("movies:blocked-update", handleBlockedUpdate);
      socket.off("room:host:changed", handleHostChanged);
    };
  }, [socket, dispatch]);

  // Finish effect
  useEffect(() => {
    if (isFinished && socket && roomId && isPlaying && !hasSentFinish.current) {
      hasSentFinish.current = true;
      socket.emit("finish", roomId, movieIndexRef.current);
      socket.emit("get-buddy-status", roomId);
    }
  }, [isFinished, roomId, socket, isPlaying]);

  // Get next page when cards run low
  useEffect(() => {
    if (cards.length === 5 && isPlaying) {
      socket
        ?.timeout(8000)
        .emitWithAck("get-next-page", roomId, movieIndexRef.current)
        .then((response) => {
          if (response?.movies && response.movies.length > 0) {
            hasSentFinish.current = false;
            dispatch(roomActions.appendMovies({ movies: response.movies, index: response.index }));
          }
          // Empty page = end of the movie list — the cards still in the deck are
          // the last ones. Swipe them out; removeMovie flips isFinished on empty.
        })
        .catch((error) => {
          posthog?.captureException(error, { context: "room_next_page" });
        });
    }
  }, [cards.length, socket, roomId, dispatch, isPlaying]);

  const likeCard = useCallback(
    async (card: Movie, index: number) => {
      // Guard against double-fire (drag exit timer + button tap racing) —
      // a card already removed from the deck was already swiped.
      if (!cardsRef.current.some((m) => m.id === card.id)) return;
      if (isPlayingRef.current) {
        socket?.emit("pick-movie", {
          roomId,
          index,
          swipe: { type: "like", movie: card.id },
        });
      }
      dispatch(roomActions.removeMovie(card.id));
      dispatch(roomActions.likeMovie(card));

      if (usersCount <= 1 && matchesRepo && roomId) {
        matchesRepo.add({
          movie_id: card.id,
          movie_type: card.type || "movie",
          title: card.title || card.name || null,
          poster_path: card.poster_path || null,
          session_id: roomId,
        });
      }
    },
    [socket, roomId, usersCount, matchesRepo, dispatch],
  );

  const dislikeCard = useCallback(
    (card: Movie, index: number) => {
      // Guard against double-fire (drag exit timer + button tap racing).
      if (!cardsRef.current.some((m) => m.id === card.id)) return;
      if (isPlayingRef.current) {
        socket?.emit("pick-movie", {
          roomId,
          index,
          swipe: { type: "dislike", movie: card.id },
        });
      }
      dispatch(roomActions.dislikeMovie(card));
      addDislikedMovie(card);
      dispatch(roomActions.removeMovie(card.id));
    },
    [socket, roomId, addDislikedMovie, dispatch],
  );

  const blockAndDislikeCard = useCallback(
    async (card: Movie, index: number) => {
      if (!cardsRef.current.some((m) => m.id === card.id)) return;
      await blockMovie(card);
      dislikeCard(card, index);
    },
    [blockMovie, dislikeCard],
  );

  const superLikeAndLikeCard = useCallback(
    async (card: Movie, index: number) => {
      if (!cardsRef.current.some((m) => m.id === card.id)) return;
      await superLikeMovie(card);
      await likeCard(card, index);

      if (isReady && movieInteractions) {
        movieInteractions.canReview().then(async (canReview) => {
          if (canReview) {
            if (Platform.OS !== "web" && (await StoreReview.hasAction()) && (await ReviewManager.canRequestReviewFromRating())) {
              await StoreReview.requestReview();
              await ReviewManager.recordReviewRequestFromRating();
            }
          }
        });
      }
    },
    [superLikeMovie, likeCard, isReady, movieInteractions],
  );

  const value = useMemo<RoomActions>(
    () => ({ likeCard, dislikeCard, blockAndDislikeCard, superLikeAndLikeCard }),
    [likeCard, dislikeCard, blockAndDislikeCard, superLikeAndLikeCard],
  );

  return <RoomContext.Provider value={value}>{children}</RoomContext.Provider>;
}
