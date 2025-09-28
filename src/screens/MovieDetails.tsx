import * as Haptics from "expo-haptics";
import { useCallback, useMemo } from "react";
import { Dimensions, Platform, View } from "react-native";
import { IconButton, Text, TouchableRipple } from "react-native-paper";
import Animated, { interpolate, useAnimatedScrollHandler, useAnimatedStyle, useSharedValue } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Entypo from "react-native-vector-icons/Entypo";
import { Movie } from "../../types";
import FrostedGlass from "../components/FrostedGlass";
import MovieDetails from "../components/Movie/MovieDetails";
import MovieDetailsSkeleton from "../components/Movie/MovieDetailsSkeleton";
import Trailers from "../components/Movie/Trailers";
import Thumbnail, { ThumbnailSizes } from "../components/Thumbnail";
import { useGetMovieProvidersQuery, useGetMovieQuery } from "../redux/movie/movieApi";
import { ScreenProps } from "./types";
import PlatformBlurView from "../components/PlatformBlurView";
import { AntDesign } from "@expo/vector-icons";

const { width, height } = Dimensions.get("screen");

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
    navigation.goBack();
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

  const { data: movie = {} as Movie, isLoading: loading } = useGetMovieQuery({
    id: movieId,
    type: typeOfContent,
  });

  const { data: providers = [] } = useGetMovieProvidersQuery({
    id: movieId,
    type: typeOfContent,
  });

  const insets = useSafeAreaInsets();

  return (
    <View style={{ flex: 1 }}>
      <Animated.ScrollView
        scrollEventThrottle={16}
        onScroll={scrollhandler}
        contentContainerStyle={{
          alignItems: "center",
        }}
        removeClippedSubviews={false}
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
            placeholder={movie?.placeholder_poster_path}
            priority="high"
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
          top: insets.top + 5,
        }}
      >
        <PlatformBlurView
          isInteractive
          style={[
            { borderRadius: 100, overflow: "hidden" },
            Platform.OS === "android" && {
              backgroundColor: "rgba(0,0,0,0.5)",
            },
          ]}
        >
          <IconButton icon={"chevron-left"} size={30} onPress={handleBack} iconColor="white" />
        </PlatformBlurView>
      </View>
    </View>
  );
}
