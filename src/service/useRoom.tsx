import { useContext, useEffect, useRef, useState } from "react";
import { SocketContext } from "./SocketContext";
import { useAppDispatch, useAppSelector } from "../redux/store";
import { roomActions } from "../redux/room/roomSlice";
import { Movie } from "../../types";
import { prefetchThumbnail, ThumbnailSizes } from "../components/Thumbnail";
import { Platform } from "react-native";

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
    if (Platform.OS === "web" && (isPlaying || cards.length > 0)) {
      const handleBeforeUnload = (e: BeforeUnloadEvent) => {
        e.preventDefault();
        e.returnValue = "";
        return "";
      };

      const saveState = () => {
        if (typeof window !== "undefined") {
          sessionStorage.setItem(
            "roomState",
            JSON.stringify({
              room,
              nickname,
              isHost,
              cards,
              isPlaying,
              roomId,
            })
          );
        }
      };

      window.addEventListener("beforeunload", handleBeforeUnload);
      window.addEventListener("visibilitychange", saveState);

      return () => {
        window.removeEventListener("beforeunload", handleBeforeUnload);
        window.removeEventListener("visibilitychange", saveState);
      };
    }
  }, [isPlaying, cards.length, room, nickname, isHost, roomId]);

  useEffect(() => {
    if (Platform.OS === "web" && typeof window !== "undefined") {
      const savedState = sessionStorage.getItem("roomState");
      if (savedState) {
        const state = JSON.parse(savedState);
        if (state.room === room) {
          dispatch(roomActions.addMovies(state.cards));
          dispatch(roomActions.setPlaying(state.isPlaying));
          sessionStorage.removeItem("roomState");
        }
      }
    }
  }, []);

  useEffect(() => {
    if (!socket) return;

    const handleMovies = async (_cards: { movies: Movie[] }) => {
      await Promise.all(
        _cards.movies.map((card: Movie) => prefetchThumbnail(card.poster_path || card.backdrop_path || "", ThumbnailSizes.poster.xxlarge))
      );

      setCards(_cards.movies);
    };

    socket.on("movies", handleMovies);
    socket.on("room:state", (data) => {
      if (data) {
        console.log("Room state updated:", data);
        dispatch(roomActions.setRoom(data));
        dispatch(roomActions.setPlaying(data.isStarted));
      }
    });
    socket?.on("matched", (data: Movie) => {
      setMatch(data);
      dispatch(roomActions.addMatch(data));
    });
    socket.on("active", (users) => dispatch(roomActions.setActiveUsers(users)));

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

    if (response.joined && response?.room) {
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
