import { createSlice } from "@reduxjs/toolkit";
import { Movie } from "../../../types";
import { removeDuplicateResults } from "../../utils/deduplicates";

const initialState = {
  isHost: false,
  isCreated: false,
  joined: false,
  qrCode: "",
  nickname: "",
  language: "en",
  regionalization: {} as Record<string, string>,
  isPlaying: false,
  beenFired: false,

  room: {
    roomId: "",
    users: [] as string[],

    usersCount: 0,

    type: "",
    page: 1,
    name: "",

    isGameFinished: false,
    gameEnded: false,
    canContinue: false,

    hasUserPlayed: false,

    isFinished: false,

    match: undefined as Movie | undefined,

    pendingMatches: [] as Movie[],
    movies: [] as Movie[],
    matches: [] as Movie[],
    likes: [] as Movie[],
    dislikes: [] as Movie[],

    isRunning: false,
  },
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
    [key: string]: any; // Allow additional fields from backend
  };
};

const roomSlice = createSlice({
  name: "room",
  initialState,
  reducers: {
    setRoom(state, action: SetRoomAction) {
      const payload = action.payload;

      // Handle room ID from either field
      const roomId = payload?.roomId || payload?.id;
      if (roomId) {
        state.room.roomId = roomId;
        state.qrCode = roomId;
      }

      // Update existing fields
      if (payload.type) state.room.type = payload.type;
      if (payload.page !== undefined) state.room.page = payload.page;
      if (payload.users) state.room.users = payload.users;

      // Update new game state fields
      if (payload.gameEnded !== undefined) {
        // If transitioning from ended to not ended (play again), reset play state but keep user data
        if (payload.gameEnded === false && state.room.gameEnded === true) {
          state.room.hasUserPlayed = false;
          state.room.isFinished = false;
          state.room.movies = [];
          // matches, likes, and dislikes ALL persist across rounds
        }
        state.room.gameEnded = payload.gameEnded;
      }
      if (payload.canContinue !== undefined) state.room.canContinue = payload.canContinue;
      if (payload.isStarted !== undefined) state.room.isRunning = payload.isStarted;
      if (payload.isGameFinished !== undefined) state.room.isGameFinished = payload.isGameFinished;
      if (payload.isRunning !== undefined) state.room.isRunning = payload.isRunning;
    },

    start(state) {
      state.room.isRunning = true;
    },

    setGameFinished(state) {
      state.room.isGameFinished = true;
    },

    setPlaying(state, action) {
      state.isPlaying = action.payload;
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

    setUsers(state, action) {
      state.room.users = action.payload;
    },

    addMatch(
      state,
      {
        payload,
      }: {
        payload: MovieMatch;
      },
    ) {
      if (!state.room.matches.find((m) => m.id === payload.id)) state.room.matches.push(payload);
    },

    setMatch(state, { payload }) {
      state.room.pendingMatches = [...state.room.pendingMatches, payload];

      if (state.room.match === undefined) {
        state.room.match = state.room.pendingMatches.shift() as Movie;
      }
    },

    removeCurrentMatch(state) {
      state.room.match = undefined;

      if (state.room.pendingMatches.length !== 0) {
        state.room.match = state.room.pendingMatches.shift() as Movie;
      }
    },

    addMovies(
      state,
      {
        payload,
      }: {
        payload: Movie[];
      },
    ) {
      if (payload.length > 0) {
        state.room.movies = payload;
        state.room.isFinished = false;
        state.beenFired = true;
      }
    },

    appendMovies(state, { payload }: { payload: Movie[] }) {
      if (payload.length !== 0) {
        state.room.movies = removeDuplicateResults([...state.room.movies, ...payload], "id");
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
      state.room.movies.splice(payload, 1);

      if (state.room.movies.length === 0) {
        state.room.isFinished = true;
      }
    },

    likeMovie(state, { payload }) {
      state.room.hasUserPlayed = true;

      state.room.likes.push(payload);
    },

    dislikeMovie(state, { payload }) {
      state.room.hasUserPlayed = true;
      state.room.dislikes.push(payload);
    },

    setActiveUsers(state, { payload }) {
      state.room.usersCount = payload.length;
      state.room.users = payload;
    },

    setRoomState(state, { payload }) {
      state.room.isFinished = false;
      state.room = payload.room;
      state.room.movies = payload.movies;
      state.room.users = payload.room.users;
      state.room.isRunning = payload.isRunning;
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
      state.room.roomId = payload;
      state.qrCode = payload;
    },
  },
});

export { roomSlice };
export const roomActions = roomSlice.actions;
