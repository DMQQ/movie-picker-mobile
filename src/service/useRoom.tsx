import { useContext, useEffect, useRef, useState } from "react";
import { SocketContext } from "./SocketContext";
import { useAppDispatch, useAppSelector } from "../redux/store";
import { roomActions } from "../redux/room/roomSlice";
import { Movie } from "../../types";
import { Image } from "react-native";
import ReviewManager from "../utils/rate";

export default function useRoom(room: string) {
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const setMatch = (movie: Movie) => {
    dispatch(roomActions.setMatch(movie));
  };
  const {
    nickname,
    isHost,
    room: { movies: cards, match, roomId, isFinished, users },
    isPlaying,
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
    if (!socket) return;

    const handleMovies = async (_cards: { movies: Movie[] }) => {
      setCards(_cards.movies);
      await Promise.all(_cards.movies.map((card: Movie) => Image.prefetch("https://image.tmdb.org/t/p/w780" + card.poster_path)));
    };

    // Setup listeners once
    socket.on("movies", handleMovies);
    socket.on("room:state", (data) => {
      if (data) {
        dispatch(roomActions.setRoom(data));
        dispatch(roomActions.setPlaying(data.isStarted));
      }
    });
    socket?.on("matched", (data: Movie) => {
      setMatch(data);
      dispatch(roomActions.addMatch(data));
    });
    socket.on("active", (users) => dispatch(roomActions.setActiveUsers(users)));

    // Initial room setup
    if (!isHost) {
      socket.emit("join-room", room, nickname);
    } else {
      socket.emit("get-movies", room);
    }

    return () => {
      socket.off("movies", handleMovies);
      socket.off("room:state");
      socket.off("matched");
      socket.off("active");
    };
  }, [socket, room, nickname, isHost]);

  const runOnce = useRef(false);
  useEffect(() => {
    if (isPlaying && runOnce.current === false && cards.length === 0) {
      runOnce.current = true;
      socket?.emit("get-movies", room);
    }
  }, [isPlaying, cards.length, room]);

  const removeCardLocally = (index: number) => {
    removeCard(index);
  };

  useEffect(() => {
    if (isFinished) {
      socket?.emit("finish", room);
      socket?.emit("get-buddy-status", room);
    }
  }, [isFinished, room]);

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

  const joinGame = async (code: string) => {
    const response = await socket?.emitWithAck("join-room", code, nickname);

    if (response.joined) {
      dispatch(roomActions.setRoom(response.room));
      dispatch(roomActions.setPlaying(response.room.isStarted));
    }
  };

  return {
    cards,
    likeCard,
    dislikeCard,
    showLeaveModal,
    match,
    hideMatchModal,
    toggleLeaveModal,
    isPlaying,
    joinGame,
  };
}
