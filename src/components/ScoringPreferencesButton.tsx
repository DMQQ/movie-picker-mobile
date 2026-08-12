import { Pressable, StyleSheet, View } from "react-native";
import { router } from "expo-router";
import Icon from "./Icon";
import Text from "./Text";
import { useGetScoringPreferencesQuery } from "../redux/scoringPreferences/scoringPreferencesApi";
import type { ScoringProfile } from "../redux/scoringPreferences/scoringPreferencesApi";
import { colors, fontSize, radius, spacing } from "../constants/design";
import useTranslation from "../service/useTranslation";

function countItems(profile: ScoringProfile | null | undefined): number {
  if (!profile) return 0;
  return profile.genres.length + profile.keywords.length;
}

export default function ScoringPreferencesButton() {
  const t = useTranslation();
  const { data } = useGetScoringPreferencesQuery();
  const movieCount = countItems(data?.movie);
  const tvCount = countItems(data?.tv);
  const hasAny = movieCount > 0 || tvCount > 0;

  const parts: string[] = [];
  if (movieCount > 0) parts.push(t("account.tasteProfileMovies").replace("{count}", String(movieCount)));
  if (tvCount > 0) parts.push(t("account.tasteProfileTV").replace("{count}", String(tvCount)));

  return (
    <Pressable
      style={styles.card}
      onPress={() => router.push("/account/scoring-preferences")}
    >
      <View style={styles.left}>
        <Icon source="tune-variant" size={16} color={colors.placeholder} />
        <Text style={styles.label}>{t("account.tasteProfile")}</Text>
      </View>
      <View style={styles.right}>
        <Text style={styles.summary} numberOfLines={1}>
          {hasAny ? parts.join(" · ") : t("account.tasteProfileEmpty")}
        </Text>
        <Icon source="chevron-right" size={16} color={colors.placeholder} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md + 2,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 5
  },
  left: { flexDirection: "row", alignItems: "center", gap: spacing.sm + 2 },
  label: { fontSize: fontSize.md, color: colors.text },
  right: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    flexShrink: 1,
  },
  summary: { fontSize: fontSize.md, color: colors.placeholder, flexShrink: 1 },
});
