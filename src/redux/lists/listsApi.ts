import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { baseUrl } from "../../context/SocketContext";
import { RootState } from "../store";

export type SystemListType = "favourites" | "watchlist" | "watched" | "superliked" | "disliked";
export type ContentType = "movie" | "tv";

export interface UserList {
  id: string;
  name: string;
  type: string;
  posterPath: string | null;
  sessionId: string | null;
  itemCount: number;
  createdAt: number;
  updatedAt: number;
}

export interface ListItem {
  id: string;
  listId: string;
  contentId: number;
  contentType: ContentType;
  content: { title: string; poster_path: string | null };
  createdAt: number;
}

export interface GameSession {
  startTime: number;
  endTime: number | null;
  gameType: string | null;
  endReason: "normal_completion" | "manual_host" | "abandoned" | "deleted" | null;
  totalSwipes: number;
  totalMatches: number;
}

export interface UserGame {
  id: string;
  userId: string;
  name: string;
  type: string;
  sessionId: string;
  posterPath: string | null;
  createdAt: number;
  updatedAt: number;
  matchCount: number;
  session: GameSession | null;
}

interface GetListsResponse {
  lists: UserList[];
}

interface GetListResponse {
  list: UserList;
  items: ListItem[];
}

interface OkResponse {
  ok: boolean;
}

interface CreateListResponse {
  list: UserList;
}

interface GetGamesResponse {
  games: UserGame[];
}

export interface GameByIdResponse {
  list: Omit<UserGame, "matchCount" | "session">;
  items: ListItem[];
  session: GameSession | null;
}

export interface AddItemBody {
  contentId: number;
  contentType: ContentType;
  content: { title: string; poster_path: string | null };
}

export interface MigrateBody {
  groups: {
    name: string;
    type: string;
    movies: { id: number; type: ContentType; imageUrl: string }[];
  }[];
  interactions: {
    movieId: number;
    movieType: ContentType;
    interactionType: "blocked" | "super_liked";
    title: string;
    posterPath: string;
  }[];
  matches: {
    movieId: number;
    movieType: ContentType;
    title: string;
    posterPath: string;
    sessionId: string;
  }[];
}

export const listsApi = createApi({
  reducerPath: "listsApi",
  baseQuery: fetchBaseQuery({
    baseUrl: baseUrl + "/api/user",
    prepareHeaders(headers, { getState }) {
      const token = (getState() as RootState).auth.token;
      if (token) headers.set("authorization", `Bearer ${token}`);
      return headers;
    },
  }),
  tagTypes: ["List", "ListItems"],
  endpoints: (build) => ({
    getLists: build.query<GetListsResponse, void>({
      query: () => "/lists",
      providesTags: [{ type: "List", id: "ALL" }],
    }),

    getList: build.query<GetListResponse, string>({
      query: (type) => `/lists/${type}`,
      providesTags: (_result, _err, type) => [{ type: "ListItems", id: type }],
    }),

    addItem: build.mutation<OkResponse, { type: string } & AddItemBody>({
      query: ({ type, ...body }) => ({
        url: `/lists/${type}`,
        method: "POST",
        body,
      }),
      invalidatesTags: (_result, _err, { type }) => [
        { type: "ListItems", id: type },
        { type: "List", id: "ALL" },
      ],
    }),

    removeItem: build.mutation<OkResponse, { itemId: string; listType?: string }>({
      query: ({ itemId }) => ({
        url: `/lists/items/${itemId}`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _err, { listType }) => [
        { type: "List", id: "ALL" },
        ...(listType ? [{ type: "ListItems" as const, id: listType }] : []),
      ],
    }),

    createList: build.mutation<CreateListResponse, { name: string; type: string }>({
      query: (body) => ({ url: "/lists", method: "POST", body }),
      invalidatesTags: [{ type: "List", id: "ALL" }],
    }),

    deleteList: build.mutation<OkResponse, string>({
      query: (type) => ({ url: `/lists/${type}`, method: "DELETE" }),
      invalidatesTags: [{ type: "List", id: "ALL" }],
    }),

    migrateLists: build.mutation<{ imported: number }, MigrateBody>({
      query: (body) => ({ url: "/lists/migrate", method: "POST", body }),
      invalidatesTags: [{ type: "List", id: "ALL" }],
    }),

    getGames: build.query<GetGamesResponse, void>({
      query: () => "/games",
    }),

    getGame: build.query<GameByIdResponse, string>({
      query: (id) => `/games/${id}`,
    }),
  }),
});

export const {
  useGetListsQuery,
  useGetListQuery,
  useAddItemMutation,
  useRemoveItemMutation,
  useCreateListMutation,
  useDeleteListMutation,
  useMigrateListsMutation,
  useGetGamesQuery,
  useGetGameQuery,
} = listsApi;
