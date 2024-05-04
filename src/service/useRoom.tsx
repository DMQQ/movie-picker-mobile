import { useContext, useEffect, useState } from "react";
import { SocketContext } from "./SocketContext";
import { useAppDispatch, useAppSelector } from "../redux/store";
import { roomActions } from "../redux/room/roomSlice";
import { Movie } from "../../types";
import { Image } from "react-native";

export default function useRoom(room: string) {
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const setMatch = (movie: Movie) => {
    dispatch(roomActions.setMatch(movie));
  };
  const {
    room: { movies: cards, match, roomId, isFinished },
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
    console.log("useEffect -> useRoom");

    (async () => {
      socket?.emit("join-room", room);

      socket?.on("movies", (cards) => {
        setCards(cards.movies);
        Promise.all(
          cards.movies.map((card: Movie, index: number) =>
            Image.prefetch("https://image.tmdb.org/t/p/w500" + card.poster_path)
          )
        );
      });

      socket?.on("room-details", (data) => {
        if (data !== undefined) dispatch(roomActions.setRoom(data));

        socket.off("room-details");
      });

      socket?.on("matched", (data: Movie) => {
        setMatch(data);
        dispatch(roomActions.addMatch(data));
      });
    })();

    return () => {
      socket?.off("movies");
      socket?.off("matched");
      socket?.off("room-details");
      socket?.emit("leave-room", room);
    };
  }, [roomId]);

  const removeCardLocally = (index: number) => {
    removeCard(index);
  };

  useEffect(() => {
    if (isFinished) {
      socket?.emit("finish", room);
      socket?.emit("get-buddy-status", room);
    }
  }, [isFinished]);

  const likeCard = (card: Movie, index: number) => {
    socket?.emit("pick-movie", {
      roomId: room,
      movie: card.id,
      index,
    });
    removeCardLocally(index);
    dispatch(roomActions.likeMovie(card));
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
    dispatch(roomActions.removeCurrentMatch());
  };

  const toggleLeaveModal = () => {
    setShowLeaveModal((p) => !p);
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
