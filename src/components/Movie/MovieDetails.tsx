import { MD2DarkTheme, Text } from "react-native-paper";
import Animated, { FadeInDown, FadeOutDown } from "react-native-reanimated";
import WatchProviders from "./WatchProviders";
import LastEpisodeToAir from "./LastEpisodeDetails";
import Seasons from "./SeasonsList";
import { ScrollView, View } from "react-native";

import { BlurView } from "expo-blur";
import Similar from "../Similar";
import MovieReviews from "../MovieReviews";

const AnimatedBlurView = Animated.createAnimatedComponent(BlurView);

export default function MovieDetails({ movie, providers, width, type }: { movie: any; providers: any; width: number; type: string }) {
  return (
    <AnimatedBlurView
      entering={FadeInDown}
      intensity={30}
      tint="dark"
      style={{
        padding: 20,
        backgroundColor: "rgba(0,0,0,0.5)", // Adjust opacity for glass effect
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

      <Text style={{ color: "rgba(255,255,255,0.8)", marginBottom: 10 }}>
        {movie?.release_date || movie?.first_air_date} |{" "}
        {(movie?.title || movie?.name) === (movie?.original_title || movie?.original_name)
          ? ""
          : movie?.original_title || movie?.original_name}{" "}
        |{" "}
        {(movie?.genres as { id: number; name: string }[])
          .map((d) => d.name)
          .filter((c) => c !== "Unknown")
          ?.join(" | ")}
      </Text>

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

      <Text
        style={{
          fontSize: 19,
          marginTop: 5,
          color: "rgba(255,255,255,0.95)",
        }}
      >
        {movie?.overview}
      </Text>

      {movie?.runtime && (
        <Text style={{ fontSize: 16, marginTop: 10, color: "rgba(255,255,255,0.6)" }}>Runtime: {movie?.runtime} minutes</Text>
      )}

      <Text style={{ fontSize: 16, marginTop: 10, color: "rgba(255,255,255,0.6)" }}>Status: {movie?.status}</Text>

      <WatchProviders providers={providers || []} />

      <LastEpisodeToAir lastEpisode={movie?.last_episode_to_air || {}} />

      <Seasons seasons={movie?.seasons || []} />

      {/* <MovieReviews movieId={movie?.id} type={type as "movie" | "tv"} /> */}

      <Similar id={movie?.id} type={type as "movie" | "tv"} />

      <View style={{ padding: 20, justifyContent: "center", height: 100 }}>
        <Text style={{ color: "gray", textAlign: "center" }}>Movies povered by The Movie Database API And JustWatch</Text>
      </View>
    </AnimatedBlurView>
  );
}
