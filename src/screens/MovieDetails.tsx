import { Platform, useWindowDimensions, View } from "react-native";
import { MovieDetails as MovieDetailsType } from "../../types";
import Animated, { interpolate, useAnimatedScrollHandler, useAnimatedStyle, useSharedValue } from "react-native-reanimated";
import { ScreenProps } from "./types";
import MovieDetailsSkeleton from "../components/Movie/MovieDetailsSkeleton";
import MovieDetails from "../components/Movie/MovieDetails";
import { useGetMovieProvidersQuery, useGetMovieQuery } from "../redux/movie/movieApi";
import { Appbar, IconButton } from "react-native-paper";
import Favourite from "../components/Favourite";

export default function MovieDetailsScreen({ route, navigation }: ScreenProps<"MovieDetails">) {
  const { width, height } = useWindowDimensions();

  const scrollOffset = useSharedValue(0);
  const scrollhandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollOffset.value = event.contentOffset.y;
    },
  });

  const IMG_HEIGHT = height * 0.75;

  const imageStyle = useAnimatedStyle(() => {
    return Platform.OS === "ios"
      ? {
          transform: [
            {
              translateY: interpolate(scrollOffset.value, [-IMG_HEIGHT, 0, IMG_HEIGHT], [-IMG_HEIGHT / 2, 0, IMG_HEIGHT * 0.75]),
            },
            {
              scale: interpolate(scrollOffset.value, [-IMG_HEIGHT, 0, IMG_HEIGHT], [2, 1, 1]),
            },
          ],
        }
      : {
          transform: [{ translateY: interpolate(scrollOffset.value, [-IMG_HEIGHT, 0, IMG_HEIGHT], [-IMG_HEIGHT / 3, 0, IMG_HEIGHT / 3]) }],
        };
  });

  const typeOfContent = route?.params?.type;

  const { data: movie = {} as MovieDetailsType, isLoading: loading } = useGetMovieQuery({
    id: route.params.id,
    type: typeOfContent,
  });

  const { data: providers = [], refetch } = useGetMovieProvidersQuery({
    id: route.params.id,
    type: typeOfContent,
  });

  return (
    <Animated.ScrollView
      scrollEventThrottle={16}
      onScroll={scrollhandler}
      contentContainerStyle={{ alignItems: "center", position: "relative" }}
      style={{ flex: 1, height }}
    >
      <View style={{ position: "absolute", top: 10, left: 10, zIndex: 100 }}>
        <IconButton icon="chevron-left" onPress={() => navigation.goBack()} size={28} />
      </View>

      <Animated.Image
        resizeMethod={"resize"}
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
      {loading ? <MovieDetailsSkeleton /> : <MovieDetails type={typeOfContent} movie={movie} providers={providers} width={width} />}
    </Animated.ScrollView>
  );
}
