import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
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
  tagTypes: ["Invite"],
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
      invalidatesTags: [{ type: "Invite", id: "PENDING" }],
    }),

    declineInvite: build.mutation<{ ok: boolean }, string>({
      query: (id) => ({ url: `/invites/${id}/decline`, method: "PATCH" }),
      invalidatesTags: [{ type: "Invite", id: "PENDING" }],
      async onQueryStarted(_, { queryFulfilled }) {
        try {
          await queryFulfilled;
        } catch {
          // Expected statuses (404/409/410) are silent; other failures are
          // already reported by createReportingBaseQuery.
        }
      },
    }),

    getPendingInvites: build.query<{ invites: Invite[] }, void>({
      query: () => "/invites/me/pending",
      providesTags: [{ type: "Invite" as const, id: "PENDING" }],
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
