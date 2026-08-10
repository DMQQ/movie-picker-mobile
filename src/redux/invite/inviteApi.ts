import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { baseUrl } from "../../context/SocketContext";
import prepareHeaders from "../../service/prepareHeaders";
import { createReportingBaseQuery } from "../baseQuery";

export interface Invite {
  id: string;
  senderId: string;
  receiverId: string;
  gameType: "swipe" | "voter";
  roomId: string;
  status: "pending" | "accepted" | "declined" | "expired";
  joinMethod: string | null;
  read: number;
  joined: number;
  createdAt: number;
  updatedAt: number;
  expiresAt: number;
}

export const inviteApi = createApi({
  reducerPath: "inviteApi",
  baseQuery: createReportingBaseQuery("invite", fetchBaseQuery({
    baseUrl: baseUrl + "/api",
    prepareHeaders,
  })),
  endpoints: (build) => ({
    getInvite: build.query<{ invite: Invite }, string>({
      query: (id) => `/invites/${id}`,
    }),

    sendInvite: build.mutation<
      { invite: Invite },
      { receiverId: string; gameType: string; roomId: string }
    >({
      query: (body) => ({ url: "/invites", method: "POST", body }),
    }),

    markInviteRead: build.mutation<{ ok: boolean }, string>({
      query: (id) => ({ url: `/invites/${id}/read`, method: "PATCH" }),
    }),

    acceptInvite: build.mutation<
      { invite: Invite },
      { id: string; joinMethod: "deeplink" | "manual" }
    >({
      query: ({ id, ...body }) => ({
        url: `/invites/${id}/accept`,
        method: "PATCH",
        body,
      }),
    }),

    declineInvite: build.mutation<{ ok: boolean }, string>({
      query: (id) => ({ url: `/invites/${id}/decline`, method: "PATCH" }),
      async onQueryStarted(_, { queryFulfilled }) {
        try {
          await queryFulfilled;
        } catch (err) {
          const status = (err as FetchBaseQueryError).status;
          if (status !== 404 && status !== 409 && status !== 410) throw err;
        }
      },
    }),

    getPendingInvites: build.query<{ invites: Invite[] }, void>({
      query: () => "/invites/me/pending",
    }),
  }),
});

export const {
  useGetInviteQuery,
  useSendInviteMutation,
  useMarkInviteReadMutation,
  useAcceptInviteMutation,
  useDeclineInviteMutation,
  useGetPendingInvitesQuery,
} = inviteApi;
