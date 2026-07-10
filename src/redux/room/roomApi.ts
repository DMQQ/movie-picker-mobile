import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { baseUrl } from "../../context/SocketContext";
import { RootState } from "../store";
import envs from "../../constants/envs";

interface ActiveRoom {
  roomId: string;
  isStarted: boolean;
  isEnded: boolean;
  participantCount: number;
}

interface ActiveRoomResponse {
  room: ActiveRoom | null;
}

export const roomApi = createApi({
  reducerPath: "roomApi",
  baseQuery: fetchBaseQuery({
    baseUrl: baseUrl + "/api",
    prepareHeaders(headers, { getState }) {
      const state = getState() as RootState;
      const userToken = state.auth.token;

      if (userToken) {
        headers.set("authorization", `Bearer ${userToken}`);
      } else {
        headers.set("authorization", `Bearer ${envs.server_auth_token}`);
        const userId = state.app.userId;
        if (userId) headers.set("user-id", userId);
      }

      return headers;
    },
  }),
  endpoints: (build) => ({
    getActiveRoom: build.query<ActiveRoomResponse, void>({
      query: () => "/room/active",
    }),
  }),
});

export const { useGetActiveRoomQuery } = roomApi;
