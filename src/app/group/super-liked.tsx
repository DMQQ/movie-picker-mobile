import { useMemo } from "react";
import { StyleSheet, View } from "react-native";
import { Button, Text } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useSuperLikedMovies } from "../../hooks/useSuperLikedMovies";
import useTranslation from "../../service/useTranslation";
import GroupScreenLayout from "../../components/Group/GroupScreenLayout";
import { fontSize, radius, spacing } from "../../constants/design";

export default function SuperLikedGroup() {
  const { superLikedMovies, removeSuperLike } = useSuperLikedMovies();
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
    <GroupScreenLayout
      title={t("super-liked.title") as string}
      data={data}
      useMovieType
      subheader={
        <View style={styles.banner}>
          <MaterialCommunityIcons name="star-circle" size={22} color="#FFD700" style={styles.bannerIcon} />
          <Text style={styles.bannerText}>
            Super liked movies appear more often in your games — share your taste with friends so your favorites show up when playing together.
          </Text>
        </View>
      }
      renderItemFooter={(item) => (
        <View style={styles.footer}>
          <Button
            mode="outlined"
            onPress={() => removeSuperLike(item.id, item.type as "movie" | "tv")}
            style={styles.button}
            textColor="#FFD700"
            compact
          >
            {t("super-liked.remove") as string}
          </Button>
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  footer: { flex: 1, justifyContent: "flex-end", marginTop: spacing.xs + 1 },
  button: { marginTop: spacing.sm, borderColor: "#FFD700" },
  banner: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "rgba(255, 215, 0, 0.08)",
    borderLeftWidth: 3,
    borderLeftColor: "#FFD700",
    borderRadius: radius.sm,
    padding: spacing.md,
    marginBottom: spacing.xl,
  },
  bannerIcon: { marginRight: spacing.sm + 2, marginTop: spacing.xs - 3 },
  bannerText: { flex: 1, fontSize: fontSize.md - 1, lineHeight: 19, color: "rgba(255, 255, 255, 0.75)" },
});
