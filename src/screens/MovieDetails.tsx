import { useWindowDimensions } from "react-native";
import { MovieDetails as MovieDetailsType } from "../../types";
import Animated, { interpolate, useAnimatedScrollHandler, useAnimatedStyle, useSharedValue } from "react-native-reanimated";
import { ScreenProps } from "./types";
import { useAppSelector } from "../redux/store";
import MovieDetailsSkeleton from "../components/Movie/MovieDetailsSkeleton";
import MovieDetails from "../components/Movie/MovieDetails";
import { useGetMovieProvidersQuery, useGetMovieQuery } from "../redux/movie/movieApi";
import { sharedElementTransition } from "../service/utils/SharedElementTransition";

export default function MovieDetailsScreen({ route }: ScreenProps<"MovieDetails">) {
  const { width, height } = useWindowDimensions();
  const {
    room: { type },
  } = useAppSelector((state) => state.room);

  const scrollOffset = useSharedValue(0);
  const scrollhandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollOffset.value = event.contentOffset.y;
    },
  });

  const IMG_HEIGHT = height * 0.75;

  const imageStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateY: interpolate(scrollOffset.value, [-IMG_HEIGHT, 0, IMG_HEIGHT], [-IMG_HEIGHT / 2, 0, IMG_HEIGHT * 0.75]),
        },
        {
          scale: interpolate(scrollOffset.value, [-IMG_HEIGHT, 0, IMG_HEIGHT], [2, 1, 1]),
        },
      ],
    };
  });

  const { data: movie = {} as MovieDetailsType, isLoading: loading } = useGetMovieQuery({
    id: route.params.id,
    type: type,
  });

  const { data: providers = [] } = useGetMovieProvidersQuery({
    id: route.params.id,
    type: type,
  });

  return (
    <Animated.ScrollView
      scrollEventThrottle={16}
      onScroll={scrollhandler}
      contentContainerStyle={{ alignItems: "center", position: "relative" }}
      style={{ flex: 1, height }}
    >
      <Animated.Image
        //sharedTransitionStyle={sharedElementTransition}
        // sharedTransitionTag={`movie-poster-image-${route.params.img}`}
        style={[
          {
            height: IMG_HEIGHT,
            width: width,
          },
          imageStyle,
        ]}
        resizeMode="cover"
        source={{
          uri: "https://image.tmdb.org/t/p/w500" + route.params.img || movie?.poster_path,
        }}
      />
      {loading ? <MovieDetailsSkeleton /> : <MovieDetails movie={movie} providers={providers} width={width} />}
    </Animated.ScrollView>
  );
}
