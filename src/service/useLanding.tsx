import { useCallback, useEffect, useRef, useState } from "react";
import { Dimensions } from "react-native";
import { useAnimatedScrollHandler, useSharedValue } from "react-native-reanimated";
import { Movie } from "../../types";
import { useLazyGetLandingPageMoviesQuery } from "../redux/movie/movieApi";
import { arrayInsertsAt } from "../utils/utilities";

const { height } = Dimensions.get("screen");

export type SectionData =
  | { name: string; results: Movie[] }
  | { name: string; results: Movie[]; type: "game"; gameType: "quick" | "social" | "voter" | "fortune" | "all-games" };

export default function useLanding() {
  const [page, setPage] = useState(1);
  const [selectedChip, setSelectedChip] = useState("all");
  const previousChip = useRef(selectedChip);

  const [data, setData] = useState<SectionData[]>([]);

  const [getLandingMovies, { error }] = useLazyGetLandingPageMoviesQuery();
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    if (previousChip.current !== selectedChip) {
      setPage(0);
      setData([]);
      previousChip.current = selectedChip;
    }
  }, [selectedChip]);

  useEffect(() => {
    getLandingMovies({ skip: page * 8, take: 8, category: selectedChip }, true).then((response) => {
      if (response.data && Array.isArray(response.data) && response.data.length > 0) {
        setHasMore(response.data.length >= 8);
        setData((prev) => {
          const uniqueSections = (response.data || []).filter(
            (newSection) => !prev.some((existingSection) => existingSection.name === newSection.name)
          );

          return arrayInsertsAt(
            [...prev.filter((item) => !("type" in item && (item as any).type === "game")), ...uniqueSections],
            [3, 8, 14, 20],
            [
              {
                name: "Game Invite 1",
                results: [],
                type: "game" as const,
                gameType: "social" as const,
              },
              {
                name: "Game Invite 2",
                results: [],
                type: "game" as const,
                gameType: "voter" as const,
              },
              {
                name: "Game Invite 3",
                results: [],
                type: "game" as const,
                gameType: "fortune" as const,
              },
              {
                name: "Game Invite 4",
                results: [],
                type: "game" as const,
                gameType: "all-games" as const,
              },
            ]
          );
        });
      } else if (hasMore) {
        setPage((prev) => {
          return prev + 1;
        });
        setHasMore(false);
      }
    });
  }, [page, hasMore, selectedChip]);

  const onEndReached = useCallback(() => {
    if (error || !hasMore) return;

    setPage((prev) => {
      return prev + 1;
    });
  }, [error, hasMore]);

  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setPage(0);
    setData([]);
    getLandingMovies({ skip: 0, take: 5, category: selectedChip }).then((response) => {
      if (response.data && Array.isArray(response.data)) {
        setData(
          arrayInsertsAt(
            response.data,
            [3, 8, 14, 20],
            [
              {
                name: "Game Invite 1",
                results: [],
                type: "game" as const,
                gameType: "social" as const,
              },
              {
                name: "Game Invite 2",
                results: [],
                type: "game" as const,
                gameType: "voter" as const,
              },
              {
                name: "Game Invite 3",
                results: [],
                type: "game" as const,
                gameType: "fortune" as const,
              },
              {
                name: "Game Invite 4",
                results: [],
                type: "game" as const,
                gameType: "all-games" as const,
              },
            ]
          )
        );
      }
      setRefreshing(false);
    });
  }, [selectedChip]);

  const handleChipPress = (chip: string) => {
    setSelectedChip(chip);
  };

  const scrollY = useSharedValue(0);
  const onScroll = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  const getItemLayout = useCallback((data: SectionData[], index: number) => {
    const item = data?.[index];
    const isGame = item && "type" in item && item.type === "game";
    const itemHeight = isGame ? 210 : height * 0.275 + 30;

    let offset = 0;
    for (let i = 0; i < index; i++) {
      const prevItem = data?.[i];
      const prevIsGame = prevItem && "type" in prevItem && prevItem.type === "game";
      offset += prevIsGame ? 210 : height * 0.275 + 30;
    }

    return { length: itemHeight, offset, index };
  }, []);

  return {
    data,
    selectedChip,
    setSelectedChip,
    onEndReached,
    onRefresh,
    refreshing,
    handleChipPress,
    scrollY,
    onScroll,
    getItemLayout,
    hasMore,
    error,
  };
}
