import { createSlice } from "@reduxjs/toolkit";
import { Movie } from "../../../types";
import { removeDuplicateResults } from "../../utils/deduplicates";
import { IGameSummary } from "../../components/GameSummary/types";

// Reconnect re-emits the same deck — detect it so addMovies keeps the current
// reference and selectors don't re-render for identical content.
const isSameDeck = (current: Movie[], incoming: Movie[]) =>
  current.length === incoming.length &&
  current.every((m, i) => m.id === incoming[i].id);

const initialState = {
  // Settings — survive resets
  nickname: "",
  language: "en",
  regionalization: {} as Record<string, string>,

  // Join / setup
  isHost: false,
  isCreated: false,
  joined: false,
  qrCode: "",
  isJoining: false,
  joinError: false,
  roomNotFound: false,
  beenFired: false,

  // Room data
  roomId: "",
  users: [] as string[],
  usersCount: 0,
  type: "",
  page: 1,
  name: "",
  maxRounds: 0,

  // Game lifecycle
  isPlaying: false,
  isRunning: false,
  isFinished: false,
  isGameFinished: false,
  gameEnded: false,
  canContinue: false,
  hasUserPlayed: false,

  // Card deck
  movies: [] as Movie[],
  index: 0,
  deckVersion: 0,

  // Matches / interactions
  match: undefined as Movie | undefined,
  partialMatch: undefined as
    | {
        movie: Movie;
        likedBy: { userId: string; username: string }[];
        totalUsers: number;
      }
    | undefined,
  pendingMatches: [] as Movie[],
  matches: [] as Movie[],
  likes: [] as Movie[],
  dislikes: [] as Movie[],
  gameSummary: null as IGameSummary | null,
};

type MovieMatch = Movie;

type SetRoomAction = {
  payload: {
    id?: string;
    roomId?: string;
    type: string;
    page: number;
    users: string[] | any[];
    gameEnded?: boolean;
    isStarted?: boolean;
    isGameFinished?: boolean;
    isRunning?: boolean;
    maxRounds?: number;
    [key: string]: any;
  };
};

const roomSlice = createSlice({
  name: "room",
  initialState,
  reducers: {
    setRoom(state, action: SetRoomAction) {
      const payload = action.payload;

      const roomId = payload?.roomId || payload?.id;
      if (roomId) {
        state.roomId = roomId;
        state.qrCode = roomId;
      }

      if (payload.maxRounds) state.maxRounds = payload.maxRounds;

      if (payload.type) state.type = payload.type;
      if (payload.page !== undefined) state.page = payload.page;
      if (payload.users) state.users = payload.users;

      if (payload.gameEnded !== undefined) {
        if (payload.gameEnded === false && state.gameEnded === true) {
          state.hasUserPlayed = false;
          state.isFinished = false;
          state.movies = [];
        }
        state.gameEnded = payload.gameEnded;
      }
      if (payload.canContinue !== undefined) state.canContinue = payload.canContinue;
      if (payload.isStarted !== undefined) state.isRunning = payload.isStarted;
      if (payload.isGameFinished !== undefined) state.isGameFinished = payload.isGameFinished;
      if (payload.isRunning !== undefined) state.isRunning = payload.isRunning;
    },

    setPlaying(state, action) {
      state.isPlaying = action.payload;
      if (action.payload) {
        state.joinError = false;
      }
    },

    setLanguage(state, action) {
      state.language = action.payload;
    },

    setSettings(
      state,
      {
        payload,
      }: {
        payload: Partial<{
          nickname: string;
          language: string;
          regionalization: Record<string, string>;
        }>;
      },
    ) {
      state.nickname = payload.nickname || state.nickname;
      state.language = payload.language || state.language;
      state.regionalization = payload.regionalization || state.regionalization;
    },

    setQRCode(state, action) {
      state.qrCode = action.payload;
      state.isCreated = true;
      state.isHost = true;
    },

    setHost(state, action) {
      state.isHost = action.payload;
    },

    setCreated(state, action) {
      state.isCreated = action.payload;
    },

    setJoined(state, action) {
      state.joined = action.payload;
    },

    addMatch(
      state,
      {
        payload,
      }: {
        payload: MovieMatch;
      },
    ) {
      if (!state.matches.find((m) => m.id === payload.id)) state.matches.push(payload);
    },

    setMatch(state, { payload }) {
      state.partialMatch = undefined;
      state.pendingMatches = [...state.pendingMatches, payload];

      if (state.match === undefined) {
        state.match = state.pendingMatches.shift() as Movie;
      }
    },

    setPartialMatch(
      state,
      {
        payload,
      }: {
        payload: {
          movie: Movie;
          likedBy: { userId: string; username: string }[];
          totalUsers: number;
        };
      },
    ) {
      state.partialMatch = payload;
    },

    clearPartialMatch(state) {
      state.partialMatch = undefined;
    },

    removeCurrentMatch(state) {
      state.match = undefined;

      if (state.pendingMatches.length !== 0) {
        state.match = state.pendingMatches.shift() as Movie;
      }
    },

    addMovies(
      state,
      {
        payload,
      }: {
        payload: { movies: Movie[]; index?: number };
      },
    ) {
      if (payload.movies.length > 0) {
        if (!isSameDeck(state.movies, payload.movies)) {
          state.movies = payload.movies;
          state.deckVersion += 1;
        }
        state.isFinished = false;
        state.beenFired = true;
        if (typeof payload.index === "number") {
          state.index = payload.index;
        }
      }
    },

    appendMovies(state, { payload }: { payload: { movies: Movie[]; index?: number } }) {
      if (payload.movies.length !== 0) {
        const likedIds = new Set(state.likes.map((m) => m.id));
        const dislikedIds = new Set(state.dislikes.map((m) => m.id));

        const filteredMovies = payload.movies.filter((m) => !likedIds.has(m.id) && !dislikedIds.has(m.id));

        state.movies = removeDuplicateResults([...state.movies, ...filteredMovies], "id");
        state.isFinished = false;
        if (typeof payload.index === "number") {
          state.index = payload.index;
        }
      }
    },

    removeMovie(
      state,
      {
        payload,
      }: {
        payload: number;
      },
    ) {
      state.movies = state.movies.filter((movie) => movie.id !== payload);

      if (state.movies.length === 0) {
        state.isFinished = true;
      }
    },

    likeMovie(state, { payload }) {
      state.hasUserPlayed = true;
      state.likes.push(payload);
    },

    dislikeMovie(state, { payload }) {
      state.hasUserPlayed = true;
      state.dislikes.push(payload);
    },

    setActiveUsers(state, { payload }) {
      state.usersCount = payload.length;
      state.users = payload;
    },

    reset(state) {
      const language = state.language;
      const nickname = state.nickname;
      const regionalization = { ...state.regionalization };
      Object.assign(state, initialState);
      state.language = language;
      state.nickname = nickname;
      state.regionalization = regionalization;
    },

    setRoomId(state, { payload }) {
      if (state.roomId === payload) {
        return;
      }
      const language = state.language;
      const nickname = state.nickname;
      const regionalization = { ...state.regionalization };
      Object.assign(state, initialState);
      state.language = language;
      state.nickname = nickname;
      state.regionalization = regionalization;
      state.roomId = payload;
      state.qrCode = payload;
      state.joined = true;
    },

    setJoinError(state, { payload }: { payload: boolean }) {
      state.joinError = payload;
    },

    setRoomNotFound(state, { payload }: { payload: boolean }) {
      state.roomNotFound = payload;
    },

    setIsJoining(state, { payload }: { payload: boolean }) {
      state.isJoining = payload;
    },

    setGameSummary(state, { payload }: { payload: IGameSummary }) {
      state.gameSummary = payload;
    },
  },
});

export { roomSlice };
export const roomActions = roomSlice.actions;
