import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { url as API_BASE_ENDPOINT } from "../../service/SocketContext";
import { RootState } from "../store";
// Define interfaces
interface Person {
  id: number;
  name: string;
  profile_path: string | null;
  known_for_department: string;
  popularity: number;
  adult: boolean;
  gender: number;
}

interface PersonDetails extends Person {
  biography: string;
  birthday: string | null;
  deathday: string | null;
  place_of_birth: string | null;
  homepage: string | null;
  imdb_id: string;
  also_known_as: string[];
  external_ids?: {
    imdb_id: string | null;
    facebook_id: string | null;
    instagram_id: string | null;
    twitter_id: string | null;
  };
  images?: {
    profiles: Array<{
      file_path: string;
      width: number;
      height: number;
      aspect_ratio: number;
      vote_average: number;
    }>;
  };
}

interface PersonSearchParams {
  query: string;
  page?: number;
  include_adult?: boolean;
  language?: string;
}

interface PersonSearchResponse {
  page: number;
  results: Person[];
  total_pages: number;
  total_results: number;
}

interface PersonCredits {
  cast: any[];
  crew: any[];
}

interface MovieKeyPeopleResponse {
  actors: Array<{
    id: number;
    name: string;
    character: string;
    profile_path: string | null;
  }>;
  directors: Array<{
    id: number;
    name: string;
    job: string;
    department: string;
    profile_path: string | null;
  }>;
}

interface CacheStats {
  size: number;
  methods: Record<string, number>;
}

// Create the API slice
export const personApi = createApi({
  reducerPath: "personApi",
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_ENDPOINT + "/people",
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
  tagTypes: ["Person", "MovieCredits", "TVCredits", "CombinedCredits", "KeyPeople", "Cache"],

  endpoints: (builder) => ({
    // Search for people
    searchPeople: builder.query<PersonSearchResponse, PersonSearchParams>({
      query: (params) => ({
        url: "/search",
        params,
      }),
      providesTags: (result) =>
        result
          ? [...result.results.map((person) => ({ type: "Person" as const, id: person.id })), { type: "Person", id: "SEARCH" }]
          : [{ type: "Person", id: "SEARCH" }],
    }),

    // Get popular people
    getPopularPeople: builder.query<PersonSearchResponse, { page?: number; language?: string }>({
      query: (params) => ({
        url: "/popular",
        params,
      }),
      providesTags: (result) =>
        result
          ? [...result.results.map((person) => ({ type: "Person" as const, id: person.id })), { type: "Person", id: "POPULAR" }]
          : [{ type: "Person", id: "POPULAR" }],
    }),

    // Get person details by ID
    getPersonDetails: builder.query<PersonDetails, { id: number; language?: string }>({
      query: ({ id, ...params }) => ({
        url: `/${id}`,
        params,
      }),
      providesTags: (result, error, arg) => [{ type: "Person", id: arg.id }],
    }),

    // Get person's movie credits
    getPersonMovieCredits: builder.query<PersonCredits, { id: number; language?: string }>({
      query: ({ id, ...params }) => ({
        url: `/${id}/movie-credits`,
        params,
      }),
      providesTags: (result, error, arg) => [
        { type: "Person", id: arg.id },
        { type: "MovieCredits", id: arg.id },
      ],
    }),

    // Get person's TV credits
    getPersonTVCredits: builder.query<PersonCredits, { id: number; language?: string }>({
      query: ({ id, ...params }) => ({
        url: `/${id}/tv-credits`,
        params,
      }),
      providesTags: (result, error, arg) => [
        { type: "Person", id: arg.id },
        { type: "TVCredits", id: arg.id },
      ],
    }),

    // Get person's combined credits
    getPersonCombinedCredits: builder.query<PersonCredits, { id: number; language?: string }>({
      query: ({ id, ...params }) => ({
        url: `/${id}/combined-credits`,
        params,
      }),
      providesTags: (result, error, arg) => [
        { type: "Person", id: arg.id },
        { type: "CombinedCredits", id: arg.id },
      ],
    }),

    // Find collaborators
    getCollaborators: builder.query<Person[], { id: number; limit?: number }>({
      query: ({ id, ...params }) => ({
        url: `/${id}/collaborators`,
        params,
      }),
      providesTags: (result, error, arg) => [
        { type: "Person", id: arg.id },
        ...(!result ? [] : result.map((person) => ({ type: "Person" as const, id: person.id }))),
      ],
    }),

    // Get key people for a movie (actors and director)
    getMovieKeyPeople: builder.query<
      MovieKeyPeopleResponse,
      {
        id: number;
        actorLimit?: number;
        includeDirector?: boolean;
        language?: string;
        type: "movie" | "tv";
      }
    >({
      query: ({ id, type, ...params }) => ({
        url: `/${type}/${id}/key-people`,
        params,
      }),
      providesTags: (result, error, arg) => [{ type: "KeyPeople", id: arg.id }],
    }),

    // Get cache stats
    getCacheStats: builder.query<CacheStats, void>({
      query: () => "/cache/stats",
      providesTags: [{ type: "Cache", id: "STATS" }],
    }),

    // Clear cache
    clearCache: builder.mutation<{ message: string }, void>({
      query: () => ({
        url: "/cache/clear",
        method: "POST",
      }),
      invalidatesTags: [
        { type: "Person", id: "LIST" },
        { type: "Person", id: "POPULAR" },
        { type: "Person", id: "SEARCH" },
        { type: "MovieCredits", id: "LIST" },
        { type: "TVCredits", id: "LIST" },
        { type: "CombinedCredits", id: "LIST" },
        { type: "KeyPeople", id: "LIST" },
        { type: "Cache", id: "STATS" },
      ],
    }),
  }),
});

// Export hooks for usage in components
export const {
  useSearchPeopleQuery,
  useGetPopularPeopleQuery,
  useGetPersonDetailsQuery,
  useGetPersonMovieCreditsQuery,
  useGetPersonTVCreditsQuery,
  useGetPersonCombinedCreditsQuery,
  useGetCollaboratorsQuery,
  useGetMovieKeyPeopleQuery,
  useGetCacheStatsQuery,
  useClearCacheMutation,

  useLazySearchPeopleQuery,
} = personApi;
