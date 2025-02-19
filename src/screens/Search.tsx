import React, { useEffect, useState, useCallback, useRef } from "react";
import { View, VirtualizedList, StyleSheet, ScrollView, Dimensions, Image, Pressable } from "react-native";
import { Chip, Text, ActivityIndicator, Portal, Modal, Button, Divider, MD2DarkTheme, TouchableRipple } from "react-native-paper";
import { useLazySearchQuery } from "../redux/movie/movieApi";
import { useNavigation } from "@react-navigation/native";
import CustomSearchBar from "../components/SearchBar";
import { removeDuplicateResults } from "../utils/deduplicates";

const SCREEN_WIDTH = Dimensions.get("window").width;
const ITEM_HEIGHT = 180;

const MovieCard = ({ item }: { item: any }) => {
  const data = [
    `${item?.vote_average?.toFixed(2)}/10`,
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

      <View style={{ flex: 1, padding: 10, overflow: "hidden" }}>
        <Text
          numberOfLines={2}
          style={{
            fontFamily: "Bebas",
            fontSize: 28,
            marginBottom: 5,
          }}
        >
          {item?.title || item?.name}
        </Text>

        <Text style={{ color: "rgba(255, 255, 255, 0.8)" }}>{data.join(" | ")}</Text>

        <Text numberOfLines={3} style={{ marginTop: 5 }}>
          {item.overview}
        </Text>
      </View>
    </Pressable>
  );
};

const SearchScreen = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    type: "both" as "movie" | "tv" | "both",
    genres: [] as number[],
    minRating: undefined as number | undefined,
  });

  const [allResults, setAllResults] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const isFirstLoad = useRef(true);

  const [search, { data, isLoading, isFetching, isError }] = useLazySearchQuery();

  const searchTimeout = React.useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (!isFirstLoad.current) {
      setCurrentPage(1);
      setAllResults([]);
      setHasNextPage(false);
      lastReceivedApiPage.current = 0;
      isLoadingNextPage.current = false;
    }
    isFirstLoad.current = false;
  }, [searchQuery, filters.type, filters.genres, filters.minRating]);

  const lastReceivedApiPage = useRef(0);

  useEffect(() => {
    if (!data) return;

    if (currentPage > 1 && data.page < currentPage && data.page <= lastReceivedApiPage.current) {
      return;
    }

    lastReceivedApiPage.current = data.page;

    let newResults;
    if (currentPage === 1 || data.page === 1) {
      newResults = data.results || [];
    } else {
      newResults = [...allResults, ...(data.results || [])];
    }

    const newHasNextPage = data.page < data.total_pages;

    setAllResults(newResults);
    setHasNextPage(newHasNextPage);
  }, [data, currentPage]);

  useEffect(() => {
    const fetchResults = async () => {
      if (searchTimeout.current) {
        clearTimeout(searchTimeout.current);
      }

      if (searchQuery.trim().length === 0) {
        setAllResults([]);
        setHasNextPage(false);
        lastReceivedApiPage.current = 0;
        return;
      }

      try {
        const response = await search({
          query: searchQuery,
          page: currentPage,
          type: filters.type,
          with_genres: filters.genres.length > 0 ? filters.genres : undefined,
          vote_average_gte: filters.minRating,
        }).unwrap();

        lastReceivedApiPage.current = response.page;

        let newResults;
        if (response.page === 1) {
          newResults = removeDuplicateResults(response.results || []);
        } else {
          const combinedResults = [...allResults, ...(response.results || [])];
          newResults = removeDuplicateResults(combinedResults);
        }

        setAllResults(newResults);

        const hasMore = response.page < response.total_pages;

        setHasNextPage(hasMore);

        isLoadingNextPage.current = false;
      } catch (error) {
        isLoadingNextPage.current = false;
      }
    };

    searchTimeout.current = setTimeout(() => {
      fetchResults();
    }, 500);

    return () => {
      if (searchTimeout.current) {
        clearTimeout(searchTimeout.current);
      }
    };
  }, [search, searchQuery, currentPage, filters]);

  const isLoadingNextPage = useRef(false);

  const handleEndReached = useCallback(() => {
    if (!isFetching && hasNextPage && !isLoadingNextPage.current) {
      isLoadingNextPage.current = true;
      setCurrentPage((prev) => prev + 1);
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

    if (searchQuery.trim().length === 0) {
      return (
        <Text style={styles.emptyText} variant="bodyLarge">
          Enter a search term to begin
        </Text>
      );
    }

    if (!isLoading && searchQuery.trim().length > 0) {
      return (
        <Text style={styles.emptyText} variant="bodyLarge">
          No results found for "{searchQuery}"
        </Text>
      );
    }

    return null;
  }, [isLoading, searchQuery, currentPage]);

  const categories = [
    { id: "both", label: "Both" },
    { id: "movie", label: "Movies" },
    { id: "tv", label: "TV Shows" },
  ] as { id: "movie" | "tv" | "both"; label: string }[];

  return (
    <View style={styles.container}>
      <CustomSearchBar value={searchQuery} onChangeText={setSearchQuery} />

      <View style={styles.chipContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesContainer}>
          {categories.map((category) => (
            <TouchableRipple
              key={category.id}
              onPress={() => setFilters((p) => ({ ...p, type: category.id }))}
              style={[styles.categoryChip, filters.type === category.id && styles.categoryChipActive]}
            >
              <Text style={[styles.categoryText, filters.type === category.id && styles.categoryTextActive]}>{category.label}</Text>
            </TouchableRipple>
          ))}

          <TouchableRipple onPress={() => {}} style={[styles.categoryChip]}>
            <Text style={[styles.categoryText]}>Filters</Text>
          </TouchableRipple>
        </ScrollView>
      </View>

      {isError ? (
        <Text style={styles.errorText}>Something went wrong. Please try again.</Text>
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

      <Portal>
        <Modal visible={showFilters} onDismiss={() => setShowFilters(false)} contentContainerStyle={styles.modal} theme={MD2DarkTheme}>
          <Text variant="titleLarge" style={styles.modalTitle}>
            Filters
          </Text>
          <Divider style={styles.divider} />

          <Button mode="contained" onPress={() => setShowFilters(false)} style={styles.applyButton} theme={MD2DarkTheme}>
            Apply Filters
          </Button>
        </Modal>
      </Portal>
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
