import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useGetLandingPageMoviesInfiniteQuery, movieApi } from "../redux/movie/movieApi";
import { useAppDispatch } from "../redux/store";
import { SectionData } from "../types";

const appendUnique = (currentItems: SectionData[], newItems: SectionData[]) => {
  const existingNames = new Set(currentItems.map((item) => item.name));
  const uniqueNewItems = newItems.filter((item) => {
    if (!item || !item.name || (item as any).type === "game") return false;
    if (!Array.isArray(item.results) || item.results.length === 0) return false;

    if (existingNames.has(item.name)) return false;

    existingNames.add(item.name);
    return true;
  });

  if (uniqueNewItems.length === 0) return currentItems;
  return [...currentItems, ...uniqueNewItems];
};

export const useInfiniteLandingPageMovies = ({ categoryId, pageSize = 4 }: { categoryId: string; pageSize?: number }) => {
  const dispatch = useAppDispatch();

  const [data, setData] = useState<SectionData[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadingRef = useRef(false);

  const {
    data: initialData,
    isLoading,
    isFetching,
    isError,
    refetch: refetchQuery,
  } = useGetLandingPageMoviesInfiniteQuery({
    categoryId,
    pageSize,
    page: 0,
  });

  useEffect(() => {
    setData([]);
    setCurrentPage(0);
    setHasMore(true);
    loadingRef.current = false;
  }, [categoryId]);

  useEffect(() => {
    if (initialData && currentPage === 0) {
      const processed = appendUnique([], initialData);
      setData(processed);
      setHasMore(initialData.length >= pageSize);
    }
  }, [initialData, currentPage, pageSize]);

  const fetchNextPage = useCallback(async () => {
    if (!hasMore || loadingRef.current || isFetching) return;

    loadingRef.current = true;
    const nextPage = currentPage + 1;

    try {
      const result = await dispatch(
        movieApi.endpoints.getLandingPageMoviesInfinite.initiate({
          categoryId,
          pageSize,
          page: nextPage,
        }),
      ).unwrap();

      if (result && result.length > 0) {
        setData((prev) => appendUnique(prev, result));
        setCurrentPage(nextPage);
        setHasMore(result.length >= pageSize);
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error("Fetch next page failed", error);
      setHasMore(false);
    } finally {
      loadingRef.current = false;
    }
  }, [hasMore, isFetching, currentPage, categoryId, pageSize, dispatch]);

  const refetch = useCallback(() => {
    setIsRefreshing(true);
    setCurrentPage(0);
    setHasMore(true);
    refetchQuery().finally(() => {
      setIsRefreshing(false);
    });
  }, [refetchQuery]);

  return {
    data,
    isLoading: isLoading && data.length === 0,
    isError,
    hasMore,
    fetchNextPage,
    refetch,
    isRefreshing,
  };
};
