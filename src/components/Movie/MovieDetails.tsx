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
          fontSize: 35,
          fontWeight: "bold",
          marginTop: 10,
        }}
      >
        {movie.title || movie.name}
      </Text>

      {movie.tagline && (
        <Text style={{ fontSize: 18, color: theme.colors.primary }}>
          {movie.tagline}
        </Text>
      )}

      <FlatList
        style={{ marginTop: 10 }}
        data={movie.genres}
        horizontal
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <Text
            style={{
              fontSize: 15,
              backgroundColor: theme.colors.primary,
              borderRadius: 100,
              padding: 2.5,
              paddingHorizontal: 10,
              marginRight: 5,
            }}
          >
            {item.name}
          </Text>
        )}
      />

      <Text style={{ fontSize: 20, marginTop: 10 }}>{movie.overview}</Text>

      <WatchProviders providers={providers || []} />

      <LastEpisodeToAir lastEpisode={movie?.last_episode_to_air || {}} />

      <Seasons seasons={movie?.seasons || []} />

      <Text style={{ fontSize: 20, marginTop: 5, color: theme.colors.primary }}>
        {movie.release_date || movie?.last_episode_to_air?.air_date}
      </Text>

      <Text style={{ fontSize: 20, marginTop: 10 }}>
        Rating: {movie.vote_average} out of {movie.vote_count} votes
      </Text>

      <Text style={{ fontSize: 20, marginTop: 10 }}>
        Runtime: {movie.runtime} minutes
      </Text>

      <Text style={{ fontSize: 20, marginTop: 10 }}>
        Budget: {movie.budget} USD
      </Text>

      <Text style={{ fontSize: 20, marginTop: 10 }}>
        Revenue: {movie.revenue} USD
      </Text>

      <Text style={{ fontSize: 20, marginTop: 10 }}>
        Popularity: {movie.popularity}
      </Text>

      <Text style={{ fontSize: 20, marginTop: 10 }}>
        Status: {movie.status}
      </Text>

      <Text style={{ fontSize: 20, marginTop: 10 }}>
        Original Language: {movie.original_language}
      </Text>
    </Animated.View>
  );
}
