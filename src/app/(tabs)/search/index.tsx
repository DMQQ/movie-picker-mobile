import { Link, router, Stack, useLocalSearchParams } from "expo-router";
import SearchField from "../../../components/SearchField";
import Text from "../../../components/Text";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Dimensions,
  ImageBackground,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,

  View, ActivityIndicator} from "react-native";

import { colors, fontSize, fontWeight, radius, spacing, typography } from "../../../constants/design";
import {
  useLazySearchQuery,
  useLazyGetSimilarQuery,
} from "../../../redux/movie/movieApi";
import { useAppSelector } from "../../../redux/store";
import { FlashList } from "@shopify/flash-list";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Movie } from "../../../../types";
import { LinearGradient } from "expo-linear-gradient";
import Thumbnail, {
  prefetchThumbnail,
  ThumbnailSizes,
} from "../../../components/Thumbnail";
import useTranslation from "../../../service/useTranslation";
import { isLiquidGlassSupported } from "@callstack/liquid-glass";
import { TourAttachStep } from "../../../components/Tour/TourAttachStep";
import { TourProvider } from "../../../components/Tour/TourProvider";
import { type TourRef, type TourStep } from "../../../components/Tour/TourContext";
import TutorialTooltip from "../../../components/TutorialTooltip";
import { useTutorialSeen } from "../../../hooks/useTutorial";
import Touch from "../../../components/Touch";
import SearchSkeleton from "../../../components/Search/SearchSkeleton";
import ActiveFilters from "../../../components/Search/ActiveFilters";
import RatingIcons from "../../../components/RatingIcons";
import Chip from "../../../components/Chip";
import { posthog } from "../../../constants/posthog";

const SCREEN_WIDTH = Dimensions.get("window").width;

const GENRE_MAP: Record<number, string> = {
  28: "Action", 12: "Adventure", 16: "Animation", 35: "Comedy", 80: "Crime",
  99: "Documentary", 18: "Drama", 10751: "Family", 14: "Fantasy", 36: "History",
  27: "Horror", 10402: "Music", 9648: "Mystery", 10749: "Romance", 878: "Sci-Fi",
  53: "Thriller", 10752: "War", 37: "Western", 10759: "Action & Adventure",
  10762: "Kids", 10765: "Sci-Fi & Fantasy", 10768: "War & Politics",
};

function formatRuntime(minutes: number) {
  if (!minutes) return null;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h > 0 ? `${h}h ${m > 0 ? `${m}m` : ""}`.trim() : `${m}m`;
}

const MovieCard = ({ item }: { item: Movie & { release_date?: string } }) => {
  const year = (item.release_date || item.first_air_date)?.slice(0, 4);
  const lang = item.original_language?.toUpperCase();
  const runtime = item.runtime ? formatRuntime(item.runtime) : null;
  const genres = (item.genre_ids ?? []).slice(0, 2).map((id) => GENRE_MAP[id]).filter(Boolean);

  return (
    <Link
      href={{
        pathname: "/movie/type/[type]/[id]",
        params: {
          id: item.id.toString(),
          type: item?.title ? "movie" : "tv",
          img: item.poster_path,
        },
      }}
      style={styles.cardLink}
      asChild
    >
      <Touch>
        <ImageBackground
          source={{
            uri: `https://image.tmdb.org/t/p/w780${item.backdrop_path}`,
          }}
          blurRadius={10}
          style={styles.card}
          imageStyle={styles.cardImage}
        >
          <View style={styles.posterWrap}>
            <Link.AppleZoom>
              <Thumbnail
                path={item.poster_path}
                container={[styles.poster]}
                size={ThumbnailSizes.poster.xlarge}
              />
            </Link.AppleZoom>
          </View>

          <LinearGradient
            colors={["transparent", "rgba(0,0,0,0.75)", "rgba(0,0,0,0.95)"]}
            style={styles.infoPanel}
          >
            <Text numberOfLines={2} style={styles.title}>
              {item?.title || item?.name}
            </Text>

            <View style={styles.ratingRow}>
              {!!item?.vote_average && (
                <RatingIcons vote={item.vote_average} size={20} />
              )}
            </View>

            {(genres.length > 0 || year || lang || runtime) && (
              <View style={styles.metaRow}>
                {genres.map((g) => (
                  <View key={g} style={styles.genreChip}>
                    <Text style={styles.genreText}>{g}</Text>
                  </View>
                ))}
                {!!year && <Text style={styles.metaText}>{year}</Text>}
                {!!lang && <Text style={styles.metaText}>{lang}</Text>}
                {!!runtime && <Text style={styles.metaText}>{runtime}</Text>}
              </View>
            )}

            <View style={styles.overviewWrap}>
              <Text numberOfLines={4} ellipsizeMode="tail" style={styles.overview}>
                {item.overview}
              </Text>
            </View>
          </LinearGradient>
        </ImageBackground>
      </Touch>
    </Link>
  );
};

const SearchScreen = () => {
  const searchParams = useLocalSearchParams();
  const [searchQuery, setSearchQuery] = useState("");

  const [allResults, setAllResults] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [searchPhase, setSearchPhase] = useState<"idle" | "pending" | "done">(
    "idle",
  );

  const searchTimeout = React.useRef<NodeJS.Timeout>(null);
  const lastReceivedApiPage = useRef(0);
  const isLoadingNextPage = useRef(false);
  const routeParamsRef = useRef(searchParams);

  const [search, { isLoading, isFetching }] = useLazySearchQuery();
  const [
    getSimilar,
    { isLoading: isLoadingSimilar, isFetching: isFetchingSimilar },
  ] = useLazyGetSimilarQuery();
  const t = useTranslation();
  const mediaFilters = useAppSelector((s) => s.mediaFilters);

  const activeFilterCount =
    (mediaFilters.mediaType !== "both" ? 1 : 0) +
    (mediaFilters.selectedDecade !== "all" ? 1 : 0) +
    mediaFilters.selectedGenres.length +
    mediaFilters.selectedProviders.length;

  const tourRef = useRef<TourRef>(null);
  const { seen, markSeen } = useTutorialSeen("tutorial_search_seen");

  const steps = useMemo<TourStep[]>(
    () => [
      {
        render: (props) => (
          <TutorialTooltip
            {...props}
            title={t("tutorial.search.chips.title") as string}
            description={t("tutorial.search.chips.description") as string}
          />
        ),
        spotRadius: 16,
        placement: "bottom",
      },
      {
        render: (props) => (
          <TutorialTooltip
            {...props}
            title={t("tutorial.search.filters.title") as string}
            description={t("tutorial.search.filters.description") as string}
          />
        ),
        spotRadius: 16,
        placement: "bottom",
      },
      {
        render: (props) => (
          <TutorialTooltip
            {...props}
            title={t("tutorial.search.results.title") as string}
            description={t("tutorial.search.results.description") as string}
          />
        ),
        spotRadius: 16,
        placement: "bottom",
      },
    ],
    [t],
  );

  useEffect(() => {
    if (seen === false) {
      const timer = setTimeout(() => tourRef.current?.start(), 300);
      return () => clearTimeout(timer);
    }
  }, [seen]);

  useEffect(() => {
    if (searchParams?.initialQuery && !searchQuery) {
      setSearchQuery(searchParams.initialQuery as string);
    }
  }, [searchParams?.initialQuery]);

  useEffect(() => {
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }

    setCurrentPage(1);
    setAllResults([]);
    setHasNextPage(false);
    setSearchPhase("pending");
    lastReceivedApiPage.current = 0;
    isLoadingNextPage.current = false;

    searchTimeout.current = setTimeout(() => {
      performSearch(1);
    }, 500);

    return () => {
      if (searchTimeout.current) {
        clearTimeout(searchTimeout.current);
      }
    };
  }, [searchQuery]);

  const prevFiltersRef = useRef("");
  useEffect(() => {
    const key = `${mediaFilters.mediaType}|${mediaFilters.selectedDecade}|${mediaFilters.selectedGenres.map(g => g.id).join(",")}|${mediaFilters.selectedProviders.join(",")}`;
    if (key !== prevFiltersRef.current) {
      prevFiltersRef.current = key;
      setCurrentPage(1);
      setAllResults([]);
      setHasNextPage(false);
      setSearchPhase("pending");
      lastReceivedApiPage.current = 0;
      isLoadingNextPage.current = false;
      performSearch(1);
    }
  }, [mediaFilters, searchParams?.people]);

  useEffect(() => {
    const currentParams = searchParams || {};
    const prevParams = routeParamsRef.current || {};
    const hasParamsChanged =
      JSON.stringify(currentParams.people) !==
        JSON.stringify(prevParams.people);

    if (hasParamsChanged) {
      routeParamsRef.current = searchParams;
      setCurrentPage(1);
      setAllResults([]);
      setHasNextPage(false);
      setSearchPhase("pending");
      lastReceivedApiPage.current = 0;
      isLoadingNextPage.current = false;
      performSearch(1);
    }
  }, [searchParams, mediaFilters.mediaType]);

  useEffect(() => {
    if (lastReceivedApiPage.current > 0) {
      setCurrentPage(1);
      setAllResults([]);
      setHasNextPage(false);
      setSearchPhase("pending");
      lastReceivedApiPage.current = 0;
      isLoadingNextPage.current = false;

      performSearch(1);
    }
  }, [mediaFilters.mediaType]);

  // Main search function
  const performSearch = async (page: number) => {
    if (searchQuery.trim().length === 0 && !searchParams) {
      setAllResults([]);
      setHasNextPage(false);
      setSearchPhase("idle");
      return;
    }

    try {
      // Handle similar movies mode
      if (
        searchParams?.mode === "similar" &&
        searchParams?.movieId &&
        searchParams?.type
      ) {
        const response = await getSimilar({
          id: searchParams.movieId,
          type: searchParams.type,
          page: page,
        }).unwrap();

        if (response.results && page === 1) {
          setAllResults(response.results);
          setHasNextPage(false); // Similar movies usually don't have pagination
          setSearchPhase("done");
        }
        return;
      }

      const params = {
        page: page,
        type: mediaFilters.mediaType,
        with_genres: mediaFilters.selectedGenres.length > 0
          ? mediaFilters.selectedGenres.map((g) => g.id)
          : undefined,
        with_watch_providers: mediaFilters.selectedProviders.length > 0
          ? mediaFilters.selectedProviders
          : undefined,
        decade: mediaFilters.selectedDecade !== "all" ? mediaFilters.selectedDecade : undefined,
        with_people: searchParams?.people,
      } as any;

      if (searchQuery.trim().length > 0) {
        params["query"] = searchQuery;
      } else {
        params["discover"] = true;
      }

      const response = await search(params).unwrap();

      if (response.page === page) {
        lastReceivedApiPage.current = page;

        if (page === 1) {
          posthog?.capture("search_performed", {
            has_query: searchQuery.trim().length > 0,
            result_count: response.results.length,
          });
        }

        Promise.any(
          response.results.map((item) =>
            prefetchThumbnail(item, ThumbnailSizes.poster.xxlarge),
          ),
        );

        if (page === 1) {
          setAllResults(response.results);
          setSearchPhase("done");
        } else {
          setAllResults((prevResults) => {
            const existingIds = new Set(prevResults.map((item) => item.id));
            const newResults = response.results.filter(
              (item) => !existingIds.has(item.id),
            );
            return [...prevResults, ...newResults];
          });
        }

        setHasNextPage(response.page < response.total_pages);
      }

      isLoadingNextPage.current = false;
    } catch (error) {
      if (page === 1) {
        setSearchPhase("done");
      }
      isLoadingNextPage.current = false;
    }
  };

  // Load next page
  const handleEndReached = useCallback(() => {
    if (
      !(isFetching || isFetchingSimilar) &&
      hasNextPage &&
      !isLoadingNextPage.current
    ) {
      const nextPage = currentPage + 1;

      isLoadingNextPage.current = true;
      setCurrentPage(nextPage);

      setTimeout(() => {
        performSearch(nextPage);
      }, 100);
    }
  }, [isFetching, isFetchingSimilar, hasNextPage, currentPage]);

  const renderEmptyComponent = useCallback(() => {
    if (
      (isLoading || isLoadingSimilar || searchPhase === "pending") &&
      currentPage === 1
    )
      return <SearchSkeleton />;

    if (searchPhase === "idle") {
      return (
        <Text style={styles.emptyText} variant="bodyLarge">
          {t("search.begin")}
        </Text>
      );
    }

    return (
      <Text style={styles.emptyText} variant="bodyLarge">
        {t("search.no-results")} {searchQuery ? `"${searchQuery}"` : ""}
      </Text>
    );
  }, [isLoading, isLoadingSimilar, searchQuery, currentPage, searchPhase]);

  const insets = useSafeAreaInsets();

  const memoStack = useMemo(
    () => (
      <Stack.Screen
        options={Platform.select({
          ios: {
            headerTitle: t("tabBar.search") as string,
            headerStyle: {
              backgroundColor: colors.appBackground,
            },
            headerTitleStyle: {
              color: colors.text,
            },
            headerSearchBarOptions: {
              placeholder: t("search.search-placeholder") as string,
              onChangeText: (event) => {
                setSearchQuery(event.nativeEvent.text);
              },
            },
          },
          default: {
            headerShown: false,
          },
        })}
      />
    ),
    [t],
  );

  return (
    <TourProvider ref={tourRef} steps={steps} onStop={markSeen}>
      <View style={[styles.container, { paddingTop: insets.top }]}>
        {memoStack}

        {Platform.OS !== "ios" && (
          <View style={styles.searchContainer}>
            <SearchField
              placeholder={t("search.search-placeholder") as string}
              onChangeText={setSearchQuery}
              value={searchQuery}
              style={styles.searchbar}
              inputStyle={styles.searchInput}
            />
          </View>
        )}

        <View
          style={[
            styles.chipContainer,
            {
              marginTop:
                Platform.OS === "ios"
                  ? insets.top + (isLiquidGlassSupported ? 0 : 30)
                  : 0,
            },
          ]}
        >
          <TourAttachStep index={0} fill style={{ flex: 1 }}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoriesContainer}
            >
              <ActiveFilters />
            </ScrollView>
          </TourAttachStep>
          <TourAttachStep index={1}>
            <Chip
              icon="tune-variant"
              onPress={() =>
                router.push({
                  pathname: "/filters",
                  params: { presentation: "formSheet" },
                })
              }
            >
              {t("filters.title") as string}
              {activeFilterCount > 0 ? ` ${activeFilterCount}` : ""}
            </Chip>
          </TourAttachStep>
        </View>

        <TourAttachStep index={2} fill style={{ flex: 1 }}>
        <FlashList
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: spacing.lg }}
        data={allResults}
        renderItem={({ item }) => <MovieCard item={item} />}
        keyExtractor={(item) => {
          const mediaType = item.media_type || mediaFilters.mediaType;
          const uniqueId = `${item.id}-${mediaType}`;
          return uniqueId;
        }}
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.5}
        ListFooterComponent={() =>
          (isFetching || isFetchingSimilar) && currentPage > 1 ? (
            <ActivityIndicator
              style={styles.loader}
              animating={true}
              color={colors.primary}
            />
          ) : null
        }
        ListEmptyComponent={renderEmptyComponent}
      />
        </TourAttachStep>
      </View>
    </TourProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.appBackground,
  },
  searchContainer: {
    paddingHorizontal: spacing.screen,
    marginBottom: spacing.screen,
    paddingTop: spacing.screen,
  },
  searchbar: {
    backgroundColor: colors.overlay,
    borderRadius: radius.pill,
    borderWidth: 2,
    borderColor: colors.border,
  },
  searchInput: {
    color: colors.text,
  },
  chipContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingRight: spacing.sm,
    paddingBottom: spacing.sm,
  },
  listContent: {
    paddingHorizontal: spacing.screen,
    paddingBottom: spacing.xl,
    minHeight: 100,
  },
  cardLink: {
    width: SCREEN_WIDTH - spacing.lg * 2,
    borderRadius: radius.card,
    marginTop: spacing.lg,
    overflow: "hidden",
    backgroundColor: colors.surface,
  },
  card: {
    flex: 1,
    overflow: "hidden",
  },
  cardImage: {
    flex: 1,
    borderRadius: radius.card,
  },
  posterWrap: {
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.lg,
  },
  poster: {
    borderRadius: radius.sm + 2,
    height: 230,
    width: 170,
    borderColor: colors.border,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  infoPanel: {
    padding: spacing.lg,
    gap: spacing.xs - 2.5,
  },
  title: {
    fontFamily: "Bebas",
    fontSize: 40,
    letterSpacing: typography.bebasLetterSpacing,
  },
  ratingRow: {
    flexDirection: "row",
  },
  metaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
    marginTop: spacing.xs - 2,
    alignItems: "center",
  },
  metaText: {
    fontSize: fontSize.sm,
    color: colors.placeholder,
    fontWeight: fontWeight.medium,
  },
  genreChip: {
    backgroundColor: "rgba(255,255,255,0.12)",
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  genreText: {
    fontSize: fontSize.xs,
    color: colors.text,
    fontWeight: fontWeight.medium,
  },
  overviewWrap: {
    flex: 1,
    overflow: "hidden",
  },
  overview: {
    marginTop: spacing.xs + 1,
    fontSize: fontSize.md,
  },
  loader: {
    marginVertical: spacing.xl,
  },
  emptyText: {
    textAlign: "center",
    marginTop: spacing.xxl + 16,
    opacity: 0.7,
  },
  errorText: {
    textAlign: "center",
    marginTop: spacing.xxl + 16,
    color: "#ff6b6b",
    fontSize: fontSize.lg,
  },
  modal: {
    backgroundColor: "#1e1e1e",
    margin: spacing.xl,
    padding: spacing.xl,
    borderRadius: radius.sm + 2,
  },
  modalTitle: {
    marginBottom: spacing.sm + 2,
  },
  divider: {
    marginVertical: spacing.sm + 2,
  },
  applyButton: {
    marginTop: spacing.xl,
  },
  categoriesContainer: {
    paddingHorizontal: spacing.screen,
    gap: spacing.xs,
  },
});

export default SearchScreen;
