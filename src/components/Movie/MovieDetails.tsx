import { MD2DarkTheme, Text } from "react-native-paper";
import Animated, { FadeInDown, FadeOutDown } from "react-native-reanimated";
import WatchProviders from "./WatchProviders";
import LastEpisodeToAir from "./LastEpisodeDetails";
import Seasons from "./SeasonsList";
import { ImageBackground, Platform, ScrollView, View } from "react-native";
import { BlurView } from "expo-blur";
import Similar from "../Similar";
import useTranslation from "../../service/useTranslation";
import { Movie } from "../../../types";
import QuickActions from "../QuickActions";
import CustomFavourite from "../Favourite";

const AnimatedBlurView = Animated.createAnimatedComponent(BlurView);

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
    `${movie?.vote_average?.toFixed(2)}/10`,
    movie?.release_date || movie?.first_air_date,
    (movie?.title || movie?.name) === (movie?.original_title || movie?.original_name) ? "" : movie?.original_title || movie?.original_name,
    ...(movie?.genres || [])?.map((g: any) => g.name),
  ].filter((v) => v !== undefined && v !== "") as any;

  return (
    <AnimatedBlurView
      blurReductionFactor={0.25}
      entering={FadeInDown}
      intensity={Platform.OS === "ios" ? 30 : 100}
      tint="dark"
      style={{
        padding: 20,
        backgroundColor: `rgba(0,0,0,${Platform.OS === "ios" ? 0.5 : 0.8})`, // Adjust opacity for glass effect
        width,

        overflow: "hidden",
      }}
    >
      <Text
        numberOfLines={2}
        style={{
          fontSize: 55,
          fontFamily: "Bebas",
          lineHeight: 55,
          marginTop: 15,
        }}
      >
        {movie?.title || movie?.name}
      </Text>

      <Text style={{ color: "rgba(255,255,255,0.8)", marginBottom: 10 }}>{data.join(" | ")}</Text>

      {movie?.tagline && (
        <Text
          style={{
            fontSize: 16,
            color: "rgba(255,255,255,0.9)",
            marginVertical: 5,
          }}
        >
          {movie?.tagline}
        </Text>
      )}

      <View style={{ padding: 10, paddingVertical: 20 }}>
        <QuickActions movie={movie}>
          <CustomFavourite movie={movie} />
        </QuickActions>
      </View>

      {movie?.overview && (
        <Text
          style={{
            fontSize: 19,
            marginTop: 5,
            color: "rgba(255,255,255,0.95)",
          }}
        >
          {movie?.overview}
        </Text>
      )}

      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
        {movie?.runtime && (
          <Text style={{ fontSize: 16, marginTop: 10, color: "rgba(255,255,255,0.6)" }}>
            {t("movie.details.runtime")}: {movie?.runtime} {t("movie.details.minutes")}
          </Text>
        )}

        <Text style={{ fontSize: 16, marginTop: 10, color: "rgba(255,255,255,0.6)" }}>
          {t("movie.details.status")}: {movie?.status}
        </Text>
      </View>

      <WatchProviders providers={providers || []} />

      <LastEpisodeToAir lastEpisode={movie?.last_episode_to_air || {}} />

      <Seasons seasons={(movie?.seasons as any) || []} />

      {/* <MovieReviews movieId={movie?.id} type={type as "movie" | "tv"} /> */}

      <Similar id={movie?.id} type={type as "movie" | "tv"} />

      <View style={{ padding: 20, justifyContent: "center", height: 100 }}>
        <Text style={{ color: "gray", textAlign: "center" }}>{t("global.attributions")}</Text>
      </View>
    </AnimatedBlurView>
  );
}
