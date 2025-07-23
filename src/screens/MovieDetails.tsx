import * as Haptics from "expo-haptics";
import { useCallback, useMemo } from "react";
import { Dimensions, Platform, View } from "react-native";
import { TouchableRipple } from "react-native-paper";
import Animated, { interpolate, useAnimatedScrollHandler, useAnimatedStyle, useSharedValue } from "react-native-reanimated";
import Entypo from "react-native-vector-icons/Entypo";
import FrostedGlass from "../components/FrostedGlass";
import MovieDetails from "../components/Movie/MovieDetails";
import MovieDetailsSkeleton from "../components/Movie/MovieDetailsSkeleton";
import Trailers from "../components/Movie/Trailers";
import Thumbnail, { ThumbnailSizes } from "../components/Thumbnail";
import { useGetMovieProvidersQuery, useGetMovieQuery } from "../redux/movie/movieApi";
import { ScreenProps } from "./types";

const { width, height } = Dimensions.get("window");

export default function MovieDetailsScreen({ route, navigation }: ScreenProps<"MovieDetails">) {
  const scrollOffset = useSharedValue(0);

  const IMG_HEIGHT = useMemo(() => height * 0.75, [height]);
  const typeOfContent = useMemo(() => route?.params?.type, [route?.params?.type]);
  const movieId = useMemo(() => route.params.id, [route.params.id]);
  const posterPath = useMemo(() => route.params.img, [route.params.img]);

  const scrollhandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollOffset.value = event.contentOffset.y;
    },
  });

  const handleBack = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.pop();
  }, [navigation]);

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

  const { data: movie = {}, isLoading: loading } = useGetMovieQuery({
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
        }}
        removeClippedSubviews={true}
        style={{ flex: 1 }}
      >
        <Animated.View style={imageStyle}>
          <Thumbnail
            size={ThumbnailSizes.poster.xxlarge}
            container={[
              {
                height: IMG_HEIGHT,
                width: width,
              },
            ]}
            path={posterPath || (movie?.poster_path as any)}
          />
        </Animated.View>

        {loading ? (
          <MovieDetailsSkeleton />
        ) : (
          <MovieDetails type={typeOfContent} movie={movie as any} providers={providers} width={width} />
        )}
      </Animated.ScrollView>

      <Trailers id={movieId} type={typeOfContent} />

      <View
        style={{
          position: "absolute",
          zIndex: 100,
          left: 5,
          top: 5,
        }}
      >
        <FrostedGlass container={{ borderRadius: 250 }}>
          <TouchableRipple style={{ padding: 10 }} onPress={handleBack}>
            <Entypo name="chevron-left" size={28} color={"#fff"} />
          </TouchableRipple>
        </FrostedGlass>
      </View>
    </View>
  );
}
