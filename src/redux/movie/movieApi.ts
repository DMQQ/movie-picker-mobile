import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { url as API_BASE_ENDPOINT } from "../../service/SocketContext";
import { Movie, MovieDetails } from "../../../types";
import { RootState } from "../store";

interface LandingPageParams {
  skip?: number;
  take?: number;
}

interface SectionParams {
  name: string;
  page?: number;
}

export const movieApi = createApi({
  reducerPath: "movieApi",
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_ENDPOINT,
    prepareHeaders: (headers, { getState }) => {
      headers.set("authorization", `Bearer ${(process.env as any).EXPO_PUBLIC_API_KEY as string}`);

      headers.set("X-User-Language", (getState() as RootState)?.room?.language || "en");

      const state = getState() as RootState;

      if (state?.room?.language === "pl") {
        headers.set("x-user-language", "pl-PL");
        headers.set("x-user-region", "PL");
        headers.set("x-user-timezone", "Europe/Warsaw");
        headers.set("x-user-watch-provider", "PL");
        headers.set("x-user-watch-region", "PL");
      } else {
        headers.set("x-user-language", "en-US");
        headers.set("x-user-region", "US");
        headers.set("x-user-timezone", "America/New_York");
        headers.set("x-user-watch-provider", "US");
        headers.set("x-user-watch-region", "US");
      }

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
} = movieApi;
