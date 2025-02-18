import React, { useEffect, useState } from "react";
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
      }}
    >
      <Image source={{ uri: "https://image.tmdb.org/t/p/w200" + item?.poster_path }} style={styles.cardImage} />

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
  const [page, setPage] = useState(1);

  const [search, { data, isLoading, isFetching }] = useLazySearchQuery();

  const searchTimeout = React.useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }

    searchTimeout.current = setTimeout(() => {
      search({
        query: searchQuery,
        page,
        type: filters.type,
        with_genres: filters.genres,
        vote_average_gte: filters.minRating,
      });
    }, 500);

    return () => {
      if (searchTimeout.current) {
        clearTimeout(searchTimeout.current);
      }
    };
  }, [filters, searchQuery, page]);

  const handleEndReached = () => {
    if (!isFetching && data?.total_pages > page) {
      setPage((prev) => prev + 1);
    }
  };

  const getItem = (_data: any, index: number) => data?.results[index];
  const getItemCount = () => data?.results?.length || 0;

  return (
    <View style={styles.container}>
      <CustomSearchBar value={searchQuery} onChangeText={setSearchQuery} />

      <View style={styles.chipContainer}>
        <ScrollView style={{ paddingHorizontal: 10 }} horizontal showsHorizontalScrollIndicator={false}>
          <Chip
            selected={filters.type === "both"}
            onPress={() => setFilters((f) => ({ ...f, type: "both" }))}
            style={styles.chip}
            theme={MD2DarkTheme}
          >
            All
          </Chip>
          <Chip
            selected={filters.type === "movie"}
            onPress={() => setFilters((f) => ({ ...f, type: "movie" }))}
            style={styles.chip}
            theme={MD2DarkTheme}
          >
            Movies
          </Chip>
          <Chip
            selected={filters.type === "tv"}
            onPress={() => setFilters((f) => ({ ...f, type: "tv" }))}
            style={styles.chip}
            theme={MD2DarkTheme}
          >
            TV Shows
          </Chip>
        </ScrollView>
      </View>

      <VirtualizedList
        data={data?.results}
        getItem={getItem}
        getItemCount={getItemCount}
        renderItem={({ item }) => <MovieCard item={item} />}
        keyExtractor={(item) => item.id.toString()}
        getItemLayout={(data, index) => ({
          length: ITEM_HEIGHT,
          offset: ITEM_HEIGHT * index,
          index,
        })}
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.5}
        contentContainerStyle={styles.listContent}
        ListFooterComponent={() =>
          isFetching ? <ActivityIndicator style={styles.loader} animating={true} color={MD2DarkTheme.colors.primary} /> : null
        }
        ListEmptyComponent={() =>
          !isLoading && (
            <Text style={styles.emptyText} variant="bodyLarge">
              No results found
            </Text>
          )
        }
        initialNumToRender={6}
        maxToRenderPerBatch={10}
        windowSize={5}
      />

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
    padding: 5,
    backgroundColor: "#000",
  },
  searchBar: {
    marginBottom: 10,
    backgroundColor: MD2DarkTheme.colors.surface,
    borderRadius: 100,
    paddingHorizontal: 5,
  },
  chipContainer: {
    marginBottom: 10,
  },
  chip: {
    marginRight: 10,
    backgroundColor: MD2DarkTheme.colors.surface,
  },
  listContent: {
    gap: 15,
    padding: 15,
  },
  card: {
    backgroundColor: MD2DarkTheme.colors.surface,
    marginBottom: 15,
  },
  cardImage: {
    width: 120,
    height: 180,
    borderRadius: 10,
  },
  cardContent: {
    padding: 10,
  },
  title: {
    color: "#fff",
  },
  rating: {
    color: MD2DarkTheme.colors.primary,
    marginTop: 5,
  },
  loader: {
    padding: 15,
  },
  emptyText: {
    textAlign: "center",
    padding: 15,
    color: "#fff",
  },
  modal: {
    margin: 20,
    borderRadius: 8,
    padding: 15,
    backgroundColor: MD2DarkTheme.colors.surface,
  },
  modalTitle: {
    color: "#fff",
    marginBottom: 15,
  },
  divider: {
    marginVertical: 15,
    backgroundColor: MD2DarkTheme.colors.primary,
  },
  applyButton: {
    marginTop: 15,
  },
});

export default SearchScreen;
