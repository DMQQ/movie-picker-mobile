import { View, useWindowDimensions } from "react-native";
import { useEffect, useState } from "react";
import { Movie } from "../../types";
import { ActivityIndicator, Text, useTheme } from "react-native-paper";
import Animated, {
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";
import { Props } from "./types";
import { useAppSelector } from "../redux/store";
import useFetch from "../service/useFetch";

type MovieDetails = Movie & {
  adult: boolean;
  budget: number;
  genres: { id: number; name: string }[];
  homepage: string;
  imdb_id: string;
  original_language: string;
  original_title: string;
  popularity: number;
  production_companies: {
    id: number;
    logo_path: string;
    name: string;
    origin_country: string;
  }[];
  production_countries: { iso_3166_1: string; name: string }[];
  revenue: number;
  runtime: number;

  spoken_languages: { english_name: string; iso_639_1: string }[];
  status: string;
  tagline: string;
  video: boolean;
  vote_count: number;
  backdrop_path: string;
  belongs_to_collection: {
    id: number;
    name: string;
    poster_path: string;
    backdrop_path: string;
  } | null;
};

export default function MovieDetails({
  route,
  navigation,
}: Props<"MovieDetails">) {
  const { width, height } = useWindowDimensions();
  const theme = useTheme();

  const {
    room: { type },
  } = useAppSelector((state) => state.room);

  const scrollOffset = useSharedValue(0);
  const scrollhandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollOffset.value = event.contentOffset.y;
    },
  });

  useEffect(() => {
    navigation.setOptions({
      headerShown: true,
      headerTransparent: true,
      headerTitleAlign: "center",
      headerTitle: "Movie Details",
    });
  }, []);

  const IMG_HEIGHT = height * 0.6;

  const imageStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateY: interpolate(
            scrollOffset.value,
            [-IMG_HEIGHT, 0, IMG_HEIGHT],
            [-IMG_HEIGHT / 2, 0, IMG_HEIGHT * 0.75]
          ),
        },
        {
          scale: interpolate(
            scrollOffset.value,
            [-IMG_HEIGHT, 0, IMG_HEIGHT],
            [2, 1, 1]
          ),
        },
      ],
    };
  });

  const { data: movie } = useFetch(`/movie/${route.params.id}?type=${type}`);

  if (!movie)
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size={50} color={theme.colors.primary} />
      </View>
    );

  return (
    <Animated.ScrollView
      scrollEventThrottle={16}
      onScroll={scrollhandler}
      contentContainerStyle={{ alignItems: "center", position: "relative" }}
      style={{ flex: 1, height }}
    >
      <Animated.Image
        style={[
          {
            height: IMG_HEIGHT,
            width: width,
          },
          imageStyle,
        ]}
        resizeMode="cover"
        source={{
          uri: "https://image.tmdb.org/t/p/w500" + movie.poster_path,
        }}
      />
      <Animated.View
        style={[
          {
            width,
            backgroundColor: theme.colors.surface,
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

        <View style={{ flexDirection: "row", gap: 5, marginTop: 15 }}>
          {movie.genres.map((genre) => (
            <Text
              key={genre.id}
              style={{
                fontSize: 15,
                backgroundColor: theme.colors.primary,
                borderRadius: 100,
                padding: 2.5,
                paddingHorizontal: 7.5,
              }}
            >
              {genre.name}
            </Text>
          ))}
        </View>

        <Text style={{ fontSize: 20, marginTop: 10 }}>{movie.overview}</Text>

        <Text
          style={{ fontSize: 20, marginTop: 5, color: theme.colors.primary }}
        >
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
    </Animated.ScrollView>
  );
}
