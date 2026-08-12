import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { baseUrl } from "../../context/SocketContext";
import prepareHeaders from "../../service/prepareHeaders";
import { createReportingBaseQuery } from "../baseQuery";

export interface UserRating {
  id: string;
  contentId: number;
  contentType: "movie" | "tv";
  rating: number;
  review: string | null;
  createdAt: number;
  updatedAt: number;
  content?: { title?: string; poster_path?: string | null };
}

interface MyRatingsResponse {
  ratings: UserRating[];
  total: number;
  page: number;
}

interface UpsertRatingBody {
  rating: number;
  review?: string | null;
}

export const ratingsApi = createApi({
  reducerPath: "ratingsApi",
  baseQuery: createReportingBaseQuery(
    "ratings",
    fetchBaseQuery({ baseUrl: baseUrl + "/api", prepareHeaders }),
  ),
  tagTypes: ["Rating", "MyRatings"],
  endpoints: (build) => ({
    getMyRatings: build.query<MyRatingsResponse, { page?: number; limit?: number } | void>({
      query: (params) => {
        const p = params ?? {};
        const qs: string[] = [];
        if (p.page) qs.push(`page=${p.page}`);
        if (p.limit) qs.push(`limit=${p.limit}`);
        return `/ratings/me${qs.length ? `?${qs.join("&")}` : ""}`;
      },
      providesTags: ["MyRatings"],
    }),

    getMyRating: build.query<UserRating | null, { contentType: string; contentId: number }>({
      queryFn: async ({ contentType, contentId }, _api, _extraOptions, baseQuery) => {
        const result = await baseQuery(`/ratings/${contentType}/${contentId}/me`);
        if (result.error && (result.error as { status: unknown }).status === 404) {
          return { data: null };
        }
        return result as { data: UserRating | null };
      },
      providesTags: (_r, _e, { contentType, contentId }) => [
        { type: "Rating", id: `${contentType}:${contentId}` },
      ],
    }),

    upsertRating: build.mutation<{ ok: boolean }, { contentType: string; contentId: number } & UpsertRatingBody>({
      query: ({ contentType, contentId, ...body }) => ({
        url: `/ratings/${contentType}/${contentId}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (_r, _e, { contentType, contentId }) => [
        { type: "Rating", id: `${contentType}:${contentId}` },
        "MyRatings",
      ],
    }),

    deleteRating: build.mutation<{ ok: boolean }, { contentType: string; contentId: number }>({
      query: ({ contentType, contentId }) => ({
        url: `/ratings/${contentType}/${contentId}`,
        method: "DELETE",
      }),
      invalidatesTags: (_r, _e, { contentType, contentId }) => [
        { type: "Rating", id: `${contentType}:${contentId}` },
        "MyRatings",
      ],
    }),
  }),
});

export const {
  useGetMyRatingsQuery,
  useGetMyRatingQuery,
  useUpsertRatingMutation,
  useDeleteRatingMutation,
} = ratingsApi;
