import { Platform, View } from "react-native";
import { Text } from "react-native-paper";
import Animated, { FadeIn } from "react-native-reanimated";
import { Movie } from "../../../types";
import useTranslation from "../../service/useTranslation";
import CustomFavourite from "../Favourite";
import FrostedGlass from "../FrostedGlass";
import QuickActions from "../QuickActions";
import RatingIcons from "../RatingIcons";
import Similar from "../Similar";
import Cast from "./Cast";
import Seasons from "./SeasonsList";
import WatchProviders from "./WatchProviders";
import PlatformBlurView, { BlurViewWrapper } from "../PlatformBlurView";

export default function MovieDetails({
  movie,
  providers,
  width,
  type,
}: {
  movie: Movie & Record<string, string>;
  providers: any;
  width: number;
  type: string;
}) {
  const t = useTranslation();

  const data = [
    // `${movie?.vote_average?.toFixed(2)}/10`,
    movie?.release_date || movie?.first_air_date,
    (movie?.title || movie?.name) === (movie?.original_title || movie?.original_name)
      ? null
      : movie?.original_title || movie?.original_name,
    ...(movie?.genres || [])?.map((g: any) => g.name),
  ].filter((v) => v !== undefined && v !== "" && v !== null) as string[];

  return (
    <Animated.View style={{ flex: 1 }} entering={FadeIn}>
      <BlurViewWrapper
        style={{
          borderTopRightRadius: 20,
          borderTopLeftRadius: 20,
          ...Platform.select({
            android: {
              backgroundColor: "rgba(0,0,0,0.5)",
            },
          }),
        }}
      >
        <View style={{ flex: 1, padding: 15 }}>
          <Text
            style={{
              fontSize: 50,
              fontFamily: "Bebas",
              lineHeight: 55,
              marginTop: 10,
            }}
          >
            {movie?.title || movie?.name}
          </Text>

          {movie?.tagline && (
            <Text
              style={{
                fontSize: 15,
                color: "rgba(255,255,255,0.95)",
                marginBottom: 10,
              }}
            >
              {movie?.tagline ? `"${movie?.tagline}"` : ""}
            </Text>
          )}

          <View style={{ flexDirection: "row", marginBottom: 10 }}>
            <RatingIcons size={20} vote={movie?.vote_average} />
          </View>

          <Text style={{ color: "rgba(255,255,255,0.7)", fontSize: 15 }}>{data.join(" | ")}</Text>

          <View style={{ paddingVertical: 15 }}>
            <FrostedGlass style={{ paddingVertical: 20, paddingLeft: 5 }}>
              <QuickActions movie={movie}>
                <View style={{ flex: 1 }}>
                  <CustomFavourite movie={movie} />
                </View>
              </QuickActions>
            </FrostedGlass>
          </View>

          {movie?.overview && (
            <Text
              style={{
                fontSize: 19,
                color: "rgba(255,255,255,0.95)",
              }}
            >
              {movie?.overview}
            </Text>
          )}

          <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 10 }}>
            {!!movie?.runtime && (
              <Text style={{ fontSize: 15, color: "rgba(255,255,255,0.6)" }}>
                {t("movie.details.runtime")}: {movie?.runtime} {t("movie.details.minutes")}
              </Text>
            )}

            <Text style={{ fontSize: 15, color: "rgba(255,255,255,0.6)" }}>
              {t("movie.details.status")}: {movie?.status}
            </Text>
          </View>

          <WatchProviders providers={providers || []} />

          <Cast id={movie?.id} type={type as "movie" | "tv"} />

          {type === "tv" && <Seasons id={movie?.id} seasons={(movie?.seasons as any) || []} />}

          <Similar id={movie?.id} type={type as "movie" | "tv"} />

          <View style={{ padding: 20, justifyContent: "center", height: 100 }}>
            <Text style={{ color: "gray", textAlign: "center" }}>{t("global.attributions")}</Text>
          </View>
        </View>
      </BlurViewWrapper>
    </Animated.View>
  );
}
