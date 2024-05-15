import { useWindowDimensions } from "react-native";
import { useEffect } from "react";
import { Movie, MovieDetails as MovieDetailsType } from "../../types";
import { useTheme } from "react-native-paper";
import Animated, {
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";
import { Props } from "./types";
import { useAppSelector } from "../redux/store";
import useFetch from "../service/useFetch";
import MovieDetailsSkeleton from "../components/Movie/MovieDetailsSkeleton";
import MovieDetails from "../components/Movie/MovieDetails";

export default function MovieDetailsScreen({
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

  const { data: movie, loading } = useFetch<MovieDetailsType>(
    `/movie/${route.params.id}?type=${type}`
  );

  const { data: providers } = useFetch(
    "/movie/providers/" + route.params.id + "?type=" + type
  );

  return (
    <Animated.ScrollView
      scrollEventThrottle={16}
      onScroll={scrollhandler}
      contentContainerStyle={{ alignItems: "center", position: "relative" }}
      style={{ flex: 1, height }}
    >
      <Animated.Image
        // sharedTransitionStyle={sharedElementTransition}
        // sharedTransitionTag={"movie-poster-image-" + route.params.img}
        style={[
          {
            height: IMG_HEIGHT,
            width: width,
          },
          imageStyle,
        ]}
        resizeMode="cover"
        source={{
          uri:
            "https://image.tmdb.org/t/p/w500" + route.params.img ||
            movie?.poster_path,
        }}
      />
      {loading ? (
        <MovieDetailsSkeleton />
      ) : (
        <MovieDetails movie={movie} providers={providers} width={width} />
      )}
    </Animated.ScrollView>
  );
}
