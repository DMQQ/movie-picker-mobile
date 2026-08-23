import { useState } from "react";
import Text from "../Text";
import Touch from "../Touch";
import { ActivityIndicator, StyleSheet, View } from "react-native";

import Animated, { FadeIn, LinearTransition } from "react-native-reanimated";
import { Episode } from "../../../types";
import { useGetSeasonEpisodesQuery } from "../../redux/movie/movieApi";
import useTranslation from "../../service/useTranslation";
import Card from "../Card";
import RatingIcons from "../RatingIcons";
import Thumbnail from "../Thumbnail";
import { colors, fontSize, fontWeight, spacing, typography } from "../../constants/design";

export default function SeasonEpisodes({ id, season }: { id: number; season: number }) {
  const { data, isLoading } = useGetSeasonEpisodesQuery({ id, season }, { refetchOnMountOrArgChange: true });

  const [showAll, setShowAll] = useState<boolean>(false);

  const t = useTranslation();

  if (isLoading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color={colors.text} />
      </View>
    );
  }

  if (!data || !data?.episodes || data?.episodes?.length === 0) return null;

  return (
    <Animated.View style={styles.root} layout={LinearTransition}>
      <Text style={styles.heading}>
        {t("movie.details.season")} {season}{" "}
        <Text style={styles.headingCount}>{data?.episodes.length ? `(${data?.episodes.length})` : ""}</Text>
      </Text>
      {data?.episodes.slice(0, showAll ? data?.episodes.length : 5).map((item: Episode, index) => (
        <Animated.View key={item.id} entering={FadeIn.delay(index * 50)} style={styles.episodeWrapper}>
          <Card style={styles.episodeCard}>
            <Thumbnail
              path={item.still_path}
              style={styles.still}
              container={styles.stillContainer}
              size={300}
            />
            <View style={styles.episodeBody}>
              <Text style={styles.episodeName}>{item.name || item.episode_type}</Text>
              <View style={styles.ratingRow}>
                <RatingIcons size={13} vote={item.vote_average} />
                <Text style={styles.ratingText}>{item.vote_average.toFixed(2)}</Text>
              </View>
              <Text style={styles.runtime}>{item.runtime} min</Text>
              {item.overview && (
                <Text numberOfLines={2} style={styles.overview}>{item.overview}</Text>
              )}
            </View>
          </Card>
        </Animated.View>
      ))}
      {(data?.episodes.length || 0) > 5 && (
        <Touch onPress={() => setShowAll((p) => !p)} style={styles.showMore}>
          <Text style={styles.showMoreText}>
            {showAll ? t("movie.details.show_less") : t("movie.details.show_more")}
          </Text>
        </Touch>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  loader: {
    marginTop: spacing.xxl,
    justifyContent: "center",
    alignItems: "center",
  },
  root: {
    marginTop: spacing.xxl,
    paddingBottom: spacing.xxl,
  },
  heading: {
    fontSize: typography.bebasSize.section,
    fontFamily: typography.bebas,
    letterSpacing: typography.bebasLetterSpacing,
    color: colors.text,
    marginBottom: spacing.md,
  },
  headingCount: {
    fontSize: fontSize.xxl,
    fontFamily: typography.bebas,
  },
  episodeWrapper: {
    marginBottom: spacing.md,
  },
  episodeCard: {
    flexDirection: "row",
    alignItems: "center",
  },
  still: {
    height: 90,
    width: 120,
    borderRadius: 0,
  },
  stillContainer: {
    backgroundColor: "transparent",
  },
  episodeBody: {
    flex: 1,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    gap: spacing.xs,
  },
  episodeName: {
    fontFamily: typography.bebas,
    letterSpacing: typography.bebasLetterSpacing,
    fontSize: fontSize.xxl,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  ratingText: {
    fontSize: fontSize.sm,
    color: colors.placeholder,
    fontWeight: fontWeight.medium,
  },
  runtime: {
    fontSize: fontSize.sm,
    color: colors.placeholder,
  },
  overview: {
    fontSize: fontSize.sm,
    color: colors.placeholder,
    lineHeight: 18,
  },
  showMore: {
    alignItems: "center",
    paddingVertical: spacing.md,
    marginBottom: spacing.lg,
  },
  showMoreText: {
    color: colors.primary,
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
  },
});
