import { createContext, useContext, useEffect } from "react";
import useRoom from "../../service/useRoom";

const RoomContext = createContext<ReturnType<typeof useRoom>>({
  cards: [],
  isPlaying: false,
  cardsLoading: false,
  dislikeCard: () => {},
  likeCard: (...args: any) => new Promise(() => {}),
  roomId: "",
  joinGame: async () => null,
});

export default function useRoomContext() {
  return useContext(RoomContext);
}

export function RoomContextProvider({ children }: { children: React.ReactNode }) {
  const room = useRoom();

  useEffect(() => {
    if (room.roomId) room.joinGame(room.roomId);
  }, [room.roomId]);

  return <RoomContext.Provider value={room}>{children}</RoomContext.Provider>;
}
