import { useState } from "react";
import Text from "../Text";
import { ActivityIndicator, Dimensions, Pressable, View } from "react-native";

import Animated, { FadeIn, LinearTransition } from "react-native-reanimated";
import { Episode } from "../../../types";
import { useGetSeasonEpisodesQuery } from "../../redux/movie/movieApi";
import useTranslation from "../../service/useTranslation";
import FrostedGlass from "../FrostedGlass";
import RatingIcons from "../RatingIcons";
import Thumbnail from "../Thumbnail";
import { colors, fontSize, radius, spacing, typography} from "../../constants/design";

export default function SeasonEpisodes({ id, season }: { id: number; season: number }) {
  const { data, isLoading } = useGetSeasonEpisodesQuery({ id, season }, { refetchOnMountOrArgChange: true });

  const [showAll, setShowAll] = useState<boolean>(false);

  const t = useTranslation();

  if (isLoading) {
    return (
      <View style={{ marginTop: spacing.xxl + 6, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color={colors.text} />
      </View>
    );
  }

  if (!data || !data?.episodes || data?.episodes?.length === 0) return null;

  return (
    <Animated.View style={{ marginTop: spacing.xxl + 6, paddingBottom: spacing.xxl + 6 }} layout={LinearTransition}>
      <Text style={{ fontSize: typography.bebasSize.section, fontFamily: "Bebas", color: colors.text, marginBottom: spacing.sm + 2 }}>
        {t("movie.details.season")} {season}{" "}
        <Text style={{ fontSize: fontSize.xxl, fontFamily: "Bebas" }}>{data?.episodes.length ? `(${data?.episodes.length})` : ""}</Text>
      </Text>
      {data?.episodes.slice(0, showAll ? data?.episodes.length : 5).map((item: Episode, index) => (
        <Animated.View key={item.id} entering={FadeIn.delay(index * 50)} style={{ marginBottom: spacing.screen }}>
          <FrostedGlass
            style={{ flex: 0 }}
            container={{
              width: Dimensions.get("screen").width - 30,
              borderRadius: radius.modal,
            }}
          >
            <View style={{ padding: spacing.screen }}>
              <View style={{ flexDirection: "row", gap: spacing.sm + 2 }}>
                <Thumbnail
                  path={item.still_path || item.still_path}
                  style={{
                    height: 100,
                    width: 125,
                    borderRadius: radius.sm + 2,
                  }}
                  container={{
                    backgroundColor: "transparent",
                  }}
                  size={300}
                />
                <View style={{ flex: 1, justifyContent: "center", gap: spacing.xs - 1 }}>
                  <Text style={{ fontFamily: "Bebas", fontSize: fontSize.xxl }}>{item.name || item.episode_type}</Text>
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <RatingIcons size={13} vote={item.vote_average} />
                    <Text style={{ fontSize: fontSize.sm, marginLeft: spacing.sm + 2 }}>{item.vote_average.toFixed(2)}</Text>
                  </View>
                  <Text style={{ color: "gray" }}>{item.runtime} min</Text>
                </View>
              </View>
              {item.overview && <Text style={{ marginTop: spacing.sm + 2, color: "rgba(255,255,255,0.9)" }}>{item.overview}</Text>}
            </View>
          </FrostedGlass>
        </Animated.View>
      ))}
      {(data?.episodes.length || 0) > 5 && (
        <View style={{ alignItems: "center", marginTop: spacing.sm + 2, marginBottom: spacing.xl }}>
          <Pressable onPress={() => setShowAll((p) => !p)}>
            <Text>{showAll ? t("movie.details.show_less") : `${t("movie.details.show_more")}`}</Text>
          </Pressable>
        </View>
      )}
    </Animated.View>
  );
}
