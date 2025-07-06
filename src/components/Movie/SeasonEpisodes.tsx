import { ActivityIndicator, Dimensions, FlatList, Pressable, View } from "react-native";
import { useGetSeasonEpisodesQuery } from "../../redux/movie/movieApi";
import { Episode } from "../../../types";
import FrostedGlass from "../FrostedGlass";
import { Text } from "react-native-paper";
import Thumbnail from "../Thumbnail";
import RatingIcons from "../RatingIcons";
import { useState } from "react";
import Animated, { FadeIn } from "react-native-reanimated";
import useTranslation from "../../service/useTranslation";
import { getConstrainedDimensions } from "../../utils/getConstrainedDimensions";

export default function SeasonEpisodes({ id, season }: { id: number; season: number }) {
  const { data, isLoading } = useGetSeasonEpisodesQuery({ id, season }, { refetchOnMountOrArgChange: true });

  const [showAll, setShowAll] = useState<boolean>(false);

  const t = useTranslation();

  if (isLoading) {
    return (
      <View style={{ marginTop: 30, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  if (!data || !data?.episodes || data?.episodes?.length === 0) return null;

  return (
    <Animated.View style={{ marginTop: 30 }}>
      <Text style={{ fontSize: 35, fontFamily: "Bebas", color: "#fff", marginBottom: 10 }}>
        {t("movie.details.season")} {season}{" "}
        <Text style={{ fontSize: 20, fontFamily: "Bebas" }}>{data?.episodes.length ? `(${data?.episodes.length})` : ""}</Text>
      </Text>
      {data?.episodes.slice(0, showAll ? data?.episodes.length : 5).map((item: Episode, index) => (
        <Animated.View key={item.id} entering={FadeIn.delay(index * 50)}>
          <FrostedGlass
            container={{
              width: getConstrainedDimensions("screen").width - 30,
              marginBottom: 15,
              borderRadius: 20,
            }}
          >
            <View style={{ padding: 15 }}>
              <View style={{ flexDirection: "row", gap: 10 }}>
                <Thumbnail
                  path={item.still_path || item.still_path}
                  style={{
                    height: 75,
                    width: 125,
                    borderRadius: 10,
                  }}
                  container={{
                    backgroundColor: "transparent",
                  }}
                  size={300}
                />
                <View style={{ flex: 1, justifyContent: "center", gap: 3 }}>
                  <Text style={{ fontFamily: "Bebas", fontSize: 20 }}>{item.name || item.episode_type}</Text>
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <RatingIcons size={13} vote={item.vote_average} />
                    <Text style={{ fontSize: 12, marginLeft: 10 }}>{item.vote_average.toFixed(2)}</Text>
                  </View>
                  <Text style={{ color: "gray" }}>{item.runtime} min</Text>
                </View>
              </View>
              {item.overview && <Text style={{ marginTop: 10, color: "rgba(255,255,255,0.9)" }}>{item.overview}</Text>}
            </View>
          </FrostedGlass>
        </Animated.View>
      ))}
      {(data?.episodes.length || 0) > 5 && (
        <View style={{ alignItems: "center", marginTop: 10 }}>
          <Pressable onPress={() => setShowAll((p) => !p)}>
            <Text>{showAll ? t("movie.details.show_less") : `${t("movie.details.show_more")} (${data?.episodes.length})`}</Text>
          </Pressable>
        </View>
      )}
    </Animated.View>
  );
}
