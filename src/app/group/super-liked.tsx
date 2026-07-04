import { useMemo } from "react";
import { Platform, StyleSheet, View } from "react-native";
import { Button, Text } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import SafeIOSContainer from "../../components/SafeIOSContainer";
import PageHeading from "../../components/PageHeading";
import TilesList from "../../components/Overview/TilesList";
import { useSuperLikedMovies } from "../../hooks/useSuperLikedMovies";
import useTranslation from "../../service/useTranslation";

export default function SuperLikedGroup() {
  const { superLikedMovies, removeSuperLike } = useSuperLikedMovies();
  const insets = useSafeAreaInsets();
  const t = useTranslation();

  const data = useMemo(
    () => superLikedMovies.map((m) => ({
      id: m.movie_id,
      poster_path: m.poster_path || "",
      title: m.title || "",
      type: m.movie_type,
    })),
    [superLikedMovies],
  );

  return (
    <SafeIOSContainer style={{ flex: 1, overflow: "hidden" }}>
      <PageHeading
        title={t("super-liked.title") as string}
        styles={Platform.OS === "android" && { marginTop: insets.top }}
      />
      <View
        style={{
          flex: 1,
          paddingHorizontal: 15,
        }}
      >
        <TilesList
          contentContainerStyle={{ paddingTop: 80 }}
          subheader={
            <View style={styles.banner}>
              <MaterialCommunityIcons
                name="star-circle"
                size={22}
                color="#FFD700"
                style={styles.bannerIcon}
              />
              <Text style={styles.bannerText}>
                Super liked movies appear more often in your games — share your
                taste with friends so your favorites show up when playing
                together.
              </Text>
            </View>
          }
          data={data}
          label=""
          useMovieType
          renderItemFooter={(item) => (
            <View style={styles.footer}>
              <Button
                mode="outlined"
                onPress={() =>
                  removeSuperLike(item.id, item.type as "movie" | "tv")
                }
                style={styles.button}
                textColor="#FFD700"
                compact
              >
                {t("super-liked.remove") as string}
              </Button>
            </View>
          )}
        />
      </View>
    </SafeIOSContainer>
  );
}

const styles = StyleSheet.create({
  footer: { flex: 1, justifyContent: "flex-end", marginTop: 5 },
  button: { marginTop: 8, borderColor: "#FFD700" },
  banner: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "rgba(255, 215, 0, 0.08)",
    borderLeftWidth: 3,
    borderLeftColor: "#FFD700",
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
  },
  bannerIcon: {
    marginRight: 10,
    marginTop: 1,
  },
  bannerText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 19,
    color: "rgba(255, 255, 255, 0.75)",
  },
});
