import React, { useEffect, useState, useCallback, useRef } from "react";
import { View, VirtualizedList, StyleSheet, ScrollView, Dimensions, Image, Pressable } from "react-native";
import { Chip, Text, ActivityIndicator, Portal, Modal, Button, Divider, MD2DarkTheme } from "react-native-paper";
import { useLazySearchQuery } from "../redux/movie/movieApi";
import { useNavigation } from "@react-navigation/native";
import CustomSearchBar from "../components/SearchBar";

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
        marginBottom: 10,
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

  // Maintain our own accumulating results
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
    }
    isFirstLoad.current = false;
  }, [searchQuery, filters.type, filters.genres, filters.minRating]);

  // Process search results
  useEffect(() => {
    if (data) {
      if (currentPage === 1) {
        // Replace results on first page
        setAllResults(data.results || []);
      } else {
        // Append results for subsequent pages
        setAllResults((prev) => [...prev, ...(data.results || [])]);
      }

      // Update pagination state
      setHasNextPage(data.page < data.total_pages);
    }
  }, [data, currentPage]);

  // Handle search query
  useEffect(() => {
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }

    if (searchQuery.trim().length > 0) {
      searchTimeout.current = setTimeout(() => {
        search({
          query: searchQuery,
          page: currentPage,
          type: filters.type,
          with_genres: filters.genres.length > 0 ? filters.genres : undefined,
          vote_average_gte: filters.minRating,
        });
      }, 500);
    } else {
      // Clear results if search query is empty
      setAllResults([]);
      setHasNextPage(false);
    }

    return () => {
      if (searchTimeout.current) {
        clearTimeout(searchTimeout.current);
      }
    };
  }, [filters, searchQuery, currentPage, search]);

  const handleEndReached = useCallback(() => {
    if (!isFetching && hasNextPage) {
      setCurrentPage((prev) => prev + 1);
    }
  }, [isFetching, hasNextPage, currentPage, allResults.length]);

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

  return (
    <View style={styles.container}>
      <CustomSearchBar value={searchQuery} onChangeText={setSearchQuery} />

      <View style={styles.chipContainer}>
        <ScrollView style={{ paddingHorizontal: 10 }} horizontal showsHorizontalScrollIndicator={false}>
          <Chip selected={filters.type === "both"} onPress={() => handleFilterChange("both")} style={styles.chip} theme={MD2DarkTheme}>
            All
          </Chip>
          <Chip selected={filters.type === "movie"} onPress={() => handleFilterChange("movie")} style={styles.chip} theme={MD2DarkTheme}>
            Movies
          </Chip>
          <Chip selected={filters.type === "tv"} onPress={() => handleFilterChange("tv")} style={styles.chip} theme={MD2DarkTheme}>
            TV Shows
          </Chip>
        </ScrollView>
      </View>

      {isError ? (
        <Text style={styles.errorText}>Something went wrong. Please try again.</Text>
      ) : (
        <VirtualizedList
          data={allResults}
          getItem={getItem}
          getItemCount={getItemCount}
          renderItem={({ item }) => <MovieCard item={item} />}
          keyExtractor={(item) => `${item.id}-${item.media_type || filters.type}`}
          getItemLayout={(data, index) => ({
            length: ITEM_HEIGHT + 10, // Include margin
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
    marginVertical: 10,
  },
  chip: {
    marginHorizontal: 4,
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
});

export default SearchScreen;
