import { FlatList, StyleSheet, View } from "react-native";
import Text from "../Text";
import Card from "../Card";

import { colors, fontSize, radius, spacing, typography } from "../../constants/design";
import useTranslation from "../../service/useTranslation";
import Thumbnail from "../Thumbnail";
import RatingIcons from "../RatingIcons";
import SeasonEpisodes from "./SeasonEpisodes";
import { useMemo, useState } from "react";

interface Season {
  air_date: string;
  episode_count: number;

  id: number;

  name: string;

  overview: string;

  poster_path: string;

  season_number: number;

  vote_average: number;
}

const Seasons = ({ seasons, id }: { seasons: Season[]; id: number }) => {
  const t = useTranslation();
  const [selectedSeason, setSelectedSeason] = useState<number>(1);

  const seasonsList = useMemo(() => {
    if (seasons?.length === 0 || seasons === undefined) return [];

    if (seasons[0]?.season_number === 0) {
      const firstItem = seasons[0];

      return [...seasons.slice(1), firstItem];
    }

    return seasons;
  }, [seasons]);

  if (seasons?.length === 0 || seasons === undefined) return null;

  return (
    <View style={styles.root}>
      <Text style={styles.heading}>
        {t("movie.tabs.seasons")} ({seasons.length})
      </Text>
      <FlatList
        showsHorizontalScrollIndicator={false}
        horizontal
        data={seasonsList}
        keyExtractor={(item) => item.id.toString()}
        nestedScrollEnabled
        renderItem={({ item }) => (
          <Card
            onPress={() => setSelectedSeason(item.season_number)}
            style={[
              styles.card,
              item.season_number === selectedSeason && styles.cardSelected,
            ]}
          >
            {item.poster_path?.length > 0 && (
              <Thumbnail
                container={styles.poster}
                path={item.poster_path}
              />
            )}

            <View style={styles.cardBody}>
              <Text style={styles.seasonName}>{item.name}</Text>
              <Text style={styles.meta}>
                {t("movie.details.episode")} ({item.episode_count})
              </Text>
              <Text style={styles.meta}>{item.air_date}</Text>
              {item.vote_average > 0 && (
                <View style={styles.rating}>
                  <RatingIcons vote={item.vote_average} size={15} />
                </View>
              )}
            </View>
          </Card>
        )}
      />
      <SeasonEpisodes id={id} season={selectedSeason} />
    </View>
  );
};
export default Seasons;

const styles = StyleSheet.create({
  root: {
    marginTop: spacing.lg,
    paddingBottom: spacing.xl,
  },
  heading: {
    fontSize: typography.bebasSize.section,
    fontFamily: typography.bebas,
    letterSpacing: typography.bebasLetterSpacing,
    marginBottom: spacing.md,
  },
  cardSelected: {
    borderColor: colors.primary,
  },
  card: {
    flexDirection: "row",
    width: 250,
    marginRight: spacing.lg,
  },
  poster: {
    width: 65,
    borderRadius: 0,
  },
  cardBody: {
    flex: 1,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    gap: spacing.xs,
  },
  seasonName: {
    fontSize: fontSize.xxl,
    fontFamily: typography.bebas,
    letterSpacing: typography.bebasLetterSpacing,
  },
  meta: {
    color: colors.placeholder,
    fontSize: fontSize.sm,
  },
  rating: {
    flexDirection: "row",
  },
});
