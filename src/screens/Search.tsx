import React, { useEffect, useState, useCallback, useRef } from "react";
import { View, VirtualizedList, StyleSheet, ScrollView, Dimensions, Image, Pressable } from "react-native";
import { Chip, Text, ActivityIndicator, Portal, Modal, Button, Divider, MD2DarkTheme, TouchableRipple } from "react-native-paper";
import { useLazySearchQuery } from "../redux/movie/movieApi";
import { useNavigation } from "@react-navigation/native";
import CustomSearchBar from "../components/SearchBar";

import useTranslation from "../service/useTranslation";
import { Movie } from "../../types";

const SCREEN_WIDTH = Dimensions.get("window").width;
const ITEM_HEIGHT = 180;

const MovieCard = ({ item }: { item: Movie & { release_date?: string } }) => {
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
    <Pressable
      onPress={() => {
        navigation.navigate("MovieDetails", {
          id: item.id,
          type: item?.title ? "movie" : "tv",
          img: item.poster_path,
        });
      }}
      style={{
        flexDirection: "row",
        width: SCREEN_WIDTH - 20,
        height: ITEM_HEIGHT,
        borderRadius: 10,
        backgroundColor: MD2DarkTheme.colors.surface,
        marginBottom: 15,
      }}
    >
      <Image
        source={{ uri: item?.poster_path ? "https://image.tmdb.org/t/p/w200" + item.poster_path : "https://via.placeholder.com/120x180" }}
        style={styles.cardImage}
      />

      <View style={{ flex: 1, padding: 10, overflow: "hidden", gap: 2.5 }}>
        <Text
          numberOfLines={2}
          style={{
            fontFamily: "Bebas",
            fontSize: 28,
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
      </View>
    </Pressable>
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

  // Monitor route params changes
  useEffect(() => {
    if (JSON.stringify(routeParamsRef.current) !== JSON.stringify(route.params)) {
      routeParamsRef.current = route.params;

      setCurrentPage(1);
      setAllResults([]);
      setHasNextPage(false);
      lastReceivedApiPage.current = 0;
      isLoadingNextPage.current = false;

      performSearch(1);
    }
  }, [route.params]);

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

        return [...results].sort((a, b) => {
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

  const getItem = (_data: any, index: number) => allResults[index];
  const getItemCount = () => allResults.length || 0;

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

  return (
    <View style={styles.container}>
      <CustomSearchBar value={searchQuery} onChangeText={setSearchQuery} placeholder={t("search.search-placeholder")} />

      <View style={styles.chipContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesContainer}>
          {categories.map((category) => (
            <TouchableRipple
              key={category.id}
              onPress={() => handleFilterChange(category.id)}
              style={[styles.categoryChip, filters.type === category.id && styles.categoryChipActive]}
            >
              <Text style={[styles.categoryText, filters.type === category.id && styles.categoryTextActive]}>{category.label}</Text>
            </TouchableRipple>
          ))}
        </ScrollView>
        <TouchableRipple
          onPress={() => {
            navigation.navigate("SearchFilters", { ...route?.params });
          }}
          style={[
            styles.categoryChip,
            route?.params && {
              backgroundColor: MD2DarkTheme.colors.primary,
            },
          ]}
        >
          <Text style={[styles.categoryText]}>Filters</Text>
        </TouchableRipple>
      </View>

      {isError ? (
        <Text style={styles.errorText}>{t("search.error")}</Text>
      ) : (
        <VirtualizedList
          style={{ marginTop: 30 }}
          data={allResults}
          getItem={getItem}
          getItemCount={getItemCount}
          renderItem={({ item }) => <MovieCard item={item} />}
          keyExtractor={(item, index) => {
            const mediaType = item.media_type || filters.type;
            const uniqueId = `${item.id}-${mediaType}-${index}`;
            return uniqueId;
          }}
          getItemLayout={(data, index) => ({
            length: ITEM_HEIGHT + 10,
            offset: (ITEM_HEIGHT + 10) * index,
            index,
          })}
          onEndReached={handleEndReached}
          onEndReachedThreshold={0.5}
          contentContainerStyle={[styles.listContent, allResults.length === 0 && { flex: 1, justifyContent: "center" }]}
          ListFooterComponent={() =>
            isFetching && currentPage > 1 ? (
              <ActivityIndicator style={styles.loader} animating={true} color={MD2DarkTheme.colors.primary} />
            ) : null
          }
          ListEmptyComponent={renderEmptyComponent}
          initialNumToRender={6}
          maxToRenderPerBatch={10}
          windowSize={5}
          removeClippedSubviews={true}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  chipContainer: {
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.1)",
    paddingBottom: 15,
    flexDirection: "row",
  },
  chip: {
    marginHorizontal: 4,
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  listContent: {
    paddingHorizontal: 10,
    paddingBottom: 20,
    minHeight: 100,
  },
  cardImage: {
    width: 120,
    height: ITEM_HEIGHT,
    borderTopLeftRadius: 10,
    borderBottomLeftRadius: 10,
    backgroundColor: "#2a2a2a",
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
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.1)",
    marginRight: 8,
  },
  categoryChipActive: {
    backgroundColor: "#fff",
  },
  categoryText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  categoryTextActive: {
    color: "#000",
  },
  categoriesContainer: {
    paddingHorizontal: 15,
  },
});

export default SearchScreen;
