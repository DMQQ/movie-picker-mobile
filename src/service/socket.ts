import { io } from "socket.io-client";

const url = "http://srv25.mikr.us:40056"; // "http://192.168.0.25:3000";

export const socket = io(url, {
  reconnectionAttempts: 5,
  reconnection: true,
  reconnectionDelayMax: 10000,
  port: 40056,
  secure: false,
  ackTimeout: 10000,
}).connect();
