import React, { createContext, useContext, useEffect, useCallback, useRef, useState, ReactNode } from "react";
import * as Sentry from "@sentry/react-native";
import { SocketContext } from "../context/SocketContext";
import { AsyncStorage } from "expo-sqlite/kv-store";
import { Movie } from "../../types";
import * as Haptics from "expo-haptics";
import { useAppSelector } from "../redux/store";
import { selectProviders } from "../redux/filterPreferences/filterPreferencesSlice";

interface Settings {
  language: string;
  region: string;
  providers: number[];
  genres: number[];
  category: "movie" | "tv" | "mixed";
}

interface MovieVoterContextValue {
  sessionId: string | null;
  status: "idle" | "waiting" | "rating" | "completed";
  users: Array<{ userId: string; ready: boolean; connected: boolean }>;
  currentMovies: Movie[];
  currentSetId: "A" | "B" | null;
  error: string | null;
  isHost: boolean;
  currentUserId: string | null;

  loadingInitialContent: boolean;
  actions: {
    createSession: () => void;
    joinSession: (sessionId: string) => Promise<void>;
    setReady: (ready: boolean) => void;
    startSession: () => void;
    submitRating: (movieId: string, ratings: RatingCriteria) => void;
    setSessionSettings: React.Dispatch<React.SetStateAction<Settings>>;
    setWaiting: () => void;
  };

  sessionSettings: Settings;

  sessionResults: {
    topPicks: Array<{
      movie: Movie;
      score: number;
      agreement: number;
      individualScores: {
        [userId: string]: number;
      };
    }>;
    selectedMovie?: Movie;
  } | null;
}

interface RatingCriteria {
  interest: number;
  mood: number;
  uniqueness: number;
}

const MovieVoterContext = createContext<MovieVoterContextValue | null>(null);

export const MovieVoterProvider = ({ children }: { children: ReactNode }) => {
  const { socket, emitter } = useContext(SocketContext);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [currentMovies, setCurrentMovies] = useState<Movie[]>([]);
  const [currentSetId, setCurrentSetId] = useState<"A" | "B" | null>(null);
  const [status, setStatus] = useState<"idle" | "waiting" | "rating" | "completed">("idle");
  const [users, setUsers] = useState<Array<{ userId: string; ready: boolean; connected: boolean }>>([]);
  const [error, setError] = useState<string | null>(null);
  const [isHost, setIsHost] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const [sessionSettings, setSessionSettings] = useState<Settings>({
    language: "en",
    region: "US",
    providers: [],
    genres: [],
    category: "movie",
  });

  const [sessionResults, setSessionResults] = useState<MovieVoterContextValue["sessionResults"]>(null);

  const savedProviders = useAppSelector(selectProviders);

  const prefilledProviders = useRef(false);
  useEffect(() => {
    if (status !== "idle" || prefilledProviders.current || savedProviders.length === 0) return;
    prefilledProviders.current = true;
    setSessionSettings((p) => ({ ...p, providers: savedProviders }));
  }, [status, savedProviders]);

  // Guards the auto-join effect so a session is joined exactly once —
  // previously joinSession + this effect emitted voter:session:join twice.
  const lastJoinedSessionId = useRef<string | null>(null);

  const createSession = useCallback(async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    if (!socket) return;

    const { sessionId, error } = await socket.emitWithAck("voter:session:create", {
      category: sessionSettings.category,
      genres: sessionSettings.genres,
      providers: sessionSettings.providers,
    });

    if (error) {
      setError(error);
      return;
    }

    const userId = await AsyncStorage.getItem("userId");
    setCurrentUserId(userId);
    setSessionId(sessionId);
    setStatus("waiting");
    setIsHost(true);
    AsyncStorage.setItem("voterSessionId", sessionId);
  }, [socket, sessionSettings]);

  const joinSession = useCallback(
    async (joinSessionId: string): Promise<void> => {
      setSessionId(joinSessionId);
      setStatus("waiting");

      if (!socket) {
        setError("Socket not available");
        return;
      }

      if (!socket.connected) {
        setError("Not connected to server");
        return;
      }

      lastJoinedSessionId.current = joinSessionId;
      return joinSessionInternal(joinSessionId);
    },
    [socket]
  );

  const joinSessionInternal = useCallback(
    async (joinSessionId: string) => {
      try {
        const response = await socket!.emitWithAck("voter:session:join", { sessionId: joinSessionId });

        if (response?.error) {
          setError(response.error);
          throw new Error(response.error);
        }

        const userId = await AsyncStorage.getItem("userId");
        setCurrentUserId(userId);
        setSessionId(joinSessionId);
        setStatus("waiting");

        const userIsHost = response?.isHost || false;
        setIsHost(userIsHost);
      } catch (error) {
        Sentry.captureException(error, { tags: { context: "voter_join" } });
        throw error;
      }
    },
    [socket]
  );

  const setReady = useCallback(
    (ready: boolean) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      if (!socket) {
        setError("Socket not available");
        return;
      }

      if (!sessionId) {
        setError("No session joined");
        return;
      }

      if (!socket.connected) {
        setError("Not connected to server");
        return;
      }

      socket.emit("voter:session:ready", { sessionId, ready });
    },
    [socket, sessionId]
  );

  const [loadingInitialContent, setLoadingInitialContent] = useState(false);

  const startSession = useCallback(async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    if (!socket || !sessionId || !isHost) return;

    setLoadingInitialContent(true);

    try {
      const response = await socket.emitWithAck("voter:session:start", { sessionId });

      if (response?.error) {
        setError(response.error);
      }
    } catch (error) {
      Sentry.captureException(error, { tags: { context: "voter_start" } });
    } finally {
      setLoadingInitialContent(false);
    }
  }, [socket, sessionId, isHost]);

  const submitRating = useCallback(
    (movieId: string, ratings: RatingCriteria) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      if (!socket || !sessionId) return;

      socket.emit("voter:rating:submit", {
        sessionId,
        movieId,
        ratings: {
          interest: ratings.interest,
          mood: ratings.mood,
          uniqueness: ratings.uniqueness,
        },
      });

      setCurrentMovies((prev) => prev.filter((m: any) => m.id !== movieId));
    },
    [socket, sessionId]
  );

  useEffect(() => {
    if (
      socket?.connected &&
      sessionId &&
      users.length === 0 &&
      !isHost &&
      lastJoinedSessionId.current !== sessionId
    ) {
      lastJoinedSessionId.current = sessionId;
      joinSessionInternal(sessionId).catch((error) => {
        console.error(error);
        Sentry.captureException(error, { tags: { context: "voter_auto_join" } });
      });
    }
  }, [socket, sessionId, users.length, isHost]);

  // Rejoin on socket reconnect: the server marks participants disconnected on
  // socket drop and only re-marks them connected via voter:session:join.
  useEffect(() => {
    if (!emitter || !socket || !sessionId) return;

    const onReconnected = async () => {
      try {
        const response = await socket.emitWithAck("voter:session:join", { sessionId });
        if (response?.error) {
          setError(response.error);
          return;
        }
        // isHost intentionally untouched — the join ack carries no host info.
      } catch (error) {
        Sentry.captureException(error, { tags: { context: "voter_reconnect" } });
      }
    };

    emitter.on("reconnected", onReconnected);
    return () => emitter.off("reconnected", onReconnected);
  }, [emitter, socket, sessionId]);

  useEffect(() => {
    if (!socket) return;

    const handleSessionUsers = ({ users: newUsers, sessionId: updateSessionId }: any) => {
      if (updateSessionId === sessionId) {
        setUsers(newUsers);
      }
    };

    const handleMoviesReceive = async ({ movies, setId }: any) => {
      if (movies.length === 0) {
        await socket.emitWithAck("voter:movies:refetch", { sessionId });
        return;
      }
      setCurrentMovies(movies);
      setCurrentSetId(setId);
      setStatus("rating");
    };

    const handleSessionUpdate = ({ session }: any) => {
      if (session.status === "completed") {
        setStatus("completed");
      }
    };

    const handleResults = ({ results }: any) => {
      setSessionResults(results);
      setStatus("completed");
    };

    const handleError = ({ error }: any) => {
      setError(error);
    };

    socket.on("voter:session:users", handleSessionUsers);
    socket.on("voter:movies:receive", handleMoviesReceive);
    socket.on("voter:session:update", handleSessionUpdate);
    socket.on("voter:results", handleResults);
    socket.on("voter:error", handleError);

    AsyncStorage.getItem("userId").then((userId) => {
      setCurrentUserId(userId);
    });

    return () => {
      socket.off("voter:session:users", handleSessionUsers);
      socket.off("voter:movies:receive", handleMoviesReceive);
      socket.off("voter:session:update", handleSessionUpdate);
      socket.off("voter:results", handleResults);
      socket.off("voter:error", handleError);
    };
  }, [socket, sessionId, joinSession]);

  const setWaiting = useCallback(() => {
    setStatus("waiting");
  }, []);

  const value: MovieVoterContextValue = {
    sessionId,
    status,
    users,
    currentMovies,
    currentSetId,
    error,
    isHost,
    currentUserId,
    actions: {
      createSession,
      joinSession,
      setReady,
      startSession,
      submitRating,
      setSessionSettings,
      setWaiting,
    },
    sessionResults,
    sessionSettings,

    loadingInitialContent,
  };

  return <MovieVoterContext.Provider value={value}>{children}</MovieVoterContext.Provider>;
};

export const useMovieVoter = () => {
  const context = useContext(MovieVoterContext);
  if (!context) {
    throw new Error("useMovieVoter must be used within a MovieVoterProvider");
  }
  return context;
};
