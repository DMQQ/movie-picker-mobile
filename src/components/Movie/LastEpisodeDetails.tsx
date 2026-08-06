import { Image, View } from "react-native";
import { Surface, Text } from "react-native-paper";
import useTranslation from "../../service/useTranslation";
import Thumbnail from "../Thumbnail";
import FrostedGlass from "../FrostedGlass";
import { fontSize, radius, spacing, typography } from "../../constants/design";

const LastEpisodeToAir = ({ lastEpisode }: { lastEpisode: any }) => {
  const t = useTranslation();
  if (lastEpisode === undefined || lastEpisode === null || lastEpisode?.name === undefined || !lastEpisode?.still_path) return null;

  return (
    <>
      <Text style={{ fontSize: typography.bebasSize.section, fontFamily: "Bebas", lineHeight: 35, marginTop: spacing.xxl + 6, marginBottom: spacing.sm + 2 }}>
        {t("movie.details.lastEpisode")}
      </Text>

      <FrostedGlass>
        <View style={{ borderRadius: radius.modal, padding: spacing.screen }}>
          <Thumbnail
            container={{
              width: "100%",
              height: 220,
              borderRadius: radius.sm + 2,
              overflow: "hidden",
            }}
            size={500}
            path={lastEpisode.still_path}
          />

          <View style={{ paddingHorizontal: spacing.sm + 2, paddingBottom: spacing.xs + 1, marginTop: spacing.screen }}>
            <Text
              style={{
                fontSize: 25,
                fontFamily: "Bebas",
              }}
            >
              {lastEpisode.name}
            </Text>

            <Text style={{ color: "rgba(255,255,255,0.9)", marginTop: spacing.xs + 1, fontSize: fontSize.md + 1 }}>{lastEpisode.overview}</Text>

            <Text style={{ color: "#9E9E9E", marginTop: spacing.xs + 3.5 }}>
              {t("movie.details.episode")} {lastEpisode.episode_number} {t("movie.details.season")} {lastEpisode.season_number}
            </Text>
          </View>
        </View>
      </FrostedGlass>
    </>
  );
};

export default LastEpisodeToAir;
