import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { SectionData } from "../../types";
import { Episode, Movie, MovieDetails } from "../../../types";
import { url as API_BASE_ENDPOINT } from "../../context/SocketContext";
import prepareHeaders from "../../service/prepareHeaders";
import { createReportingBaseQuery } from "../baseQuery";

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

  category?: string;
}

interface SectionParams {
  name: string;
  page?: number;
}

interface RandomSectionParams {
  not?: string;
  type?: "movie" | "tv" | "both";
  providers?: number[];
  genres?: number[];
  decade?: string;

  notMovies?: string;
}

interface SearchResults {
  page: number;
  total_pages: number;
  total_results: number;
  results: any[]; // Replace with your actual movie/show type
}

interface CategoryWithThumbnails {
  id: string;
  label: string;
  path: string;
  type: "movie" | "tv";
  thumbnails: string[];
  featured_poster: string;
}

interface GenreWithThumbnail {
  id: number;
  name: string;
  representative_poster: string;
  representative_title: string;
}

interface SpecialCategoryWithThumbnail {
  id: string;
  label: string;
  icon: string;
  iconColor: string;
  representative_poster: string;
  representative_title: string;
}

interface RoomConfig {
  category: string;
  genres: number[];
  providers: number[];
  specialCategories: string[];
}

interface ValidationResult {
  isValid: boolean;
  estimatedCount: number;
  warnings: string[];
}

interface PrefetchResult {
  cacheKey: string;
  estimatedCount: number;
}

interface MarathonMovie {
  id: number;
  title?: string;
  name?: string;
  poster_path: string;
  type?: "movie" | "tv";
  vote_average?: number;
  runtime?: number;
  genres?: string[];
}

interface SummaryShareResponse {
  movies: MarathonMovie[];
  roomId: string;
  type: "movie" | "tv";
}

export const movieApi = createApi({
  reducerPath: "movieApi",
  tagTypes: ["Search", "SearchResults", "LandingPageInfinite"],
  baseQuery: createReportingBaseQuery("movie", fetchBaseQuery({
    baseUrl: API_BASE_ENDPOINT,
    prepareHeaders: prepareHeaders,
  })),
  keepUnusedDataFor: 60,
  refetchOnMountOrArgChange: 300,
  endpoints: (builder) => ({
    getLandingPageSections: builder.infiniteQuery<
      SectionData[],
      { categoryId: string; pageSize?: number },
      number
    >({
      query: ({ queryArg: { categoryId, pageSize = 4 }, pageParam }) => ({
        url: `/landing?skip=${pageParam * (pageSize ?? 4)}&take=${pageSize ?? 4}${
          categoryId && categoryId !== "all" ? `&category=${categoryId}` : ""
        }`,
      }),
      infiniteQueryOptions: {
        initialPageParam: 0,
        getNextPageParam: (lastPage, _allPages, lastPageParam) =>
          Array.isArray(lastPage) && lastPage.length > 0
            ? lastPageParam + 1
            : undefined,
      },
    }),

    getRandomSection: builder.query({
      query: (params?: RandomSectionParams | string) => {
        // Handle legacy string parameter for backward compatibility
        if (typeof params === "string") {
          return { url: `/landing/random?not=${params}` };
        }

        const searchParams = new URLSearchParams();

        if (params?.not) {
          searchParams.append("not", params.not);
        }
        if (params?.type && params.type !== "both") {
          searchParams.append("type", params.type);
        }
        if (params?.providers?.length) {
          searchParams.append("providers", params.providers.join(","));
        }
        if (params?.genres?.length) {
          searchParams.append("genres", params.genres.join(","));
        }
        if (params?.decade && params.decade !== "all") {
          searchParams.append("decade", params.decade);
        }

        if (params?.notMovies) {
          searchParams.append("notMovies", params.notMovies);
        }

        const queryString = searchParams.toString();
        return {
          url: `/landing/random${queryString ? `?${queryString}` : ""}`,
        };
      },
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

    getSectionMovies: builder.query<
      { name: string; results: Movie[]; totalPagesCount: number },
      SectionParams
    >({
      query: ({ name, page = 1 }) => `/landing/${name}/${page}`,
    }),

    getSectionMoviesPages: builder.infiniteQuery<
      { name: string; results: Movie[]; totalPagesCount: number },
      { name: string },
      number
    >({
      query: ({ queryArg: { name }, pageParam }) =>
        `/landing/${name}/${pageParam}`,
      infiniteQueryOptions: {
        // Page 1 is already provided by the landing endpoint via group.results,
        // so this query activates lazily and starts from page 2.
        initialPageParam: 2,
        getNextPageParam: (lastPage, _allPages, lastPageParam) =>
          lastPage?.results?.length > 0 &&
          lastPageParam < lastPage.totalPagesCount
            ? lastPageParam + 1
            : undefined,
      },
    }),

    getFeatured: builder.query<
      Movie & { tagline: string; genres: string[] },
      { selectedChip: string }
    >({
      query: ({ selectedChip }) =>
        "/landing/featured?category=" + selectedChip || "all",
      providesTags: (result, error, arg) => [
        { type: "LandingPageInfinite", id: `featured-${arg.selectedChip}` },
      ],
    }),

    getSimilar: builder.query<
      { name: string; results: Movie[]; page: number; total_pages: number },
      { id: number; type: "movie" | "tv"; page: number }
    >({
      query: ({ id, type, page }) => `/similar/${type}/${id}?page=${page || 1}`,
    }),

    getReviews: builder.query<any[], { id: number; type: "movie" | "tv" }>({
      query: ({ id, type }) => `/reviews/${type}/${id}`,
    }),

    getCategories: builder.query<any[], any>({
      query: () => "/categories",
    }),

    getChipCategories: builder.query<
      { id: string; label: string; image?: string }[],
      void
    >({
      query: () => "/chip-categories",
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

    getTrailers: builder.query<any[], { type: string; id: number }>({
      query: ({ type, id }) => `/${type}/${id}/trailers`,
    }),

    getCategoriesWithThumbnails: builder.query<
      CategoryWithThumbnails[],
      { type: "movie" | "tv" }
    >({
      query: ({ type }) => `/movie/categories/${type}/thumbnails`,
    }),

    getGenresWithThumbnails: builder.query<
      GenreWithThumbnail[],
      { type: "movie" | "tv" }
    >({
      query: ({ type }) => `/movie/genres/${type}/thumbnails`,
    }),

    getSpecialCategoriesWithThumbnails: builder.query<
      SpecialCategoryWithThumbnail[],
      { type: "movie" | "tv" }
    >({
      query: ({ type }) => `/movie/special-categories/${type}/thumbnails`,
    }),

    validateRoomConfig: builder.mutation<ValidationResult, RoomConfig>({
      query: (config) => ({
        url: "/room/validate",
        method: "POST",
        body: config,
      }),
    }),

    prefetchRoomContent: builder.mutation<
      PrefetchResult,
      RoomConfig & { maxRounds?: number }
    >({
      query: (config) => ({
        url: "/room/prefetch",
        method: "POST",
        body: config,
      }),
    }),

    search: builder.query<
      SearchResults,
      SearchParams & { operation?: "replace" | "append" }
    >({
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

      providesTags: ["SearchResults"],

      transformResponse: (response: any) => {
        return {
          ...response,
          results: (response?.results || []).map((item: any) => ({
            ...item,
            key: item.id.toString(),
          })),
        };
      },
    }),

    getSummaryShare: builder.query<SummaryShareResponse, { roomId: string }>({
      query: ({ roomId }) => `/room/summary/${roomId}/share`,
    }),

    shareMovies: builder.mutation<
      SummaryShareResponse,
      { movies: { id: number; type: string }[] }
    >({
      query: ({ movies }) => ({
        url: "/share",
        method: "POST",
        body: { movies },
      }),
    }),

    getCombinedMovieDetails: builder.query<
      {
        movie: MovieDetails | null;
        similar: { name: string; results: Movie[]; page: number; total_pages: number } | null;
        trailers: any[] | null;
        keyPeople: { actors: Array<{ id: number; name: string; character: string; profile_path: string | null }>; directors: Array<{ id: number; name: string; job: string; department: string; profile_path: string | null }> } | null;
        providers: any[] | null;
      },
      { id: number; type: "movie" | "tv"; page?: number; actorLimit?: number; includeDirector?: boolean }
    >({
      query: ({ id, type, page = 1, actorLimit = 20, includeDirector = true }) =>
        `/${type}/${id}/combined?page=${page}&actorLimit=${actorLimit}&includeDirector=${includeDirector}`,
    }),
  }),
});

export const {
  useGetLandingPageSectionsInfiniteQuery,
  useGetMovieQuery,

  useGetRandomSectionQuery,

  useLazyGetRandomSectionQuery,
  useLazyGetMovieQuery,
  useGetMovieProvidersQuery,
  useGetGenresQuery,
  useGetMaxPageRangeQuery,

  useLazyGetSectionMoviesQuery,
  useGetSectionMoviesPagesInfiniteQuery,

  useGetFeaturedQuery,

  useGetSimilarQuery,

  useLazyGetSimilarQuery,

  useGetReviewsQuery,

  useGetCategoriesQuery,

  useGetChipCategoriesQuery,

  useGetAllProvidersQuery,

  useLazyGetGenresQuery,

  useSearchQuery,

  useLazySearchQuery,

  useGetSeasonEpisodesQuery,

  useGetTrailersQuery,

  useLazyGetAllProvidersQuery,

  useLazyGetCategoriesQuery,

  useLazyGetFeaturedQuery,

  useGetCategoriesWithThumbnailsQuery,
  useGetGenresWithThumbnailsQuery,
  useGetSpecialCategoriesWithThumbnailsQuery,
  useValidateRoomConfigMutation,
  usePrefetchRoomContentMutation,
  useGetSummaryShareQuery,
  useLazyGetSummaryShareQuery,
  useShareMoviesMutation,
  useGetCombinedMovieDetailsQuery,
} = movieApi;
