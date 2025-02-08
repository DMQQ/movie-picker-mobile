import { useContext, useEffect, useRef, useState } from "react";
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
    isHost,
    room: { movies: cards, match, roomId, isFinished },
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
    (async () => {
      // this causes issue with the room connection

      if (!isHost) {
        console.log("joining room", room, nickname);
        socket?.emit("join-room", room, nickname);
      } else {
        console.log("hosting room", room, nickname);
        socket?.emit("get-movies", room);
      }

      socket?.on("movies", async (_cards) => {
        if (_cards.movies.length === 0) {
          dispatch(roomActions.setGameFinished());
        }
        setCards(_cards.movies);
        await Promise.all(_cards.movies.map((card: Movie) => Image.prefetch("https://image.tmdb.org/t/p/w500" + card.poster_path)));
      });

      socket?.on("room:state", (data) => {
        if (data !== undefined) {
          dispatch(roomActions.setRoom(data));
          dispatch(roomActions.setPlaying(data.isStarted));
        }
      });

      socket?.on("matched", (data: Movie) => {
        setMatch(data);
        dispatch(roomActions.addMatch(data));
      });

      socket?.on("active", (users: number[]) => {
        dispatch(roomActions.setActiveUsers(users));
      });
    })();
  }, []);

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
      console.log("finished");
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

  return {
    cards,
    likeCard,
    dislikeCard,
    showLeaveModal,
    match,
    hideMatchModal,
    toggleLeaveModal,
    isPlaying,
  };
}
