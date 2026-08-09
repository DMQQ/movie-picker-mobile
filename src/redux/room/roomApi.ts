import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { baseUrl } from "../../context/SocketContext";
import prepareHeaders from "../../service/prepareHeaders";
import { createReportingBaseQuery } from "../baseQuery";

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
  baseQuery: createReportingBaseQuery("room", fetchBaseQuery({
    baseUrl: baseUrl + "/api",
    prepareHeaders,
  })),
  endpoints: (build) => ({
    getActiveRoom: build.query<ActiveRoomResponse, void>({
      query: () => "/room/active",
    }),
  }),
});

export const { useGetActiveRoomQuery } = roomApi;
