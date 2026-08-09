import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { baseUrl } from "../../context/SocketContext";
import prepareHeaders from "../../service/prepareHeaders";
import { createReportingBaseQuery } from "../baseQuery";

export interface ScoringGenre {
  id: number;
  name: string;
  /** 0–100, where 100 = strongest feature in the vector. */
  score: number;
}

export interface ScoringKeyword {
  id: number;
  name: string;
  /** 0–100, where 100 = strongest feature in the vector. */
  score: number;
}

export interface ScoringProfile {
  genres: ScoringGenre[];
  keywords: ScoringKeyword[];
  /** Total keyword count (for pagination — keywords may be sliced). */
  keywordsTotal: number;
  computedAt: number;
}

export interface ScoringPreferencesResponse {
  movie: ScoringProfile | null;
  tv: ScoringProfile | null;
}

interface ScoringQueryParams {
  type?: "movie" | "tv" | "both";
  page?: number;
  limit?: number;
  /** DB-level name lookup across all keywords. */
  q?: string;
}

export const scoringPreferencesApi = createApi({
  reducerPath: "scoringPreferencesApi",
  baseQuery: createReportingBaseQuery(
    "scoring-preferences",
    fetchBaseQuery({
      baseUrl: baseUrl + "/api/user",
      prepareHeaders,
    }),
  ),
  tagTypes: ["ScoringPreferences"],
  endpoints: (build) => ({
    getScoringPreferences: build.query<
      ScoringPreferencesResponse,
      ScoringQueryParams | void
    >({
      query: (params) => {
        if (!params) return "/scoring-preferences";
        const q: Record<string, string> = {};
        if (params.type) q.type = params.type;
        if (params.page) q.page = String(params.page);
        if (params.limit) q.limit = String(params.limit);
        if (params.q) q.q = params.q;
        return { url: "/scoring-preferences", params: q };
      },
      providesTags: ["ScoringPreferences"],
    }),
    removeScoringItems: build.mutation<
      { ok: boolean },
      { genres?: number[]; keywords?: number[]; contentType?: "movie" | "tv" }
    >({
      query: (body) => ({ url: "/scoring-preferences", method: "PATCH", body }),
      invalidatesTags: ["ScoringPreferences"],
    }),
    resetScoringPreferences: build.mutation<
      { ok: boolean },
      "movie" | "tv" | "both" | void
    >({
      query: (type) => ({
        url: "/scoring-preferences",
        method: "DELETE",
        params: type ? { type } : undefined,
      }),
      invalidatesTags: ["ScoringPreferences"],
    }),
  }),
});

export const {
  useGetScoringPreferencesQuery,
  useRemoveScoringItemsMutation,
  useResetScoringPreferencesMutation,
} = scoringPreferencesApi;
