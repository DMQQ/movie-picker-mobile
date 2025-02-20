import React, { createContext, useContext, useEffect, useCallback, useState, ReactNode } from "react";
import { SocketContext } from "./SocketContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Movie } from "../../types";
import * as Haptics from "expo-haptics";

interface Settings {
  language: string;
  region: string;
  providers: never[];
  genres: never[];
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
  const { socket } = useContext(SocketContext);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [currentMovies, setCurrentMovies] = useState<Movie[]>([]);
  const [currentSetId, setCurrentSetId] = useState<"A" | "B" | null>(null);
  const [status, setStatus] = useState<"idle" | "waiting" | "rating" | "completed">("idle");
  const [users, setUsers] = useState<Array<{ userId: string; ready: boolean; connected: boolean }>>([]);
  const [error, setError] = useState<string | null>(null);
  const [isHost, setIsHost] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const [sessionSettings, setSessionSettings] = useState({
    language: "en",
    region: "US",
    providers: [],
    genres: [],
    category: "movie" as "movie" | "tv" | "mixed",
  });

  const [sessionResults, setSessionResults] = useState<MovieVoterContextValue["sessionResults"]>(null);

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
    async (joinSessionId: string) => {
      if (!socket) return;

      try {
        const { error } = await socket.emitWithAck("voter:session:join", { sessionId: joinSessionId });

        if (error) {
          setError(error);
          return;
        }
        const userId = await AsyncStorage.getItem("userId");
        setCurrentUserId(userId);
        setSessionId(joinSessionId);
        setStatus("waiting");
        setIsHost(false);
      } catch (error) {
        console.error("joinSession error", error);

        throw error;
      }
    },
    [socket]
  );

  socket?.on("voter:results", ({ results }) => {
    setSessionResults(results);
    setStatus("completed");
  });

  const setReady = useCallback(
    (ready: boolean) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      if (!socket || !sessionId) return;
      socket.emit("voter:session:ready", { sessionId, ready });
    },
    [socket, sessionId]
  );

  const [loadingInitialContent, setLoadingInitialContent] = useState(false);

  const startSession = useCallback(async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    setLoadingInitialContent(true);

    if (!socket || !sessionId || !isHost) return;

    const response = await socket.emitWithAck("voter:session:start", { sessionId });

    console.log("startSession", response);

    if (response?.error) {
      setError(response.error);
    } else {
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
    if (!socket) return;

    const handleSessionUsers = ({ users: newUsers, sessionId: updateSessionId }: any) => {
      if (updateSessionId === sessionId) {
        setUsers(newUsers);
      }
    };

    const handleMoviesReceive = async ({ movies, setId }: any) => {
      console.log(currentUserId, movies.length, setId);
      if (movies.length === 0) {
        console.log("refetching movies");
        await socket.emitWithAck("voter:movies:refetch", { sessionId });
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

    const handleError = ({ error }: any) => {
      setError(error);
    };

    socket.on("voter:session:users", handleSessionUsers);
    socket.on("voter:movies:receive", handleMoviesReceive);
    socket.on("voter:session:update", handleSessionUpdate);
    socket.on("voter:error", handleError);

    // Get initial user ID
    AsyncStorage.getItem("userId").then((userId) => {
      setCurrentUserId(userId);
    });

    return () => {
      socket.off("voter:session:users", handleSessionUsers);
      socket.off("voter:movies:receive", handleMoviesReceive);
      socket.off("voter:session:update", handleSessionUpdate);
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
