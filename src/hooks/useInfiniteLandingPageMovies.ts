import { useMemo, useCallback, useState, useRef, useEffect } from 'react';
import { useGetLandingPageMoviesInfiniteQuery } from '../redux/movie/movieApi';
import { useAppDispatch } from '../redux/store';
import { movieApi } from '../redux/movie/movieApi';
import { arrayInsertsAt } from '../utils/utilities';
import uniqueBy from '../utils/unique';
import { SectionData } from '../service/useLanding';

interface UseInfiniteLandingPageMoviesOptions {
  categoryId: string;
  pageSize?: number;
}

interface UseInfiniteLandingPageMoviesResult {
  data: SectionData[];
  isLoading: boolean;
  isFetching: boolean;
  isError: boolean;
  error: any;
  hasMore: boolean;
  fetchNextPage: () => void;
  refetch: () => void;
  isRefreshing: boolean;
}

export const useInfiniteLandingPageMovies = ({
  categoryId,
  pageSize = 8,
}: UseInfiniteLandingPageMoviesOptions): UseInfiniteLandingPageMoviesResult => {
  const dispatch = useAppDispatch();
  const [allPages, setAllPages] = useState<{ name: string; results: any[] }[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const categoryRef = useRef(categoryId);

  const { data: currentPageData, isLoading, isFetching, isError, error, refetch } = useGetLandingPageMoviesInfiniteQuery({
    categoryId,
    pageSize,
    page: 0,
  });

  const gameSections = useMemo(() => [
    { name: "Game Invite 1", results: [], type: "game" as const, gameType: "social" as const },
    { name: "Game Invite 2", results: [], type: "game" as const, gameType: "voter" as const },
    { name: "Game Invite 3", results: [], type: "game" as const, gameType: "fortune" as const },
    { name: "Game Invite 4", results: [], type: "game" as const, gameType: "all-games" as const },
  ], []);

  useEffect(() => {
    if (categoryRef.current !== categoryId) {
      categoryRef.current = categoryId;
      setAllPages([]);
      setCurrentPage(0);
      setHasMore(true);
    }
  }, [categoryId]);

  useEffect(() => {
    if (currentPageData && currentPage === 0) {
      setAllPages(currentPageData);
      setHasMore(currentPageData.length >= pageSize);
    }
  }, [currentPageData, currentPage, pageSize]);

  const data = useMemo((): SectionData[] => {
    if (!allPages.length) return [];
    
    const uniqueMovieSections = uniqueBy(
      allPages.filter((item: any) => item && item.name),
      "name"
    );
    return arrayInsertsAt(uniqueMovieSections, [3, 8, 14, 20], gameSections) as SectionData[];
  }, [allPages, gameSections]);

  const fetchNextPage = useCallback(() => {
    if (!hasMore || isLoading || isFetching) return;
    
    const nextPage = currentPage + 1;
    
    dispatch(movieApi.endpoints.getLandingPageMoviesInfinite.initiate({
      categoryId,
      pageSize,
      page: nextPage,
    })).unwrap().then((response: any) => {
      if (response && response.length > 0) {
        setAllPages(prev => {
          const uniqueNewSections = uniqueBy([...prev, ...response], "name");
          return uniqueNewSections;
        });
        setCurrentPage(nextPage);
        setHasMore(response.length >= pageSize);
      } else {
        setHasMore(false);
      }
    }).catch(() => {
      setHasMore(false);
    });
  }, [hasMore, isLoading, isFetching, currentPage, categoryId, pageSize, dispatch]);

  const handleRefetch = useCallback(() => {
    setIsRefreshing(true);
    setAllPages([]);
    setCurrentPage(0);
    setHasMore(true);
    refetch().finally(() => {
      setIsRefreshing(false);
    });
  }, [refetch]);

  return {
    data,
    isLoading: isLoading && currentPage === 0,
    isFetching,
    isError,
    error,
    hasMore,
    fetchNextPage,
    refetch: handleRefetch,
    isRefreshing,
  };
};