import { useCallback, useMemo, useState } from "react";
import { useGetLandingPageSectionsInfiniteQuery } from "../redux/movie/movieApi";
import { SectionData } from "../types";

export const useInfiniteLandingPageMovies = ({
  categoryId,
  pageSize = 4,
}: {
  categoryId: string;
  pageSize?: number;
}) => {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const {
    data,
    isLoading,
    isFetching,
    isError,
    hasNextPage,
    fetchNextPage,
    refetch: rtkRefetch,
  } = useGetLandingPageSectionsInfiniteQuery({ categoryId, pageSize });

  const sections: SectionData[] = useMemo(() => {
    if (!data?.pages) return [];
    const seen = new Set<string>();
    return data.pages.flat().filter((item) => {
      if (!item?.name || seen.has(item.name)) return false;
      seen.add(item.name);
      return true;
    });
  }, [data]);

  const refetch = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await rtkRefetch();
    } finally {
      setIsRefreshing(false);
    }
  }, [rtkRefetch]);

  const fetchNextPageIfReady = useCallback(() => {
    if (!isFetching) fetchNextPage();
  }, [fetchNextPage, isFetching]);

  return {
    data: sections,
    isLoading: isLoading && sections.length === 0,
    isError,
    hasMore: hasNextPage ?? true,
    fetchNextPage: fetchNextPageIfReady,
    refetch,
    isRefreshing,
  };
};
