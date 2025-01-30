import { MD2DarkTheme, Text } from "react-native-paper";
import Animated from "react-native-reanimated";
import WatchProviders from "./WatchProviders";
import LastEpisodeToAir from "./LastEpisodeDetails";
import Seasons from "./SeasonsList";
import { ScrollView, View } from "react-native";

import { BlurView } from "expo-blur";
import Similar from "../Similar";

export default function MovieDetails({ movie, providers, width, type }: { movie: any; providers: any; width: number; type: string }) {
  return (
    <Animated.View
      style={[
        {
          width,
          borderTopEndRadius: 25,
          borderTopStartRadius: 25,

          overflow: "hidden",
        },
      ]}
    >
      <BlurView
        intensity={20}
        tint="dark"
        style={{
          padding: 20,
          backgroundColor: "rgba(0,0,0,0.5)", // Adjust opacity for glass effect
        }}
      >
        <Text
          numberOfLines={2}
          style={{
            fontSize: 55,
            fontFamily: "Bebas",
          }}
        >
          {movie?.title || movie?.name}
        </Text>

        {movie?.tagline && (
          <Text
            style={{
              fontSize: 16,
              color: "rgba(255,255,255,0.9)",
              marginTop: 5,
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

        <ScrollView showsHorizontalScrollIndicator={false} horizontal style={{ flexDirection: "row", marginVertical: 15 }}>
          {movie?.genres?.map((genre: any) => (
            <View
              key={genre.name}
              style={{
                backgroundColor: MD2DarkTheme.colors.primary,
                borderRadius: 100,
                padding: 5,
                paddingHorizontal: 15,
                marginRight: 15,
              }}
            >
              <Text style={{ fontSize: 16, color: "#000" }}>{genre.name}</Text>
            </View>
          ))}
        </ScrollView>

        <WatchProviders providers={providers || []} />

        <LastEpisodeToAir lastEpisode={movie?.last_episode_to_air || {}} />

        <Seasons seasons={movie?.seasons || []} />

        <Text style={{ fontSize: 16, marginTop: 5, color: "rgba(255,255,255,0.6)" }}>
          {movie?.release_date || movie?.last_episode_to_air?.air_date}
        </Text>

        <Text style={{ fontSize: 16, marginTop: 10, color: "rgba(255,255,255,0.6)" }}>
          Rating: {movie?.vote_average} out of {movie?.vote_count} votes
        </Text>

        <Text style={{ fontSize: 16, marginTop: 10, color: "rgba(255,255,255,0.6)" }}>Runtime: {movie?.runtime} minutes</Text>

        <Text style={{ fontSize: 16, marginTop: 10, color: "rgba(255,255,255,0.6)" }}>Status: {movie?.status}</Text>

        <Text style={{ fontSize: 16, marginTop: 10, color: "rgba(255,255,255,0.6)" }}>Original Language: {movie?.original_language}</Text>

        <Similar id={movie?.id} type={type as "movie" | "tv"} />

        <View style={{ padding: 20, justifyContent: "center", height: 100 }}>
          <Text style={{ color: "gray", textAlign: "center" }}>Movies povered by The Movie Database API</Text>
        </View>
      </BlurView>
    </Animated.View>
  );
}
