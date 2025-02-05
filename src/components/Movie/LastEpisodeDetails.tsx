import { Image, View } from "react-native";
import { Surface, Text } from "react-native-paper";
import useTranslation from "../../service/useTranslation";

const LastEpisodeToAir = ({ lastEpisode }: { lastEpisode: any }) => {
  const t = useTranslation();
  if (lastEpisode === undefined || lastEpisode === null || lastEpisode?.name === undefined) return null;

  return (
    <View style={{ marginTop: 15 }}>
      <Text style={{ fontSize: 35, fontFamily: "Bebas", lineHeight: 35 }}>{t("movie.details.lastEpisode")}</Text>
      <View style={{ borderRadius: 10, marginTop: 10 }}>
        <Image
          style={{
            width: "100%",
            height: 220,
            borderRadius: 10,
          }}
          resizeMode="cover"
          source={{
            uri: "https://image.tmdb.org/t/p/w500" + lastEpisode.still_path,
          }}
        />
        <View style={{ marginTop: 15, paddingBottom: 15 }}>
          <Text
            style={{
              fontSize: 30,
              fontFamily: "Bebas",
              lineHeight: 30,
            }}
          >
            {lastEpisode.name}
          </Text>

          <Text style={{ color: "rgba(255,255,255,0.9)", marginTop: 5, fontSize: 18 }}>{lastEpisode.overview}</Text>

          <Text style={{ color: "#9E9E9E", marginTop: 5 }}>
            {t("movie.details.episode")} {lastEpisode.episode_number} {t("movie.details.season")} {lastEpisode.season_number}
          </Text>
        </View>
      </View>
    </View>
  );
};

export default LastEpisodeToAir;
