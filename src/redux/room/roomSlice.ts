import { createSlice } from "@reduxjs/toolkit";
import { Movie } from "../../../types";

const initialState = {
  isHost: false,
  isCreated: false,
  joined: false,
  qrCode: "",
  nickname: "",
  language: "en",

  beenFired: false,

  room: {
    roomId: "",
    users: [] as string[],

    usersCount: 0,

    type: "",
    page: 1,
    name: "",

    isFinished: false,

    match: undefined as Movie | undefined,

    pendingMatches: [] as Movie[],
    movies: [] as Movie[],
    matches: [] as Movie[],
    likes: [] as Movie[],
  },
};

type MovieMatch = Movie;

type SetRoomAction = {
  payload: {
    id: string;
    type: string;
    page: number;
    users: string[];
  };
};

const roomSlice = createSlice({
  name: "room",
  initialState,
  reducers: {
    setRoom(state, action: SetRoomAction) {
      state.room.roomId = action.payload.id;
      state.qrCode = action.payload.id;
      state.room.type = action.payload.type;
      state.room.page = action.payload.page;
      state.room.users = action.payload.users;
      state.room.matches = [];
      state.room.movies = [];
    },

    setSettings(
      state,
      {
        payload,
      }: {
        payload: {
          nickname: string;
          language: string;
        };
      }
    ) {
      state.nickname = payload.nickname;
      state.language = payload.language;
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
      }
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
      }
    ) {
      if (payload.length !== 0) {
        state.room.movies = payload;
        state.room.isFinished = false;
        state.beenFired = true;
      }
    },

    removeMovie(
      state,
      {
        payload,
      }: {
        payload: number;
      }
    ) {
      state.room.movies.splice(payload, 1);

      if (state.room.movies.length === 0) {
        state.room.isFinished = true;
      }
    },

    likeMovie(state, { payload }) {
      state.room.likes.push(payload);
    },

    setActiveUsers(state, { payload }) {
      state.room.usersCount = payload.length;
      state.room.users = payload;
    },

    reset(state) {
      state.room = initialState.room;
      state.qrCode = "";
      state.isHost = false;
      state.isCreated = false;
      state.joined = false;
    },
  },
});

export { roomSlice };
export const roomActions = roomSlice.actions;
