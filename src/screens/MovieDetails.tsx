import {
  FlatList,
  Image,
  ScrollView,
  View,
  useWindowDimensions,
} from "react-native";
import { useEffect, useMemo } from "react";
import { Movie } from "../../types";
import {
  ActivityIndicator,
  Provider,
  Surface,
  Text,
  useTheme,
} from "react-native-paper";
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

  const IMG_HEIGHT = height * 0.75;

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
  const { data: providers } = useFetch(
    "/movie/providers/" + route.params.id + "?type=" + type
  );

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

const Seasons = ({ seasons }: { seasons: any[] }) => {
  if (seasons?.length === 0 || seasons === undefined) return null;
  return (
    <View style={{ marginTop: 10 }}>
      <Text style={{ fontSize: 20, marginTop: 10 }}>
        Seasons {seasons.length}
      </Text>
      <FlatList
        horizontal
        data={seasons}
        style={{ marginTop: 10, height: 60 + 20 }}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <Surface
            style={{
              padding: 7.5,
              borderRadius: 12.5,
              marginRight: 15,
              flexDirection: "row",
              gap: 10,
              height: 60 + 7.5 * 2,
            }}
          >
            {item.poster_path?.length > 0 && (
              <Image
                style={{
                  width: 60,
                  height: 60,
                  borderRadius: 10,
                }}
                resizeMode="cover"
                source={{
                  uri: "https://image.tmdb.org/t/p/w500" + item.poster_path,
                }}
              />
            )}

            <View>
              <Text style={{ fontSize: 15, textTransform: "uppercase" }}>
                {item.name}
              </Text>
              <Text style={{ color: "#9E9E9E", marginTop: 5 }}>
                Episodes ({item.episode_count})
              </Text>
            </View>
          </Surface>
        )}
      />
    </View>
  );
};

const WatchProviders = ({ providers }: { providers: any }) => {
  const providersList = useMemo(() => {
    let list = new Set();

    for (let key in providers) {
      for (let provider of providers[key]) {
        if (provider.logo_path !== undefined) list.add(provider.logo_path);
      }
    }

    return [...list];
  }, [providers]);

  if (providersList.length === 0) return null;

  return (
    <View style={{ marginTop: 10 }}>
      <Text style={{ fontSize: 20 }}>Watch Providers {providers.length}</Text>

      <ScrollView horizontal>
        <Surface
          style={{
            padding: 7.5,
            borderRadius: 12.5,
            marginTop: 10,
            width: providersList.length * (40 + 12),
            flexDirection: "row",
          }}
        >
          {providersList.map((provider) => (
            <Image
              key={provider as string}
              style={{
                width: 40,
                height: 40,
                borderRadius: 5,
                marginRight: 10,
              }}
              resizeMode="cover"
              source={{
                uri: "https://image.tmdb.org/t/p/w500" + provider,
              }}
            />
          ))}
        </Surface>
      </ScrollView>
    </View>
  );
};

const LastEpisodeToAir = ({ lastEpisode }: { lastEpisode: any }) => {
  if (
    lastEpisode === undefined ||
    lastEpisode === null ||
    lastEpisode?.name === undefined
  )
    return null;

  return (
    <View style={{ marginTop: 10 }}>
      <Text style={{ fontSize: 20 }}>Last Episode To Air</Text>
      <Surface style={{ padding: 7.5, borderRadius: 12.5, marginTop: 10 }}>
        <Image
          style={{
            width: "100%",
            height: 150,
            borderRadius: 10,
          }}
          resizeMode="cover"
          source={{
            uri: "https://image.tmdb.org/t/p/w500" + lastEpisode.still_path,
          }}
        />
        <View style={{ paddingVertical: 5 }}>
          <Text
            style={{
              fontSize: 15,
              textTransform: "uppercase",
            }}
          >
            {lastEpisode.name}
            {"  "}
            <Text style={{ color: "gray" }}>{lastEpisode.air_date}</Text>
          </Text>

          <Text style={{ color: "#9E9E9E", marginTop: 5 }}>
            Episode {lastEpisode.episode_number} Season{" "}
            {lastEpisode.season_number}
          </Text>

          <Text style={{ color: "#9E9E9E", marginTop: 5 }}>
            {lastEpisode.overview}
          </Text>
        </View>
      </Surface>
    </View>
  );
};
