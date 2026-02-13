import { createContext, useCallback, useContext, useEffect, useMemo } from "react";
import useRoom from "../service/useRoom";
import { useBlockedMovies } from "../hooks/useBlockedMovies";
import { useSuperLikedMovies } from "../hooks/useSuperLikedMovies";
import type { Movie } from "../../types";

type RoomContextValue = ReturnType<typeof useRoom> & {
  blockAndDislikeCard: (card: Movie, index: number) => Promise<void>;
  superLikeAndLikeCard: (card: Movie, index: number) => Promise<void>;
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
});

export default function useRoomContext() {
  return useContext(RoomContext);
}

export function RoomContextProvider({ children }: { children: React.ReactNode }) {
  const room = useRoom();
  const { blockMovie, getBlockedIds, isReady: blockedReady } = useBlockedMovies();
  const { superLikeMovie, getSuperLikedIds, isReady: superLikedReady } = useSuperLikedMovies();

  useEffect(() => {
    if (room.roomId && room.socket?.connected && blockedReady && superLikedReady) {
      (async () => {
        const [blockedMovies, superLikedMovies] = await Promise.all([getBlockedIds(), getSuperLikedIds()]);
        room.joinGame(room.roomId, blockedMovies, superLikedMovies);
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

  const superLikeAndLikeCard = useCallback(
    async (card: Movie, index: number) => {
      await superLikeMovie(card);
      await room.likeCard(card, index);
    },
    [superLikeMovie, room.likeCard],
  );

  const value = useMemo(
    () => ({
      ...room,
      blockAndDislikeCard,
      superLikeAndLikeCard,
    }),
    [room, blockAndDislikeCard, superLikeAndLikeCard],
  );

  return <RoomContext.Provider value={value}>{children}</RoomContext.Provider>;
}
