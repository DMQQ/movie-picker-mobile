import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { url as API_BASE_ENDPOINT } from "../../service/SocketContext";
import { MovieDetails } from "../../../types";

export const movieApi = createApi({
  reducerPath: "movieApi",
  baseQuery: fetchBaseQuery({ baseUrl: API_BASE_ENDPOINT }),
  endpoints: (builder) => ({
    getLandingPageMovies: builder.query({
      query: () => "/landing",
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

    getMaxPageRange: builder.query<
      { maxCount: number },
      { type: string; genres: string }
    >({
      query: ({ type, genres }) =>
        `/movie/max-count?type=${type}&genres=${genres}`,
    }),
  }),
});

export const {
  useGetLandingPageMoviesQuery,
  useGetMovieQuery,
  useGetMovieProvidersQuery,
  useGetGenresQuery,
  useGetMaxPageRangeQuery,
} = movieApi;
