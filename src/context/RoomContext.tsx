import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import useRoom from "../service/useRoom";
import { useBlockedMovies } from "../hooks/useBlockedMovies";
import { useSuperLikedMovies } from "../hooks/useSuperLikedMovies";
import type { Movie } from "../../types";
import { useDatabase } from "./DatabaseContext";
import { Platform } from "react-native";
import ReviewManager from "../utils/rate";
import * as StoreReview from "expo-store-review";

type RoomContextValue = ReturnType<typeof useRoom> & {
  blockAndDislikeCard: (card: Movie, index: number) => Promise<void>;
  superLikeAndLikeCard: (card: Movie, index: number) => Promise<void>;
  joinError: boolean;
  isJoining: boolean;
};

const RoomContext = createContext<RoomContextValue>({
  cards: [],
  isPlaying: false,
  cardsLoading: false,
  dislikeCard: () => {},
  likeCard: (...args: any) => new Promise(() => {}),
  roomId: "",
  joinGame: async () => null,
  socket: null,
  blockAndDislikeCard: async () => {},
  superLikeAndLikeCard: async () => {},
  joinError: false,
  isJoining: false,
});

export default function useRoomContext() {
  return useContext(RoomContext);
}

export function RoomContextProvider({ children }: { children: React.ReactNode }) {
  const room = useRoom();
  const { blockMovie, getBlockedIds, isReady: blockedReady } = useBlockedMovies();
  const { superLikeMovie, getSuperLikedIds, isReady: superLikedReady } = useSuperLikedMovies();
  const [joinError, setJoinError] = useState(false);
  const [isJoining, setIsJoining] = useState(false);

  useEffect(() => {
    if (room.roomId && room.socket?.connected && blockedReady && superLikedReady) {
      (async () => {
        setIsJoining(true);
        setJoinError(false);
        try {
          const [blockedMovies, superLikedMovies] = await Promise.all([getBlockedIds(), getSuperLikedIds()]);
          const response = await room.joinGame(room.roomId, blockedMovies, superLikedMovies);

          if (!response?.joined) {
            console.error("Failed to join room - room may not exist");
            setJoinError(true);
          }
        } catch (error) {
          console.error("Error joining room:", error);
          setJoinError(true);
        } finally {
          setIsJoining(false);
        }
      })();
    }
  }, [room.roomId, room.socket?.connected, blockedReady, superLikedReady]);

  const blockAndDislikeCard = useCallback(
    async (card: Movie, index: number) => {
      await blockMovie(card);
      room.dislikeCard(card, index);
    },
    [blockMovie, room.dislikeCard],
  );

  const { movieInteractions, isReady } = useDatabase();

  const superLikeAndLikeCard = useCallback(
    async (card: Movie, index: number) => {
      await superLikeMovie(card);
      await room.likeCard(card, index);

      if (isReady && movieInteractions)
        movieInteractions.canReview().then(async (canReview) => {
          if (canReview) {
            if (Platform.OS !== "web" && (await StoreReview.hasAction()) && (await ReviewManager.canRequestReviewFromRating())) {
              await StoreReview.requestReview();
              await ReviewManager.recordReviewRequestFromRating();
            }
          }
        });
    },
    [superLikeMovie, room.likeCard, isReady],
  );

  const value = useMemo(
    () => ({
      ...room,
      blockAndDislikeCard,
      superLikeAndLikeCard,
      joinError,
      isJoining,
    }),
    [room, blockAndDislikeCard, superLikeAndLikeCard, joinError, isJoining],
  );

  return <RoomContext.Provider value={value}>{children}</RoomContext.Provider>;
}
