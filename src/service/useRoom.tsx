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
    nickname,
    language,
    room: { movies: cards, match, roomId, isFinished },
  } = useAppSelector((state) => state.room);

  const setCards = (_movies: Movie[]) => {
    dispatch(roomActions.addMovies(_movies));
  };

  const removeCard = (index: number) => {
    dispatch(roomActions.removeMovie(index));
  };

  const dispatch = useAppDispatch();
  const { socket } = useContext(SocketContext);

  useEffect(() => {
    (async () => {
      socket?.emit("join-room", room, nickname);

      socket?.on("movies", (_cards) => {
        setCards(_cards.movies);
        Promise.all(
          _cards.movies.map((card: Movie, index: number) =>
            Image.prefetch("https://image.tmdb.org/t/p/w500" + card.poster_path)
          )
        );
      });

      socket?.on("room-details", (data) => {
        if (data !== undefined) dispatch(roomActions.setRoom(data));

        // socket.off("room-details");
      });

      socket?.on("matched", (data: Movie) => {
        setMatch(data);
        dispatch(roomActions.addMatch(data));
      });

      socket?.on("active", (users: number[]) => {
        dispatch(roomActions.setActiveUsers(users));
      });
    })();

    return () => {
      socket?.off("movies");
      socket?.off("matched");
      socket?.off("room-details");
      socket?.off("active");
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
