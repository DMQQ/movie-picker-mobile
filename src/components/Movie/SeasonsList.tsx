import { FlatList, Image, View } from "react-native";
import { Text } from "react-native-paper";
import useTranslation from "../../service/useTranslation";
import Thumbnail from "../Thumbnail";
import FrostedGlass from "../FrostedGlass";
import RatingIcons from "../RatingIcons";

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

const Seasons = ({ seasons }: { seasons: Season[] }) => {
  const t = useTranslation();
  if (seasons?.length === 0 || seasons === undefined) return null;

  return (
    <View style={{ marginTop: 30 }}>
      <Text style={{ fontSize: 35, marginBottom: 10, fontFamily: "Bebas" }}>
        {t("movie.details.season")} {seasons.length}
      </Text>
      <FlatList
        showsHorizontalScrollIndicator={false}
        horizontal
        data={seasons}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <FrostedGlass
            style={{
              borderRadius: 20,
              flexDirection: "row",
              width: 250,
            }}
            container={{
              marginRight: 15,
            }}
          >
            {item.poster_path?.length > 0 && (
              <Thumbnail
                container={{
                  width: 70,
                  height: 100,
                  borderRadius: 5,
                }}
                path={item.poster_path}
              />
            )}

            <View style={{ flex: 1, alignItems: "flex-start", padding: 10, paddingRight: 20, justifyContent: "space-between" }}>
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
              </View>

              {item.vote_average > 0 && (
                <View style={{ flex: 1, justifyContent: "space-between", flexDirection: "row" }}>
                  <RatingIcons vote={item.vote_average} size={15} />
                </View>
              )}
            </View>
          </FrostedGlass>
        )}
      />
    </View>
  );
};
export default Seasons;
