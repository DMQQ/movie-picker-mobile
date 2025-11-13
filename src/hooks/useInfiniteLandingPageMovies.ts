import { useCallback, useEffect, useState, useRef } from 'react';
import { useLazyGetLandingPageMoviesPageQuery } from '../redux/movie/movieApi';
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
  const [page, setPage] = useState(0);
  const [data, setData] = useState<SectionData[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const [fetchPage, { isLoading, isFetching, isError, error }] = useLazyGetLandingPageMoviesPageQuery();
  
  const categoryRef = useRef(categoryId);
  const isInitialLoad = useRef(true);

  // Game sections to insert
  const gameSections = [
    { name: "Game Invite 1", results: [], type: "game" as const, gameType: "social" as const },
    { name: "Game Invite 2", results: [], type: "game" as const, gameType: "voter" as const },
    { name: "Game Invite 3", results: [], type: "game" as const, gameType: "fortune" as const },
    { name: "Game Invite 4", results: [], type: "game" as const, gameType: "all-games" as const },
  ];

  // Reset data when category changes
  useEffect(() => {
    if (categoryRef.current !== categoryId) {
      categoryRef.current = categoryId;
      setPage(0);
      setData([]);
      setHasMore(true);
      isInitialLoad.current = true;
    }
  }, [categoryId]);

  // Fetch initial data
  useEffect(() => {
    if (isInitialLoad.current && data.length === 0) {
      isInitialLoad.current = false;
      fetchPage({ page: 0, take: pageSize, category: categoryId })
        .unwrap()
        .then((response) => {
          if (response && Array.isArray(response) && response.length > 0) {
            setHasMore(response.length >= pageSize);
            const uniqueMovieSections = uniqueBy(
              response.filter((item) => item && item.name),
              "name"
            );
            setData(arrayInsertsAt(uniqueMovieSections, [3, 8, 14, 20], gameSections));
          } else {
            setHasMore(false);
          }
        })
        .catch(() => {
          setHasMore(false);
        });
    }
  }, [categoryId, fetchPage, pageSize, data.length]);

  const fetchNextPage = useCallback(() => {
    if (!hasMore || isLoading || isFetching) return;

    const nextPage = page + 1;
    
    fetchPage({ page: nextPage, take: pageSize, category: categoryId })
      .unwrap()
      .then((response) => {
        if (response && Array.isArray(response) && response.length > 0) {
          setHasMore(response.length >= pageSize);
          setPage(nextPage);
          
          setData((prev) => {
            const currentGameSections = prev.filter(
              (item) => item && typeof item === "object" && "type" in item && (item as any).type === "game"
            );
            const currentMovieSections = prev.filter(
              (item) => item && typeof item === "object" && !("type" in item && (item as any).type === "game")
            );
            
            const newMovieSections = uniqueBy(
              [...currentMovieSections, ...response.filter((item) => item && item.name)],
              "name"
            );
            
            return arrayInsertsAt(newMovieSections, [3, 8, 14, 20], currentGameSections);
          });
        } else {
          setHasMore(false);
        }
      })
      .catch(() => {
        setHasMore(false);
      });
  }, [hasMore, isLoading, isFetching, page, pageSize, categoryId, fetchPage]);

  const refetch = useCallback(() => {
    setIsRefreshing(true);
    setPage(0);
    setData([]);
    setHasMore(true);
    
    fetchPage({ page: 0, take: pageSize, category: categoryId })
      .unwrap()
      .then((response) => {
        if (response && Array.isArray(response)) {
          const uniqueMovieSections = uniqueBy(
            response.filter((item) => item && item.name),
            "name"
          );
          setData(arrayInsertsAt(uniqueMovieSections, [3, 8, 14, 20], gameSections));
          setHasMore(response.length >= pageSize);
        }
      })
      .finally(() => {
        setIsRefreshing(false);
      });
  }, [categoryId, fetchPage, pageSize]);

  return {
    data,
    isLoading: isLoading && page === 0,
    isFetching,
    isError,
    error,
    hasMore,
    fetchNextPage,
    refetch,
    isRefreshing,
  };
};