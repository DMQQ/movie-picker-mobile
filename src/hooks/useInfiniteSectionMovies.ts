import { useCallback, useMemo, useState } from "react";
import { skipToken } from "@reduxjs/toolkit/query/react";
import { useGetSectionMoviesPagesInfiniteQuery } from "../redux/movie/movieApi";
import { Movie } from "../../types";

export const useInfiniteSectionMovies = (name: string, initialMovies: Movie[]) => {
  // Keep the query dormant until the user first reaches the end of the
  // pre-fetched data. On activation it starts at page 2 (page 1 is already
  // in initialMovies from the landing response).
  const [active, setActive] = useState(false);

  const { data, isFetching, hasNextPage, fetchNextPage } =
    useGetSectionMoviesPagesInfiniteQuery(active ? { name } : skipToken);

  const movies: Movie[] = useMemo(() => {
    if (!data?.pages) return initialMovies;
    const seen = new Set<number>(initialMovies.map((m) => m.id));
    const extra = data.pages
      .flatMap((page) => page.results)
      .filter((m) => !seen.has(m.id));
    return [...initialMovies, ...extra];
  }, [data, initialMovies]);

  const fetchNextPageIfReady = useCallback(() => {
    if (isFetching) return;
    if (!active) {
      setActive(true); // fires the query for the first time (page 2)
    } else if (hasNextPage) {
      fetchNextPage();
    }
  }, [isFetching, active, hasNextPage, fetchNextPage]);

  return {
    movies,
    isFetching,
    fetchNextPage: fetchNextPageIfReady,
  };
};
