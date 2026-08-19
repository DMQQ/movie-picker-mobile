import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { baseUrl } from "../../context/SocketContext";
import prepareHeaders from "../../service/prepareHeaders";
import { createReportingBaseQuery } from "../baseQuery";
import { posthog } from "../../constants/posthog";

export type SystemListType = "favourites" | "watchlist" | "watched" | "superliked" | "disliked";
export type ContentType = "movie" | "tv";

export interface UserListItem {
  id: string;
  contentId: number;
  contentType: ContentType;
  posterPath?: string | null;
  content?: { title?: string; poster_path?: string | null };
}

export interface ListPreviewItem {
  contentId: number;
  contentType: ContentType;
  posterPath: string | null;
}

export interface UserList {
  id: string;
  name: string;
  type: string;
  posterPath: string | null;
  sessionId: string | null;
  itemCount: number;
  createdAt: number;
  updatedAt: number;
  items?: UserListItem[];
  previewItems?: ListPreviewItem[];
}

export interface ListItem {
  id: string;
  listId: string;
  contentId: number;
  contentType: ContentType;
  content: { title: string; poster_path: string | null };
  rating?: number | null;
  review?: string | null;
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

export interface GameMember {
  id: string;
  name: string;
  avatarUrl: string | null;
  canReceiveNotification: boolean;
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
  members: GameMember[];
  session: GameSession | null;
}

interface GetListsResponse {
  lists: UserList[];
  total: number;
  page: number;
  limit: number;
}

interface GetListResponse {
  list: UserList;
  items: ListItem[];
  total: number;
  page: number;
  limit: number;
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
  list: Omit<UserGame, "matchCount" | "session" | "members">;
  items: ListItem[];
  members: GameMember[];
  session: GameSession | null;
}

interface GetGameMembersResponse {
  members: GameMember[];
}

export interface AddItemBody {
  contentId: number;
  contentType: ContentType;
  content: { title: string; poster_path: string | null };
}

export interface AddBulkItemsBody {
  type: string;
  items: AddItemBody[];
}

export interface MigrateBody {
  groups: {
    name: string;
    type: string;
    movies: { id: number; type: ContentType; imageUrl: string; title?: string }[];
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
  baseQuery: createReportingBaseQuery("lists", fetchBaseQuery({
    baseUrl: baseUrl + "/api/user",
    prepareHeaders,
  })),
  tagTypes: ["List", "ListItems"],
  endpoints: (build) => ({
    getLists: build.query<GetListsResponse, { page?: number; limit?: number }>({
      query: ({ page = 1, limit = 20 }) => `/lists?page=${page}&limit=${limit}`,
      serializeQueryArgs: ({ endpointName }) => endpointName,
      merge(currentCache, newItems, { arg }) {
        if ((arg.page ?? 1) === 1) {
          currentCache.lists = newItems.lists;
        } else {
          currentCache.lists.push(...newItems.lists);
        }
        currentCache.total = newItems.total;
        currentCache.page = newItems.page;
        currentCache.limit = newItems.limit;
      },
      forceRefetch({ currentArg, previousArg }) {
        return currentArg?.page !== previousArg?.page;
      },
      providesTags: [{ type: "List", id: "ALL" }],
      async onQueryStarted(_, { queryFulfilled }) {
        try {
          await queryFulfilled;
        } catch (err) {
          console.error("[listsApi.getLists] fetch error:", JSON.stringify(err));
        }
      },
    }),

    getList: build.query<GetListResponse, string>({
      query: (type) => `/lists/${type}?limit=200`,
      providesTags: (_result, _err, type) => [{ type: "ListItems", id: type }],
      async onQueryStarted(_, { queryFulfilled }) {
        try {
          await queryFulfilled;
        } catch (err) {
          console.error("[listsApi.getList] fetch error:", JSON.stringify(err));
        }
      },
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
      async onQueryStarted({ type }, { queryFulfilled }) {
        try {
          await queryFulfilled;
          posthog?.capture("list_item_added", { list_type: type });
        } catch {}
      },
    }),

    addBulkItems: build.mutation<OkResponse, AddBulkItemsBody>({
      query: ({ type, items }) => ({
        url: `/lists/${type}/items/bulk`,
        method: "POST",
        body: { items },
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
      async onQueryStarted({ listType }, { queryFulfilled }) {
        try {
          await queryFulfilled;
          posthog?.capture("list_item_removed", { list_type: listType ?? null });
        } catch {}
      },
    }),

    createList: build.mutation<CreateListResponse, { name: string; type: string }>({
      query: (body) => ({ url: "/lists", method: "POST", body }),
      invalidatesTags: [{ type: "List", id: "ALL" }],
      async onQueryStarted({ type }, { queryFulfilled }) {
        try {
          await queryFulfilled;
          posthog?.capture("list_created", { type });
        } catch {}
      },
    }),

    deleteList: build.mutation<OkResponse, string>({
      query: (type) => ({ url: `/lists/${type}`, method: "DELETE" }),
      invalidatesTags: [{ type: "List", id: "ALL" }],
    }),

    patchItem: build.mutation<OkResponse, { itemId: string; listType?: string; rating?: number | null; review?: string | null }>({
      query: ({ itemId, listType: _listType, ...body }) => ({
        url: `/lists/items/${itemId}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (_result, _err, { listType }) => [
        ...(listType ? [{ type: "ListItems" as const, id: listType }] : []),
      ],
    }),

    migrateLists: build.mutation<{ ok: boolean; queued: boolean }, MigrateBody>({
      query: (body) => ({ url: "/lists/migrate", method: "POST", body }),
      invalidatesTags: [{ type: "List", id: "ALL" }, { type: "ListItems" }],
      async onQueryStarted(_, { queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          posthog?.capture("lists_migrated", { queued: data.queued });
        } catch {}
      },
    }),

    getGames: build.query<GetGamesResponse, void>({
      query: () => "/games",
      async onQueryStarted(_, { queryFulfilled }) {
        try {
          await queryFulfilled;
        } catch (err) {
          console.error("[listsApi.getGames] fetch error:", JSON.stringify(err));
        }
      },
    }),

    getGame: build.query<GameByIdResponse, string>({
      query: (id) => `/games/${id}`,
    }),

    getGameMembers: build.query<GetGameMembersResponse, void>({
      query: () => "/games/members",
    }),
  }),
});

export const {
  useGetListsQuery,
  useGetListQuery,
  useAddItemMutation,
  useAddBulkItemsMutation,
  useRemoveItemMutation,
  useCreateListMutation,
  useDeleteListMutation,
  usePatchItemMutation,
  useMigrateListsMutation,
  useGetGamesQuery,
  useGetGameQuery,
  useGetGameMembersQuery,
} = listsApi;
