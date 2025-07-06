import { Image, View } from "react-native";
import { Surface, Text } from "react-native-paper";
import useTranslation from "../../service/useTranslation";
import Thumbnail from "../Thumbnail";
import FrostedGlass from "../FrostedGlass";

const LastEpisodeToAir = ({ lastEpisode }: { lastEpisode: any }) => {
  const t = useTranslation();
  if (lastEpisode === undefined || lastEpisode === null || lastEpisode?.name === undefined || !lastEpisode?.still_path) return null;

  return (
    <>
      <Text style={{ fontSize: 35, fontFamily: "Bebas", lineHeight: 35, marginTop: 30, marginBottom: 10 }}>
        {t("movie.details.lastEpisode")}
      </Text>

      <FrostedGlass>
        <View style={{ borderRadius: 20, padding: 15 }}>
          <Thumbnail
            container={{
              width: "100%",
              height: 220,
              borderRadius: 10,
              overflow: "hidden",
            }}
            size={500}
            path={lastEpisode.still_path}
          />

          <View style={{ paddingHorizontal: 10, paddingBottom: 5, marginTop: 15 }}>
            <Text
              style={{
                fontSize: 25,
                fontFamily: "Bebas",
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
      </FrostedGlass>
    </>
  );
};

export default LastEpisodeToAir;
