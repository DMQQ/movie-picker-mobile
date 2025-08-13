import { useNavigation } from "@react-navigation/native";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Dimensions, ImageBackground, Pressable, ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import { ActivityIndicator, IconButton, MD2DarkTheme, Searchbar, Text } from "react-native-paper";
import { useLazySearchQuery } from "../redux/movie/movieApi";

import { FlashList } from "@shopify/flash-list";
import { BlurView } from "expo-blur";
import Animated, { FadeIn, FadeInUp } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Movie } from "../../types";
import FrostedGlass from "../components/FrostedGlass";
import Thumbnail, { prefetchThumbnail, ThumbnailSizes } from "../components/Thumbnail";
import TransparentModalScreen from "../components/TransparentModalBackGesture";
import useTranslation from "../service/useTranslation";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const SCREEN_WIDTH = Dimensions.get("window").width;

const MovieCard = ({ item, index }: { item: Movie & { release_date?: string }; index: number }) => {
  const t = useTranslation();
  const data = [
    !!!item?.title ? t("voter.types.series") : t("voter.types.movie"),
    `${item?.vote_average?.toFixed(2)}/10`,
    item?.adult ? "18+" : "All ages",
    item?.release_date || item?.first_air_date,
    (item?.title || item?.name) === (item?.original_title || item?.original_name) ? "" : item?.original_title || item?.original_name,
    ...(item?.genres || [])?.map((g: any) => g.name),
  ].filter((v) => v !== undefined && v !== "") as any;

  const navigation = useNavigation<any>();

  return (
    <AnimatedPressable
      entering={FadeIn.delay(index * 50)}
      onPress={() => {
        navigation.navigate("MovieDetails", {
          id: item.id,
          type: item?.title ? "movie" : "tv",
          img: item.poster_path,
        });
      }}
      style={{
        width: SCREEN_WIDTH - 30,
        borderRadius: 15,
        marginTop: 15,
        borderWidth: 2,
        borderColor: "rgba(255,255,255,0.1)",
      }}
    >
      <ImageBackground
        source={{ uri: `https://image.tmdb.org/t/p/w780${item.backdrop_path}` }}
        blurRadius={10}
        style={{ flex: 1 }}
        imageStyle={{ flex: 1, borderRadius: 15 }}
      >
        <View style={{ position: "relative", justifyContent: "center", alignItems: "center", padding: 15 }}>
          <Thumbnail path={item.poster_path} container={[styles.cardImage]} size={ThumbnailSizes.poster.xlarge} />
        </View>

        <FrostedGlass style={{ flex: 1, padding: 15, overflow: "hidden", gap: 2.5 }}>
          <Text
            numberOfLines={2}
            style={{
              fontFamily: "Bebas",
              fontSize: 40,
            }}
          >
            {item?.title || item?.name}
          </Text>

          <Text style={{ color: "rgba(255, 255, 255, 0.8)" }}>{data.join(" | ")}</Text>

          <View style={{ flex: 1, overflow: "hidden" }}>
            <Text numberOfLines={4} ellipsizeMode="tail" style={{ marginTop: 5 }}>
              {item.overview}
            </Text>
          </View>
        </FrostedGlass>
      </ImageBackground>
    </AnimatedPressable>
  );
};

const SearchScreen = ({ navigation, route }: any) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({
    type: "both" as "movie" | "tv" | "both",
    genres: [] as number[],
    minRating: undefined as number | undefined,
  });

  const [allResults, setAllResults] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);

  const searchTimeout = React.useRef<NodeJS.Timeout>();
  const lastReceivedApiPage = useRef(0);
  const isLoadingNextPage = useRef(false);
  const routeParamsRef = useRef(route.params);

  const [search, { data, isLoading, isFetching, isError }] = useLazySearchQuery();
  const t = useTranslation();

  useEffect(() => {
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }

    setCurrentPage(1);
    setAllResults([]);
    setHasNextPage(false);
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

  useEffect(() => {
    // More robust comparison by checking individual properties
    const currentParams = route.params || {};
    const prevParams = routeParamsRef.current || {};

    const hasParamsChanged =
      JSON.stringify(currentParams.genres) !== JSON.stringify(prevParams.genres) ||
      JSON.stringify(currentParams.providers) !== JSON.stringify(prevParams.providers) ||
      JSON.stringify(currentParams.people) !== JSON.stringify(prevParams.people);

    if (hasParamsChanged) {
      routeParamsRef.current = route.params;

      // Reset search state
      setCurrentPage(1);
      setAllResults([]);
      setHasNextPage(false);
      lastReceivedApiPage.current = 0;
      isLoadingNextPage.current = false;

      // Force immediate search
      performSearch(1);
    }
  }, [route.params, filters.type]);

  useEffect(() => {
    if (lastReceivedApiPage.current > 0) {
      setCurrentPage(1);
      setAllResults([]);
      setHasNextPage(false);
      lastReceivedApiPage.current = 0;
      isLoadingNextPage.current = false;

      performSearch(1);
    }
  }, [filters.type]);

  // Main search function
  const performSearch = async (page: number) => {
    if (searchQuery.trim().length === 0 && !route?.params) {
      setAllResults([]);
      setHasNextPage(false);
      return;
    }

    try {
      const params = {
        page: page,
        type: filters.type,
        with_genres: route?.params?.genres,
        with_watch_providers: route?.params?.providers,
        with_people: route?.params?.people,
      } as any;

      if (searchQuery.trim().length > 0) {
        params["query"] = searchQuery;
      } else {
        params["discover"] = true;
      }

      const response = await search(params).unwrap();

      const sortSearchResults = (searchTerm: string, results: Movie[]) => {
        const term = searchTerm.toLowerCase();

        return [...results]
          .filter((m) => m.overview.length > 0 && m.vote_average > 0)
          .sort((a, b) => {
            const titleA = (a?.title || a?.name || "").toLowerCase();
            const titleB = (b?.title || b?.name || "").toLowerCase();

            // 1. Exact title matches come first
            const exactMatchA = titleA === term;
            const exactMatchB = titleB === term;
            if (exactMatchA && !exactMatchB) return -1;
            if (!exactMatchA && exactMatchB) return 1;

            // 2. Title starts with search term
            const startsWithA = titleA.startsWith(term);
            const startsWithB = titleB.startsWith(term);
            if (startsWithA && !startsWithB) return -1;
            if (!startsWithA && startsWithB) return 1;

            // 3. Consider franchise films (title contains search term as whole word)
            const wordBoundaryRegex = new RegExp(`\\b${term}\\b`, "i");
            const containsWordA = wordBoundaryRegex.test(titleA);
            const containsWordB = wordBoundaryRegex.test(titleB);
            if (containsWordA && !containsWordB) return -1;
            if (!containsWordA && containsWordB) return 1;

            // 4. For similar relevance, use popularity as tiebreaker
            return (b?.popularity || 0) - (a?.popularity || 0);
          });
      };

      if (response.page === page) {
        lastReceivedApiPage.current = page;

        Promise.any(response.results.map((item) => prefetchThumbnail(item, ThumbnailSizes.poster.xxlarge)));

        if (page === 1) {
          setAllResults(sortSearchResults(searchQuery, response.results));
        } else {
          setAllResults((prevResults) => {
            const existingIds = new Set(prevResults.map((item) => item.id));
            const newResults = response.results.filter((item) => !existingIds.has(item.id));
            return [...prevResults, ...sortSearchResults(searchQuery, newResults)];
          });
        }

        setHasNextPage(response.page < response.total_pages);
      }

      isLoadingNextPage.current = false;
    } catch (error) {
      isLoadingNextPage.current = false;
    }
  };

  // Load next page
  const handleEndReached = useCallback(() => {
    if (!isFetching && hasNextPage && !isLoadingNextPage.current) {
      const nextPage = currentPage + 1;

      isLoadingNextPage.current = true;
      setCurrentPage(nextPage);

      setTimeout(() => {
        performSearch(nextPage);
      }, 100);
    }
  }, [isFetching, hasNextPage, currentPage]);

  const handleFilterChange = useCallback((type: "movie" | "tv" | "both") => {
    setFilters((f) => ({ ...f, type }));
  }, []);

  const renderEmptyComponent = useCallback(() => {
    if (isLoading && currentPage === 1)
      return <ActivityIndicator style={[styles.loader, { marginTop: 50 }]} animating={true} color={MD2DarkTheme.colors.primary} />;

    if (searchQuery.trim().length === 0 && !route?.params) {
      return (
        <Text style={styles.emptyText} variant="bodyLarge">
          {t("search.begin")}
        </Text>
      );
    }

    if (!isLoading && (searchQuery.trim().length > 0 || route?.params)) {
      return (
        <Text style={styles.emptyText} variant="bodyLarge">
          {t("search.no-results")} {searchQuery ? `"${searchQuery}"` : ""}
        </Text>
      );
    }

    return null;
  }, [isLoading, searchQuery, currentPage, route?.params]);

  const categories = [
    { id: "both", label: t("voter.types.mixed") },
    { id: "movie", label: t("voter.types.movie") },
    { id: "tv", label: t("voter.types.series") },
  ] as { id: "movie" | "tv" | "both"; label: string }[];

  const insets = useSafeAreaInsets();

  return (
    <TransparentModalScreen>
      <BlurView style={{ flex: 1, paddingTop: insets.top }} intensity={50} tint="dark">
        <View style={styles.container}>
          <View style={styles.searchContainer}>
            <Searchbar
              placeholder={t("search.search-placeholder")}
              onChangeText={setSearchQuery}
              value={searchQuery}
              style={styles.searchbar}
              inputStyle={styles.searchInput}
              icon={() => (
                <IconButton icon="chevron-left" onPress={() => navigation.goBack()} size={24} iconColor="#fff" style={{ margin: 0 }} />
              )}
            />
          </View>

          <View style={styles.chipContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesContainer}>
              {categories.map((category, index) => (
                <Animated.View key={category.id} entering={FadeInUp.delay(50 * (index + 1))}>
                  <TouchableOpacity
                    onPress={() => handleFilterChange(category.id)}
                    style={[
                      styles.chipWrapper,
                      filters.type === category.id && {
                        borderColor: "rgba(255, 255, 255, 0.3)",
                        backgroundColor: "rgba(255, 255, 255, 0.1)",
                      },
                    ]}
                  >
                    <BlurView style={[styles.chip]} intensity={filters.type === category.id ? 15 : 5}>
                      <Text style={[styles.chipText, filters.type === category.id && styles.chipTextActive]}>{category.label}</Text>
                    </BlurView>
                  </TouchableOpacity>
                </Animated.View>
              ))}
            </ScrollView>
            <TouchableOpacity
              onPress={() => {
                navigation.navigate("SearchFilters", { ...route?.params, type: filters.type });
              }}
              style={[styles.chipWrapper]}
            >
              <BlurView style={[styles.chip]} intensity={5}>
                <Text style={[styles.chipText]}>Filters</Text>
              </BlurView>
            </TouchableOpacity>
          </View>

          <FlashList
            estimatedItemSize={430}
            contentContainerStyle={{ padding: 15 }}
            data={allResults}
            renderItem={({ item, index }) => <MovieCard index={index} item={item} />}
            keyExtractor={(item, index) => {
              const mediaType = item.media_type || filters.type;
              const uniqueId = `${item.id}-${mediaType}`;
              return uniqueId;
            }}
            onEndReached={handleEndReached}
            onEndReachedThreshold={0.5}
            ListFooterComponent={() =>
              isFetching && currentPage > 1 ? (
                <ActivityIndicator style={styles.loader} animating={true} color={MD2DarkTheme.colors.primary} />
              ) : null
            }
            ListEmptyComponent={renderEmptyComponent}
          />
        </View>
      </BlurView>
    </TransparentModalScreen>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.1)",
  },
  searchContainer: {
    paddingHorizontal: 15,
    marginBottom: 15,
  },
  searchbar: {
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    borderRadius: 100,
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  searchInput: {
    color: "#fff",
  },
  chipContainer: {
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.1)",
    paddingBottom: 15,
    flexDirection: "row",
    paddingRight: 15,
  },
  listContent: {
    paddingHorizontal: 15,
    paddingBottom: 20,
    minHeight: 100,
  },
  cardImage: {
    borderRadius: 10,
    height: 230,
    width: 170,
    borderColor: "rgba(255,255,255,0.1)",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  loader: {
    marginVertical: 20,
  },
  emptyText: {
    textAlign: "center",
    marginTop: 40,
    opacity: 0.7,
  },
  errorText: {
    textAlign: "center",
    marginTop: 40,
    color: "#ff6b6b",
    fontSize: 16,
  },
  modal: {
    backgroundColor: "#1e1e1e",
    margin: 20,
    padding: 20,
    borderRadius: 10,
  },
  modalTitle: {
    marginBottom: 10,
  },
  divider: {
    marginVertical: 10,
  },
  applyButton: {
    marginTop: 20,
  },
  chipWrapper: {
    marginRight: 10,
    borderRadius: 100,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  chipText: {
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: 14,
    fontWeight: "500",
  },
  chipTextActive: {
    color: "#fff",
    fontWeight: "600",
  },
  categoriesContainer: {
    paddingHorizontal: 15,
  },
});

export default SearchScreen;
