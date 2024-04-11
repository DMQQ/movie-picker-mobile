import { createSlice } from "@reduxjs/toolkit";

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
  },
};

const roomSlice = createSlice({
  name: "room",
  initialState,
  reducers: {
    setRoom(state, action) {
      state.room = action.payload;
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
  },
});

export { roomSlice };
export const roomActions = roomSlice.actions;
