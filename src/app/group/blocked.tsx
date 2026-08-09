import { useMemo } from "react";
import Text from "../../components/Text";
import { StyleSheet, View } from "react-native";

import Button from "../../components/Button";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useBlockedMovies } from "../../hooks/useBlockedMovies";
import useTranslation from "../../service/useTranslation";
import GroupScreenLayout from "../../components/Group/GroupScreenLayout";
import { fontSize, radius, spacing } from "../../constants/design";

export default function BlockedMoviesGroup() {
  const { blockedMovies, unblockMovie } = useBlockedMovies();
  const t = useTranslation();

  const data = useMemo(
    () => blockedMovies.map((m) => ({
      id: m.movie_id,
      poster_path: m.poster_path || "",
      title: m.title || "",
      type: m.movie_type,
    })),
    [blockedMovies],
  );

  return (
    <GroupScreenLayout
      title={t("blocked.title") as string}
      data={data}
      useMovieType
      subheader={
        <View style={styles.banner}>
          <MaterialCommunityIcons name="cancel" size={22} color="#FF4458" style={styles.bannerIcon} />
          <Text style={styles.bannerText}>
            Blocked movies are completely removed from all your games — for you and every player who plays with you.
          </Text>
        </View>
      }
      renderItemFooter={(item) => (
        <View style={styles.footer}>
          <Button
            mode="outlined"
            onPress={() => unblockMovie(item.id, item.type as "movie" | "tv")}
            style={styles.button}
            compact
          >
            {t("blocked.unblock") as string}
          </Button>
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  footer: { flex: 1, justifyContent: "flex-end", marginTop: spacing.xs + 1 },
  button: { marginTop: spacing.sm },
  banner: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "rgba(255, 68, 88, 0.08)",
    borderLeftWidth: 3,
    borderLeftColor: "#FF4458",
    borderRadius: radius.sm,
    padding: spacing.md,
    marginBottom: spacing.xl,
  },
  bannerIcon: { marginRight: spacing.sm + 2, marginTop: spacing.xs - 3 },
  bannerText: { flex: 1, fontSize: fontSize.md - 1, lineHeight: 19, color: "rgba(255, 255, 255, 0.75)" },
});
