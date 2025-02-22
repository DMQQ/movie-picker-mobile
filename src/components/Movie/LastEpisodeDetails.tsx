import { Image, View } from "react-native";
import { Surface, Text } from "react-native-paper";
import useTranslation from "../../service/useTranslation";
import Thumbnail from "../Thumbnail";

const LastEpisodeToAir = ({ lastEpisode }: { lastEpisode: any }) => {
  const t = useTranslation();
  if (lastEpisode === undefined || lastEpisode === null || lastEpisode?.name === undefined || !lastEpisode?.still_path) return null;

  return (
    <View style={{ marginTop: 30 }}>
      <Text style={{ fontSize: 35, fontFamily: "Bebas", lineHeight: 35 }}>{t("movie.details.lastEpisode")}</Text>
      <View style={{ borderRadius: 10, marginTop: 10 }}>
        <View style={{ borderRadius: 15, overflow: "hidden" }}>
          <Thumbnail
            container={{
              width: "100%",
              height: 220,
              borderRadius: 15,
              overflow: "hidden",
            }}
            contentFit="cover"
            size={500}
            path={lastEpisode.still_path}
          />
        </View>
        <View>
          <Text
            style={{
              fontSize: 25,
              fontFamily: "Bebas",
              marginTop: 10,
            }}
          >
            {lastEpisode.name}
          </Text>

          <Text style={{ color: "rgba(255,255,255,0.9)", marginTop: 5, fontSize: 15 }}>{lastEpisode.overview}</Text>

          <Text style={{ color: "#9E9E9E", marginTop: 7.5 }}>
            {t("movie.details.episode")} {lastEpisode.episode_number} {t("movie.details.season")} {lastEpisode.season_number}
          </Text>
        </View>
      </View>
    </View>
  );
};

export default LastEpisodeToAir;
