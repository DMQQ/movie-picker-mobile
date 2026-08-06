import { MaterialCommunityIcons } from "@expo/vector-icons";
import { ImageBackground } from "expo-image";
import {
  Dimensions,
  FlatList,
  Pressable,
  StyleSheet,
  View,
} from "react-native";
import { Text } from "react-native-paper";
import { colors } from "../constants/design";
import { Link, router } from "expo-router";
import { useAppSelector } from "../redux/store";
import { useBlockedMovies } from "../hooks/useBlockedMovies";
import { useSuperLikedMovies } from "../hooks/useSuperLikedMovies";
import Thumbnail from "./Thumbnail";
import useTranslation from "../service/useTranslation";

const { width: WINDOW_WIDTH } = Dimensions.get("window");

type Props = {
  listRef?: React.RefObject<FlatList | null>;
};

export default function LocalFavouritesList({ listRef }: Props) {
  const groups = useAppSelector((state) => state.favourite.groups);
  const { blockedMovies } = useBlockedMovies();
  const { superLikedMovies } = useSuperLikedMovies();
  const t = useTranslation();

  return (
    <FlatList
      ref={listRef}
      showsVerticalScrollIndicator={false}
      data={groups}
      keyExtractor={(item, index) => item.id + "-" + index}
      contentContainerStyle={{ paddingTop: 80, paddingBottom: 60 }}
      ListFooterComponent={
        <View style={styles.footerContainer}>
          <Pressable
            onPress={() => router.push("/group/super-liked")}
            style={styles.footerCard}
          >
            <View
              style={{
                borderRadius: 10,
                overflow: "hidden",
                position: "relative",
              }}
            >
              <ImageBackground
                blurRadius={20}
                style={styles.cardBg}
                source={
                  superLikedMovies[0]
                    ? {
                        uri:
                          "https://image.tmdb.org/t/p/w500" +
                          superLikedMovies[0].poster_path,
                      }
                    : undefined
                }
              >
                <View
                  style={[
                    styles.overlay,
                    { backgroundColor: "rgba(255, 215, 0, 0.12)" },
                  ]}
                />
                {superLikedMovies.length === 0 ? (
                  <View style={styles.emptyInner}>
                    <MaterialCommunityIcons
                      name="star"
                      size={50}
                      color="#FFD700"
                      style={{ opacity: 0.5 }}
                    />
                  </View>
                ) : (
                  <View style={styles.thumbnailGrid}>
                    {superLikedMovies.slice(0, 4).map((m) => (
                      <Thumbnail
                        key={m.movie_id}
                        path={m.poster_path || ""}
                        size={200}
                        container={styles.thumbnail}
                      />
                    ))}
                  </View>
                )}
              </ImageBackground>
              <View style={styles.labelRow}>
                <Text style={[styles.labelText, { color: "#FFD700" }]}>
                  {t("super-liked.title")}
                </Text>
                <Text style={styles.countText}>
                  ({superLikedMovies.length})
                </Text>
              </View>
            </View>
          </Pressable>

          <Pressable
            onPress={() => router.push("/group/blocked")}
            style={styles.footerCard}
          >
            <View
              style={{
                borderRadius: 10,
                overflow: "hidden",
                position: "relative",
              }}
            >
              <ImageBackground
                blurRadius={20}
                style={styles.cardBg}
                source={
                  blockedMovies[0]
                    ? {
                        uri:
                          "https://image.tmdb.org/t/p/w500" +
                          blockedMovies[0].poster_path,
                      }
                    : undefined
                }
              >
                <View
                  style={[
                    styles.overlay,
                    { backgroundColor: "rgba(255, 68, 88, 0.12)" },
                  ]}
                />
                {blockedMovies.length === 0 ? (
                  <View style={styles.emptyInner}>
                    <MaterialCommunityIcons
                      name="cancel"
                      size={50}
                      color="#FF4458"
                      style={{ opacity: 0.5 }}
                    />
                  </View>
                ) : (
                  <View style={styles.thumbnailGrid}>
                    {blockedMovies.slice(0, 4).map((m) => (
                      <Thumbnail
                        key={m.movie_id}
                        path={m.poster_path || ""}
                        size={200}
                        container={styles.thumbnail}
                      />
                    ))}
                  </View>
                )}
              </ImageBackground>
              <View style={styles.labelRow}>
                <Text style={[styles.labelText, { color: "#FF4458" }]}>
                  {t("blocked.title")}
                </Text>
                <Text style={styles.countText}>({blockedMovies.length})</Text>
              </View>
            </View>
          </Pressable>
        </View>
      }
      renderItem={({ item }) => (
        <Link
          disabled={item?.movies?.length === 0}
          style={{ marginBottom: 15 }}
          href={{
            pathname: "/group/[id]",
            params: { id: item.id, group: JSON.stringify(item) },
          }}
        >
          <Link.Trigger>
            <View
              style={{
                borderRadius: 10,
                overflow: "hidden",
                position: "relative",
              }}
            >
              <ImageBackground
                blurRadius={20}
                style={styles.cardBg}
                source={{
                  uri:
                    "https://image.tmdb.org/t/p/w500" +
                    item?.movies[0]?.imageUrl,
                }}
              >
                {item?.movies?.length === 0 && (
                  <View style={styles.emptyInner}>
                    <MaterialCommunityIcons
                      name="plus"
                      size={50}
                      color="white"
                      style={{ opacity: 0.5 }}
                    />
                    <Text style={{ fontSize: 11, textAlign: "center" }}>
                      {t("favourites.empty")}
                    </Text>
                  </View>
                )}
                <View style={styles.thumbnailGrid}>
                  {item.movies.slice(0, 4).map((m: any) => (
                    <Thumbnail
                      key={m.id}
                      path={m.imageUrl}
                      size={200}
                      container={styles.thumbnail}
                    />
                  ))}
                </View>
              </ImageBackground>
              <View style={styles.labelRow}>
                <Text style={[styles.labelText, { color: "#fff" }]}>
                  {item.name}
                </Text>
                <Text style={styles.countText}>({item.movies.length})</Text>
              </View>
            </View>
          </Link.Trigger>
        </Link>
      )}
    />
  );
}

const styles = StyleSheet.create({
  footerContainer: {
    gap: 15,
    marginTop: 15,
  },
  footerCard: {
    marginBottom: 0,
  },
  cardBg: {
    width: WINDOW_WIDTH - 30,
    height: WINDOW_WIDTH / 2 - 30,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.surface,
    paddingBottom: 25,
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  emptyInner: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 10,
  },
  thumbnailGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  thumbnail: {
    width: (WINDOW_WIDTH / 2 - 25) * 0.45,
    height: (WINDOW_WIDTH / 2 - 25) * 0.65,
    borderRadius: 5,
  },
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    position: "absolute",
    bottom: 10,
    left: 15,
    gap: 5,
  },
  labelText: {
    fontSize: 25,
    fontFamily: "Bebas",
  },
  countText: {
    fontSize: 15,
  },
});
