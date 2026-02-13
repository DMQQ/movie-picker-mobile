import { View, StyleSheet, Pressable, Alert, FlatList } from "react-native";
import { Button, Text, IconButton } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import PageHeading from "../../../components/PageHeading";
import Thumbnail, { ThumbnailSizes } from "../../../components/Thumbnail";
import { useBlockedMovies } from "../../../hooks/useBlockedMovies";
import useTranslation from "../../../service/useTranslation";
import { FancySpinner } from "../../../components/FancySpinner";
import type { MovieInteraction } from "../../../database/types";

export default function BlockedMoviesScreen() {
  const insets = useSafeAreaInsets();
  const t = useTranslation();
  const { blockedMovies, loading, unblockMovie, clearAllBlocked } = useBlockedMovies();

  const handleUnblock = (movie: MovieInteraction) => {
    Alert.alert(
      t("common.confirmation"),
      t("blocked.unblock-confirm", { title: movie.title || "this movie" }),
      [
        { text: t("common.cancel"), style: "cancel" },
        {
          text: t("common.yes"),
          onPress: () => unblockMovie(movie.movie_id, movie.movie_type),
        },
      ],
      { userInterfaceStyle: "dark" }
    );
  };

  const handleClearAll = () => {
    if (blockedMovies.length === 0) return;

    Alert.alert(
      t("common.confirmation"),
      t("blocked.clear-all-confirm"),
      [
        { text: t("common.cancel"), style: "cancel" },
        {
          text: t("common.yes"),
          style: "destructive",
          onPress: clearAllBlocked,
        },
      ],
      { userInterfaceStyle: "dark" }
    );
  };

  const renderItem = ({ item }: { item: MovieInteraction }) => (
    <Pressable
      style={styles.movieItem}
      onPress={() =>
        router.push({
          pathname: "/movie/type/[type]/[id]",
          params: { id: item.movie_id, type: item.movie_type },
        })
      }
    >
      <View style={styles.posterContainer}>
        <Thumbnail
          path={item.poster_path || ""}
          size={ThumbnailSizes.poster.small}
          style={styles.poster}
        />
      </View>
      <View style={styles.movieInfo}>
        <Text style={styles.movieTitle} numberOfLines={2}>
          {item.title || `Movie #${item.movie_id}`}
        </Text>
        <Text style={styles.movieType}>
          {item.movie_type === "tv" ? "TV Show" : "Movie"}
        </Text>
      </View>
      <IconButton
        icon="close-circle"
        iconColor="#FF4458"
        size={24}
        onPress={() => handleUnblock(item)}
      />
    </Pressable>
  );

  return (
    <View style={styles.container}>
      <View style={[styles.content, { paddingTop: insets.top }]}>
        <PageHeading title={t("blocked.title")} onPress={() => router.back()} />

        {loading ? (
          <View style={styles.loadingContainer}>
            <FancySpinner size={60} />
          </View>
        ) : blockedMovies.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>{t("blocked.empty")}</Text>
          </View>
        ) : (
          <View style={styles.listContainer}>
            <View style={styles.headerRow}>
              <Text style={styles.countText}>
                {t("blocked.count", { count: blockedMovies.length })}
              </Text>
              <Button
                mode="text"
                textColor="#FF4458"
                onPress={handleClearAll}
                compact
              >
                {t("blocked.clear-all")}
              </Button>
            </View>

            <FlatList
              data={blockedMovies}
              renderItem={renderItem}
              keyExtractor={(item) => `${item.movie_id}-${item.movie_type}`}
              contentContainerStyle={styles.listContent}
            />
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 30,
  },
  emptyText: {
    fontSize: 16,
    color: "rgba(255,255,255,0.6)",
    textAlign: "center",
  },
  listContainer: {
    flex: 1,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  countText: {
    fontSize: 14,
    color: "rgba(255,255,255,0.6)",
  },
  listContent: {
    paddingHorizontal: 15,
    paddingBottom: 100,
  },
  movieItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 12,
    padding: 10,
    marginBottom: 10,
  },
  posterContainer: {
    width: 60,
    height: 90,
    borderRadius: 8,
    overflow: "hidden",
  },
  poster: {
    width: "100%",
    height: "100%",
  },
  movieInfo: {
    flex: 1,
    marginLeft: 12,
  },
  movieTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
  movieType: {
    fontSize: 12,
    color: "rgba(255,255,255,0.5)",
    marginTop: 4,
  },
});
