import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { url as API_BASE_ENDPOINT } from "../../service/SocketContext";
import { Episode, Movie, MovieDetails } from "../../../types";
import { RootState } from "../store";

interface SearchParams {
  query?: string;
  page?: number;
  type?: "movie" | "tv" | "both";
  year?: number;
  with_genres?: number[];
  without_genres?: number[];
  with_watch_providers?: number[];
  vote_average_gte?: number;
  vote_count_gte?: number;
  similarToId?: number;
  discover?: boolean;
  language?: string;
  region?: string;
}

interface LandingPageParams {
  skip?: number;
  take?: number;
}

interface SectionParams {
  name: string;
  page?: number;
}

interface SearchResults {
  page: number;
  total_pages: number;
  total_results: number;
  results: any[]; // Replace with your actual movie/show type
}

export const movieApi = createApi({
  reducerPath: "movieApi",
  tagTypes: ["Search", "SearchResults"],
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_ENDPOINT,
    prepareHeaders: (headers, { getState }) => {
      headers.set("authorization", `Bearer ${(process.env as any).EXPO_PUBLIC_API_KEY as string}`);

      headers.set("X-User-Language", (getState() as RootState)?.room?.language || "en");

      const state = getState() as RootState;

      const defaultHeaders =
        state?.room?.language === "pl"
          ? {
              "x-user-language": "pl-PL",
              "x-user-region": "PL",
              "x-user-timezone": "Europe/Warsaw",
              "x-user-watch-provider": "PL",
              "x-user-watch-region": "PL",
            }
          : {
              "x-user-language": "en-US",
              "x-user-region": "US",
              "x-user-timezone": "America/New_York",
              "x-user-watch-provider": "US",
              "x-user-watch-region": "US",
            };

      const regionalization = state?.room?.regionalization || defaultHeaders;

      Object.entries(regionalization).forEach(([key, value]) => {
        headers.set(key, value);
      });

      return headers;
    },
  }),
  endpoints: (builder) => ({
    getLandingPageMovies: builder.query<{ name: string; results: Movie[] }[], LandingPageParams>({
      query: (params = { skip: 0, take: 5 }) => `/landing?skip=${params.skip}&take=${params.take}`,
    }),

    getMovie: builder.query<
      MovieDetails,
      {
        id: number;
        type: string;
      }
    >({
      query: ({ id, type }) => `/movie/${id}?type=${type}`,
    }),

    getMovieProviders: builder.query<any[], { id: number; type: string }>({
      query: ({ id, type }) => `/movie/providers/${id}?type=${type}`,
    }),

    getGenres: builder.query<any[], { type: string }>({
      query: ({ type }) => `/movie/genres/${type}`,
    }),

    getMaxPageRange: builder.query<{ maxCount: number }, { type: string; genres: string }>({
      query: ({ type, genres }) => `/movie/max-count?type=${type}&genres=${genres}`,
    }),

    getSectionMovies: builder.query<{ name: string; results: Movie[] }, SectionParams>({
      query: ({ name, page = 1 }) => `/landing/${name}/${page}`,
    }),

    getFeatured: builder.query<Movie, void>({
      query: () => `/landing/featured`,
    }),

    getSimilar: builder.query<{ name: string; results: Movie[] }, { id: number; type: "movie" | "tv"; page: number }>({
      query: ({ id, type, page }) => `/similar/${type}/${id}?page=${page || 1}`,
    }),

    getReviews: builder.query<any[], { id: number; type: "movie" | "tv" }>({
      query: ({ id, type }) => `/reviews/${type}/${id}`,
    }),

    getCategories: builder.query<any[], any>({
      query: () => "/categories",
    }),

    getAllProviders: builder.query<any[], any>({
      query: () => "/providers",
    }),

    getSeasonEpisodes: builder.query<
      {
        episodes: Episode[];
        _id: string;
        air_date: string;
      },
      { id: number; season: number }
    >({
      query: ({ id, season }) => `/tv/${id}/seasons/${season}`,
    }),

    search: builder.query<SearchResults, SearchParams & { operation?: "replace" | "append" }>({
      query: (params) => {
        // Remove operation parameter from API request
        const { operation, ...apiParams } = params;
        const queryParams = new URLSearchParams();

        Object.entries(apiParams).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            if (Array.isArray(value)) {
              queryParams.append(key, value.join(","));
            } else {
              queryParams.append(key, value.toString());
            }
          }
        });

        return {
          url: `unified-search?${queryParams.toString()}`,
          method: "GET",
        };
      },

      // Add cache tag which we can use for invalidation
      providesTags: ["SearchResults"],

      transformResponse: (response: any) => {
        return {
          ...response,
          results: (response.results || []).map((item: any) => ({
            ...item,
            key: item.id.toString(),
          })),
        };
      },
    }),
  }),
});

export const {
  useGetLandingPageMoviesQuery,
  useGetMovieQuery,

  useLazyGetMovieQuery,
  useGetMovieProvidersQuery,
  useGetGenresQuery,
  useGetMaxPageRangeQuery,
  useLazyGetLandingPageMoviesQuery,

  useLazyGetSectionMoviesQuery,

  useGetFeaturedQuery,

  useGetSimilarQuery,

  useLazyGetSimilarQuery,

  useGetReviewsQuery,

  useGetCategoriesQuery,

  useGetAllProvidersQuery,

  useLazyGetGenresQuery,

  useSearchQuery,

  useLazySearchQuery,

  useGetSeasonEpisodesQuery,
} = movieApi;
