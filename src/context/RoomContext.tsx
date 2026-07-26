import { createContext, useCallback, useContext, useEffect, useMemo, useRef } from "react";
import useRoom from "../service/useRoom";
import { useBlockedMovies } from "../hooks/useBlockedMovies";
import { useSuperLikedMovies } from "../hooks/useSuperLikedMovies";
import type { Movie } from "../../types";
import { useDatabase, useMatches } from "./DatabaseContext";
import { useAppDispatch, useAppSelector } from "../redux/store";
import { roomActions } from "../redux/room/roomSlice";
import { Platform } from "react-native";
import ReviewManager from "../utils/rate";
import * as StoreReview from "expo-store-review";

type RoomActions = {
  likeCard: (card: Movie, index: number) => Promise<void>;
  dislikeCard: (card: Movie, index: number) => void;
  blockAndDislikeCard: (card: Movie, index: number) => Promise<void>;
  superLikeAndLikeCard: (card: Movie, index: number) => Promise<void>;
  joinGame: (code: string, blockedMovies?: { id: number; type: "movie" | "tv" }[], superLikedMovies?: { id: number; type: "movie" | "tv" }[]) => Promise<any>;
};

const noop = () => {};
const noopAsync = async () => {};

const RoomContext = createContext<RoomActions>({
  likeCard: noopAsync,
  dislikeCard: noop,
  blockAndDislikeCard: noopAsync,
  superLikeAndLikeCard: noopAsync,
  joinGame: async () => null,
});

export default function useRoomContext() {
  return useContext(RoomContext);
}

export function RoomContextProvider({ children }: { children: React.ReactNode }) {
  const room = useRoom();
  const dispatch = useAppDispatch();
  const { blockMovie, getBlockedIds, isReady: blockedReady } = useBlockedMovies();
  const { superLikeMovie, getSuperLikedIds, isReady: superLikedReady } = useSuperLikedMovies();
  const { matches: matchesRepo } = useMatches();
  const usersCount = useAppSelector((state) => state.room.room.usersCount);
  const hasJoined = useRef(false);
  const lastJoinedRoomId = useRef<string | null>(null);

  useEffect(() => {
    if (room.roomId !== lastJoinedRoomId.current) {
      hasJoined.current = false;
    }

    if (room.roomId && room.socket?.connected && blockedReady && superLikedReady && !hasJoined.current) {
      hasJoined.current = true;
      lastJoinedRoomId.current = room.roomId;

      (async () => {
        dispatch(roomActions.setIsJoining(true));
        dispatch(roomActions.setJoinError(false));
        try {
          const [blockedMovies, superLikedMovies] = await Promise.all([getBlockedIds(), getSuperLikedIds()]);
          const response = await room.joinGame(room.roomId, blockedMovies, superLikedMovies);

          if (!response?.joined) {
            dispatch(roomActions.setJoinError(true));
            hasJoined.current = false;
          }
        } catch {
          dispatch(roomActions.setJoinError(true));
          hasJoined.current = false;
        } finally {
          dispatch(roomActions.setIsJoining(false));
        }
      })();
    }
  }, [room.roomId, room.socket?.connected, blockedReady, superLikedReady, room.joinGame, dispatch, getBlockedIds, getSuperLikedIds]);

  const blockAndDislikeCard = useCallback(
    async (card: Movie, index: number) => {
      await blockMovie(card);
      room.dislikeCard(card, index);
    },
    [blockMovie, room.dislikeCard],
  );

  const { movieInteractions, isReady } = useDatabase();

  const likeCard = useCallback(
    async (card: Movie, index: number) => {
      await room.likeCard(card, index);

      if (usersCount <= 1 && matchesRepo && room.roomId) {
        matchesRepo.add({
          movie_id: card.id,
          movie_type: card.type || "movie",
          title: card.title || card.name || null,
          poster_path: card.poster_path || null,
          session_id: room.roomId,
        });
      }
    },
    [room.likeCard, usersCount, matchesRepo, room.roomId],
  );

  const superLikeAndLikeCard = useCallback(
    async (card: Movie, index: number) => {
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
    () => ({
      likeCard,
      blockAndDislikeCard,
      superLikeAndLikeCard,
      dislikeCard: room.dislikeCard,
      joinGame: room.joinGame,
    }),
    [likeCard, blockAndDislikeCard, superLikeAndLikeCard, room.dislikeCard, room.joinGame],
  );

  return <RoomContext.Provider value={value}>{children}</RoomContext.Provider>;
}
