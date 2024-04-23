import { useContext, useEffect, useState } from "react";
import { SocketContext } from "./SocketContext";
import { useAppDispatch, useAppSelector } from "../redux/store";
import { roomActions } from "../redux/room/roomSlice";
import { Movie } from "../../types";
import { useNavigation } from "@react-navigation/native";
import { ToastAndroid } from "react-native";

export default function useRoom(room: string) {
  const navigation = useNavigation();
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [match, setMatch] = useState<Movie | undefined>(undefined);

  const {
    room: { movies: cards, roomId },
  } = useAppSelector((state) => state.room);

  const setCards = (movies: Movie[]) => {
    dispatch(roomActions.addMovies(movies));
  };

  const removeCard = (index: number) => {
    dispatch(roomActions.removeMovie(index));
  };

  const dispatch = useAppDispatch();
  const { socket } = useContext(SocketContext);

  useEffect(() => {
    socket?.emit("join-room", room);
    socket?.emit("get-movies", room);
    socket?.emit("get-room-details", room);

    socket?.on("movies", (cards) => {
      setCards(cards.movies);
    });

    socket?.on("room-details", (data) => {
      if (data !== undefined) dispatch(roomActions.setRoom(data));
    });

    socket?.on("room-deleted", () => {
      navigation.goBack();
      ToastAndroid.show("Room has been deleted", ToastAndroid.SHORT);
    });

    socket?.on("matched", (data: Movie) => {
      if (typeof match !== "undefined" || data == null) return;

      setMatch(data);
      dispatch(roomActions.addMatch(data));
    });

    return () => {
      socket?.off("room-joined");
      socket?.off("movies");
      socket?.emit("leave-room", room);
      socket?.off("room-deleted");
      socket?.off("matched");
      socket?.off("room-details");
    };
  }, []);

  const removeCardLocally = (index: number) => {
    removeCard(index);

    if (cards.length === 1) {
      socket?.emit("finish", room);
      socket?.emit("get-buddy-status", room);
    }
  };

  const likeCard = (card: Movie, index: number) => {
    socket?.emit("pick-movie", {
      roomId: room,
      movie: card.id,
      index,
    });
    removeCardLocally(index);
  };

  const dislikeCard = (index: number) => {
    socket?.emit("pick-movie", {
      roomId: room,
      movie: 0,
      index,
    });
    removeCardLocally(index);
  };

  const hideMatchModal = () => {
    setMatch(undefined);
  };

  const toggleLeaveModal = () => {
    setShowLeaveModal(false);
  };

  return {
    cards,
    likeCard,
    dislikeCard,
    showLeaveModal,
    match,
    hideMatchModal,
    toggleLeaveModal,
  };
}
