import { FlatList, Image, Pressable, View } from "react-native";
import { Text } from "react-native-paper";
import { colors, fontSize, radius, spacing, typography } from "../../constants/design";
import useTranslation from "../../service/useTranslation";
import Thumbnail from "../Thumbnail";
import FrostedGlass from "../FrostedGlass";
import RatingIcons from "../RatingIcons";
import SeasonEpisodes from "./SeasonEpisodes";
import { useMemo, useState } from "react";
import { hexToRgba } from "../../utils/hexToRgb";

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
    <View style={{ marginTop: spacing.screen, paddingBottom: spacing.xl }}>
      <Text style={{ fontSize: typography.bebasSize.section, marginBottom: spacing.sm + 2, fontFamily: "Bebas" }}>
        {t("movie.details.season")} {seasons.length}
      </Text>
      <FlatList
        showsHorizontalScrollIndicator={false}
        horizontal
        data={seasonsList}
        keyExtractor={(item) => item.id.toString()}
        nestedScrollEnabled={true}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => {
              setSelectedSeason(item.season_number);
            }}
          >
            <FrostedGlass
              style={{
                borderRadius: radius.md + 3,
                flexDirection: "row",
                width: 250,
                padding: spacing.screen,
                flex: 0,
              }}
              container={{
                marginRight: spacing.screen,
                ...(item.season_number === selectedSeason ? { borderColor: colors.primary } : {}),
              }}
            >
              {item.poster_path?.length > 0 && (
                <Thumbnail
                  container={{
                    width: 70,
                    height: 100,
                    borderRadius: radius.sm + 2,
                  }}
                  path={item.poster_path}
                />
              )}

              <View
                style={{
                  flex: 1,
                  alignItems: "flex-start",
                  padding: spacing.sm + 2,
                  paddingRight: spacing.xl,
                  justifyContent: "space-between",
                }}
              >
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: fontSize.xxl, fontFamily: "Bebas" }}>{item.name}</Text>
                  <Text style={{ color: "#9E9E9E", marginTop: spacing.xs - 2.5, fontSize: fontSize.sm }}>
                    {t("movie.details.episode")} ({item.episode_count})
                  </Text>
                  <Text
                    style={{
                      color: "#9E9E9E",
                      fontSize: fontSize.sm,
                      marginTop: spacing.xs - 2.5,
                    }}
                  >
                    {item.air_date}
                  </Text>
                  {item.vote_average > 0 && (
                    <View
                      style={{
                        flex: 1,
                        justifyContent: "space-between",
                        flexDirection: "row",
                      }}
                    >
                      <RatingIcons vote={item.vote_average} size={15} />
                    </View>
                  )}
                </View>
              </View>
            </FrostedGlass>
          </Pressable>
        )}
      />
      <SeasonEpisodes id={id} season={selectedSeason} />
    </View>
  );
};
export default Seasons;
