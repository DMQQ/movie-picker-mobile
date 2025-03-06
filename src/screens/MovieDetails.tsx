import { Dimensions, Platform, View } from "react-native";
import { MovieDetails as MovieDetailsType } from "../../types";
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  runOnJS,
} from "react-native-reanimated";
import { ScreenProps } from "./types";
import MovieDetailsSkeleton from "../components/Movie/MovieDetailsSkeleton";
import MovieDetails from "../components/Movie/MovieDetails";
import { useGetMovieProvidersQuery, useGetMovieQuery } from "../redux/movie/movieApi";
import { IconButton } from "react-native-paper";
import Thumbnail from "../components/Thumbnail";
import { useCallback, useMemo } from "react";

const { width, height } = Dimensions.get("window");

export default function MovieDetailsScreen({ route, navigation }: ScreenProps<"MovieDetails">) {
  const scrollOffset = useSharedValue(0);

  // Memoize these values to prevent recalculations
  const IMG_HEIGHT = useMemo(() => height * 0.75, [height]);
  const typeOfContent = useMemo(() => route?.params?.type, [route?.params?.type]);
  const movieId = useMemo(() => route.params.id, [route.params.id]);
  const posterPath = useMemo(() => route.params.img, [route.params.img]);

  // Optimize scroll handler to reduce JavaScript bridge calls
  const scrollhandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollOffset.value = event.contentOffset.y;
    },
  });

  // Memoize the navigation callback
  const handleBack = useCallback(() => {
    navigation.pop();
  }, [navigation]);

  // Optimize the animation style calculation
  const imageStyle = useAnimatedStyle(() => {
    if (Platform.OS === "ios") {
      const translateY = interpolate(scrollOffset.value, [-IMG_HEIGHT, 0, IMG_HEIGHT], [-IMG_HEIGHT / 2, 0, IMG_HEIGHT * 0.75]);

      const scale = interpolate(scrollOffset.value, [-IMG_HEIGHT, 0, IMG_HEIGHT], [2, 1, 1]);

      return {
        transform: [{ translateY }, { scale }],
      };
    } else {
      return {
        transform: [
          {
            translateY: interpolate(scrollOffset.value, [-IMG_HEIGHT, 0, IMG_HEIGHT], [-IMG_HEIGHT / 3, 0, IMG_HEIGHT / 3]),
          },
        ],
      };
    }
  });

  // API queries
  const { data: movie = {} as MovieDetailsType, isLoading: loading } = useGetMovieQuery({
    id: movieId,
    type: typeOfContent,
  });

  const { data: providers = [] } = useGetMovieProvidersQuery({
    id: movieId,
    type: typeOfContent,
  });

  return (
    <View style={{ flex: 1, height, width }}>
      <Animated.ScrollView
        scrollEventThrottle={16}
        onScroll={scrollhandler}
        contentContainerStyle={{
          alignItems: "center",
          paddingBottom: 20, // Add padding to prevent content from being cut off
        }}
        removeClippedSubviews={true} // Optimize rendering for off-screen components
        style={{ flex: 1 }}
      >
        <Animated.View style={imageStyle}>
          <Thumbnail
            size={780}
            container={[
              {
                height: IMG_HEIGHT,
                width: width,
              },
            ]}
            path={posterPath || movie?.poster_path}
          />
        </Animated.View>

        {loading ? (
          <MovieDetailsSkeleton />
        ) : (
          <MovieDetails type={typeOfContent} movie={movie as any} providers={providers} width={width} />
        )}
      </Animated.ScrollView>

      {/* Back button in fixed position */}
      <View
        style={{
          position: "absolute",
          zIndex: 100,
        }}
      >
        <IconButton icon="chevron-left" onPress={handleBack} size={28} iconColor="#fff" />
      </View>
    </View>
  );
}
