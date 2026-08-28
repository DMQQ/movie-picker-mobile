import { createContext, useCallback, useContext, useEffect, useMemo, useRef } from "react";
import { posthog } from "../constants/posthog";
import { SocketContext } from "./SocketContext";
import { usePartySocket } from "./PartySocketContext";
import { store } from "../redux/store";
import { eitherOrActions, type Side } from "../redux/eitherOr/eitherOrSlice";
import { useAppDispatch, useAppSelector } from "../redux/store";
import { partyActions } from "../redux/party/partySlice";
import type { PickedMovie } from "../redux/moviePicker/moviePickerSlice";

export interface EitherOrRoomConfig {
  type?: "movie" | "tv";
  genre?: number[];
  providers?: number[];
  bracketSize?: number;
  movies?: PickedMovie[];
}

type EitherOrActions = {
  createRoom: (config: EitherOrRoomConfig) => Promise<string | null>;
  joinRoom: (roomId: string) => Promise<boolean>;
  start: () => void;
  vote: (side: Side) => void;
  leaveRoom: () => void;
};

const noop = () => {};
const noopAsync = async () => null;
const noopJoin = async () => false;

const EitherOrContext = createContext<EitherOrActions>({
  createRoom: noopAsync,
  joinRoom: noopJoin,
  start: noop,
  vote: noop,
  leaveRoom: noop,
});

export default function useEitherOrContext() {
  return useContext(EitherOrContext);
}

export function EitherOrContextProvider({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();
  const { socket, emitter } = useContext(SocketContext);
  const partySocket = usePartySocket();
  const userId = useAppSelector((state) => state.app.userId);
  const nickname = useAppSelector((state) => state.app.nickname);
  const roomId = useAppSelector((state) => state.eitherOr.roomId);

  const userIdRef = useRef(userId);
  userIdRef.current = userId;
  const roomIdRef = useRef(roomId);
  roomIdRef.current = roomId;
  const nicknameRef = useRef(nickname);
  nicknameRef.current = nickname;

  const createRoom = useCallback(
    async (config: EitherOrRoomConfig) => {
      if (!socket) return null;

      try {
        const payload = {
          ...config,
          nickname: nicknameRef.current || "guest",
          userId: userIdRef.current,
        };
        const response = await socket.timeout(10000).emitWithAck("create-room", payload);

        if (!response?.roomId) {
          dispatch(eitherOrActions.setError(response?.error ?? "Failed to create room"));
          return null;
        }

        dispatch(eitherOrActions.setRoomId(response.roomId));
        dispatch(eitherOrActions.setIsHost(true));
        dispatch(eitherOrActions.setIsCustomRoom(!!(config.movies && config.movies.length > 0)));
        const partyId = store.getState().party.partyId;
        if (partyId) partySocket?.emit("party:join", partyId);
        return response.roomId as string;
      } catch (error) {
        posthog?.captureException(error, { context: "either_or_create" });
        dispatch(eitherOrActions.setError("Failed to create room"));
        return null;
      }
    },
    [socket, dispatch],
  );

  const joinRoom = useCallback(
    async (targetRoomId: string) => {
      if (!socket) {
        dispatch(eitherOrActions.setJoinError(true));
        return false;
      }

      dispatch(eitherOrActions.setJoining(true));
      dispatch(eitherOrActions.setJoinError(false));

      try {
        const response = await socket
          .timeout(10000)
          .emitWithAck("join-room", targetRoomId, nicknameRef.current || "guest");

        if (!response?.joined) {
          dispatch(eitherOrActions.setJoinError(true));
          return false;
        }

        dispatch(eitherOrActions.setRoomId(response.roomId));
        dispatch(eitherOrActions.setIsHost(false));
        if (response.partyId) {
          store.dispatch(partyActions.setParty({ partyId: response.partyId }));
          partySocket?.emit("party:join", response.partyId);
        }
        return true;
      } catch (error) {
        // Server sometimes sends room:state without calling the ack — if roomId
        // is already set it means the join succeeded despite the timeout.
        if (roomIdRef.current === targetRoomId) {
          return true;
        }
        posthog?.captureException(error, { context: "either_or_join" });
        dispatch(eitherOrActions.setJoinError(true));
        return false;
      } finally {
        dispatch(eitherOrActions.setJoining(false));
      }
    },
    [socket, dispatch],
  );

  const start = useCallback(() => {
    if (!socket || !roomIdRef.current) return;
    socket.emit("start", roomIdRef.current);
  }, [socket]);

  const vote = useCallback(
    (side: Side) => {
      if (!socket || !roomIdRef.current) return;
      dispatch(eitherOrActions.setVotedSide(side));
      socket.emit("vote", { roomId: roomIdRef.current, side });
    },
    [socket, dispatch],
  );

  const leaveRoom = useCallback(() => {
    if (!socket || !roomIdRef.current) return;
    socket.emit("leave-room", roomIdRef.current);
    dispatch(eitherOrActions.reset());
  }, [socket, dispatch]);

  const rejoin = useCallback(() => {
    if (!socket || !roomIdRef.current) return;
    socket
      .timeout(10000)
      .emitWithAck("join-room", roomIdRef.current, nicknameRef.current || "guest")
      .catch((error) => {
        posthog?.captureException(error, { context: "either_or_reconnect" });
      });
  }, [socket]);

  // Rejoin on socket.io internal reconnect (same socket object, network blip).
  useEffect(() => {
    if (!emitter || !socket || !roomId) return;
    emitter.on("reconnected", rejoin);
    return () => emitter.off("reconnected", rejoin);
  }, [emitter, socket, roomId, rejoin]);

  // Rejoin when the socket is fully reinitialized (SocketProvider deps changed —
  // authToken, userId, language). wasConnected resets to false in that case so
  // the emitter never fires; detect it by watching for a new socket object.
  const prevSocketRef = useRef<typeof socket | null>(null);
  useEffect(() => {
    if (!socket || !roomId) {
      prevSocketRef.current = socket;
      return;
    }
    if (prevSocketRef.current !== null && prevSocketRef.current !== socket) {
      rejoin();
    }
    prevSocketRef.current = socket;
  }, [socket, roomId, rejoin]);

  useEffect(() => {
    if (!socket) return;

    const handleRoomState = (data: any) => {
      if (!data) return;
      dispatch(eitherOrActions.setRoomState(data));
      const isHostNow = data.host === userIdRef.current;
      dispatch(eitherOrActions.setIsHost(isHostNow));
    };

    const handleActive = (nicks: string[]) => {
      dispatch(eitherOrActions.setActiveNicknames(nicks));
    };

    const handleHostChanged = (data: { host: string }) => {
      const nextIsHost = data.host === userIdRef.current;
      dispatch(eitherOrActions.setIsHost(nextIsHost));
    };

    const handleRoundStart = (data: any) => {
      dispatch(eitherOrActions.roundStart(data));
    };

    const handleVoteUpdate = (data: any) => {
      dispatch(eitherOrActions.voteUpdate(data));
    };

    const handleRoundWinner = (data: any) => {
      dispatch(eitherOrActions.roundWinner(data));
    };

    const handleGameComplete = (data: any) => {
      dispatch(eitherOrActions.gameComplete(data));
    };

    const handleRoomError = (data: { message: string }) => {
      dispatch(eitherOrActions.setError(data.message));
    };

    const handleRoomDeleted = () => {
      dispatch(eitherOrActions.setRoomDeleted());
    };

    socket.on("room:state", handleRoomState);
    socket.on("active", handleActive);
    socket.on("room:host:changed", handleHostChanged);
    socket.on("round:start", handleRoundStart);
    socket.on("round:vote-update", handleVoteUpdate);
    socket.on("round:winner", handleRoundWinner);
    socket.on("game:complete", handleGameComplete);
    socket.on("room:error", handleRoomError);
    socket.on("room-deleted", handleRoomDeleted);

    return () => {
      socket.off("room:state", handleRoomState);
      socket.off("active", handleActive);
      socket.off("room:host:changed", handleHostChanged);
      socket.off("round:start", handleRoundStart);
      socket.off("round:vote-update", handleVoteUpdate);
      socket.off("round:winner", handleRoundWinner);
      socket.off("game:complete", handleGameComplete);
      socket.off("room:error", handleRoomError);
      socket.off("room-deleted", handleRoomDeleted);
    };
  }, [socket, dispatch]);

  const value = useMemo<EitherOrActions>(
    () => ({ createRoom, joinRoom, start, vote, leaveRoom }),
    [createRoom, joinRoom, start, vote, leaveRoom],
  );

  return <EitherOrContext.Provider value={value}>{children}</EitherOrContext.Provider>;
}
