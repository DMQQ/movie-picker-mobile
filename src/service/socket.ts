import { io } from "socket.io-client";

export const socket = io("http://192.168.0.25:3000", {
  reconnectionAttempts: 5,
  reconnection: true,
  reconnectionDelayMax: 10000,
}).connect();
