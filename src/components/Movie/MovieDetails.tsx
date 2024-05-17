import { FlatList } from "react-native";
import { Text, useTheme } from "react-native-paper";
import Animated from "react-native-reanimated";
import WatchProviders from "./WatchProviders";
import LastEpisodeToAir from "./LastEpisodeDetails";
import Seasons from "./SeasonsList";

export default function MovieDetails({
  movie,
  providers,
  width,
}: {
  movie: any;
  providers: any;
  width: number;
}) {
  const theme = useTheme();

  return (
    <Animated.View
      style={[
        {
          width,
          backgroundColor: "#000",
          borderTopEndRadius: 25,
          borderTopStartRadius: 25,
          padding: 20,
        },
      ]}
    >
      <Text
        style={{
          fontSize: 30,
          fontWeight: "bold",
        }}
      >
        {movie.title || movie.name}
      </Text>

      {movie.tagline && (
        <Text
          style={{
            fontSize: 16,
            color: "rgba(255,255,255,0.7)",
            marginTop: 5,
          }}
        >
          {movie.tagline}
        </Text>
      )}

      <Text
        style={{
          fontSize: 17.5,
          marginTop: 5,
          color: "rgba(255,255,255,0.9)",
        }}
      >
        {movie.overview}
      </Text>

      <Text
        style={{
          color: "rgba(255,255,255,0.65)",
          fontSize: 17,
          marginVertical: 10,
        }}
      >
        {movie.genres.map((genre: any) => genre.name).join(", ")}
      </Text>

      <WatchProviders providers={providers || []} />

      <LastEpisodeToAir lastEpisode={movie?.last_episode_to_air || {}} />

      <Seasons seasons={movie?.seasons || []} />

      <Text
        style={{ fontSize: 16, marginTop: 5, color: "rgba(255,255,255,0.6)" }}
      >
        {movie.release_date || movie?.last_episode_to_air?.air_date}
      </Text>

      <Text
        style={{ fontSize: 16, marginTop: 10, color: "rgba(255,255,255,0.6)" }}
      >
        Rating: {movie.vote_average} out of {movie.vote_count} votes
      </Text>

      <Text
        style={{ fontSize: 16, marginTop: 10, color: "rgba(255,255,255,0.6)" }}
      >
        Runtime: {movie.runtime} minutes
      </Text>

      <Text
        style={{ fontSize: 16, marginTop: 10, color: "rgba(255,255,255,0.6)" }}
      >
        Status: {movie.status}
      </Text>

      <Text
        style={{ fontSize: 16, marginTop: 10, color: "rgba(255,255,255,0.6)" }}
      >
        Original Language: {movie.original_language}
      </Text>
    </Animated.View>
  );
}
