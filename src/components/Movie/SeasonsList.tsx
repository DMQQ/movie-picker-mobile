import { FlatList, Image, Pressable, View } from "react-native";
import { MD2DarkTheme, Text } from "react-native-paper";
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
    <View style={{ marginTop: 15, paddingBottom: 20 }}>
      <Text style={{ fontSize: 35, marginBottom: 10, fontFamily: "Bebas" }}>
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
                borderRadius: 15,
                flexDirection: "row",
                width: 250,
                padding: 15,
                flex: 0,
              }}
              container={{
                marginRight: 15,
                ...(item.season_number === selectedSeason ? { borderColor: MD2DarkTheme.colors.primary } : {}),
              }}
            >
              {item.poster_path?.length > 0 && (
                <Thumbnail
                  container={{
                    width: 70,
                    height: 100,
                    borderRadius: 10,
                  }}
                  path={item.poster_path}
                />
              )}

              <View
                style={{
                  flex: 1,
                  alignItems: "flex-start",
                  padding: 10,
                  paddingRight: 20,
                  justifyContent: "space-between",
                }}
              >
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 20, fontFamily: "Bebas" }}>{item.name}</Text>
                  <Text style={{ color: "#9E9E9E", marginTop: 2.5, fontSize: 12 }}>
                    {t("movie.details.episode")} ({item.episode_count})
                  </Text>
                  <Text
                    style={{
                      color: "#9E9E9E",
                      fontSize: 12,
                      marginTop: 2.5,
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
