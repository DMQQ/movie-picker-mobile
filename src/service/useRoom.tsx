import { useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { Movie } from "../../types";
import { prefetchThumbnail, ThumbnailSizes } from "../components/Thumbnail";
import { roomActions } from "../redux/room/roomSlice";
import { useAppDispatch, useAppSelector } from "../redux/store";
import { SocketContext } from "./SocketContext";

export default function useRoom(room: string) {
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const initialCardsLength = useRef(0);
  const setMatch = (movie: Movie) => {
    dispatch(roomActions.setMatch(movie));
  };
  const {
    nickname,
    isHost,
    room: { movies: cards, match, roomId, isFinished, likes },
    isPlaying,
  } = useAppSelector((state) => state.room);

  const setCards = (_movies: Movie[]) => {
    initialCardsLength.current = _movies.length;
    dispatch(roomActions.addMovies(_movies));
  };

  const removeCard = (index: number) => {
    dispatch(roomActions.removeMovie(index));
  };

  const dispatch = useAppDispatch();
  const { socket } = useContext(SocketContext);

  const handleMovies = useCallback(async (_cards: { movies: Movie[] }) => {
    await Promise.all(
      _cards.movies.map((card: Movie) => prefetchThumbnail(card.poster_path || card.backdrop_path || "", ThumbnailSizes.poster.xxlarge))
    );

    setCards(_cards.movies);
  }, []);

  const handleRoomState = useCallback((data: any) => {
    if (!data) return;

    dispatch(roomActions.setRoom(data));
    dispatch(roomActions.setPlaying(data.isStarted));
  }, []);

  const handleMatched = useCallback((data: Movie) => {
    if (!data) return;
    setMatch(data);
    dispatch(roomActions.addMatch(data));
  }, []);

  const handleActive = useCallback((users: any) => dispatch(roomActions.setActiveUsers(users)), []);

  useEffect(() => {
    if (!socket) return;

    socket.emit("join-room", room, nickname);

    socket.emit("get-movies", room);
  }, [socket, room]);

  useEffect(() => {
    if (!socket || !room) return;

    socket.on("movies", handleMovies);
    socket.on("room:state", handleRoomState);
    socket?.on("matched", handleMatched);
    socket.on("active", handleActive);

    return () => {
      socket.off("movies", handleMovies);
      socket.off("room:state", handleRoomState);
      socket.off("matched", handleMatched);
      socket.off("active", handleActive);
    };
  }, [socket]);

  const runOnce = useRef(false);
  useEffect(() => {
    if (isPlaying && runOnce.current === false && cards.length === 0 && socket) {
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

  const likeCard = async (card: Movie, index: number) => {
    socket?.emit("pick-movie", {
      roomId: room,
      index,
      swipe: { type: "like", movie: card.id },
    });
    removeCardLocally(index);
    dispatch(roomActions.likeMovie(card));
  };

  const dislikeCard = (card: Movie, index: number) => {
    socket?.emit("pick-movie", {
      roomId: room,
      index,
      swipe: { type: "dislike", movie: card.id },
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

  useEffect(() => {
    if (cards.length === Math.trunc(initialCardsLength.current / 4) && initialCardsLength.current > 0) {
      socket?.emitWithAck("get-next-page", roomId).then((response) => {
        if (response?.movies && response.movies.length > 0) {
          dispatch(roomActions.appendMovies(response.movies));
        }
      });
    }
  }, [cards.length]);

  return useMemo(
    () => ({
      cards,
      likeCard,
      dislikeCard,
      showLeaveModal,
      match,
      hideMatchModal,
      toggleLeaveModal,
      isPlaying,
      joinGame,
    }),
    [cards, likeCard, dislikeCard, showLeaveModal, match, hideMatchModal, toggleLeaveModal, isPlaying, joinGame]
  );
}
