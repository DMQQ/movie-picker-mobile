import { createSlice } from "@reduxjs/toolkit";
import { Movie } from "../../../types";

const initialState = {
  isHost: false,
  isCreated: false,
  joined: false,

  qrCode: "",

  room: {
    roomId: "",
    users: [],
    type: "",
    page: 1,
    name: "",

    matches: [] as Movie[],

    movies: [] as Movie[],
  },
};

type MovieMatch = Movie;

const roomSlice = createSlice({
  name: "room",
  initialState,
  reducers: {
    setRoom(state, action) {
      state.room.name = action.payload.name;
      state.room.roomId = action.payload.roomId;
      state.room.type = action.payload.type;
      state.room.page = action.payload.page;
      state.room.users = action.payload.users;
      state.room.matches = [];
      state.room.movies = [];
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
      state.room.matches.push(payload);
    },

    addMovies(
      state,
      {
        payload,
      }: {
        payload: Movie[];
      }
    ) {
      state.room.movies.push(...payload);
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
