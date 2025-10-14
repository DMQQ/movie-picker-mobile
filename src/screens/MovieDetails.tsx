import { useMemo, useRef, useState } from "react";
import { Dimensions, Platform, View } from "react-native";
import Animated, { interpolate, useAnimatedScrollHandler, useAnimatedStyle, useSharedValue } from "react-native-reanimated";
import { Movie } from "../../types";
import MovieDetails from "../components/Movie/MovieDetails";
import MovieDetailsSkeleton from "../components/Movie/MovieDetailsSkeleton";
import Trailers from "../components/Movie/Trailers";
import Thumbnail, { ThumbnailSizes } from "../components/Thumbnail";
import { useGetMovieProvidersQuery, useGetMovieQuery } from "../redux/movie/movieApi";
import { ScreenProps } from "./types";
import FloatingMovieHeader from "../components/FloatingMovieHeader";
import { useNavigation } from "@react-navigation/native";

const { width, height } = Dimensions.get("screen");

export default function MovieDetailsScreen({ route }: ScreenProps<"MovieDetails">) {
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

  const { data: movie = {} as Movie, isLoading: loading } = useGetMovieQuery(
    {
      id: movieId,
      type: typeOfContent,
    },
    { refetchOnReconnect: true, refetchOnMountOrArgChange: true }
  );

  const { data: providers = [] } = useGetMovieProvidersQuery(
    {
      id: movieId,
      type: typeOfContent,
    },
    { refetchOnReconnect: true, refetchOnMountOrArgChange: true }
  );

  return (
    <View style={{ flex: 1 }}>
      <Animated.ScrollView
        onScroll={scrollhandler}
        contentContainerStyle={{
          alignItems: "center",
          paddingTop: IMG_HEIGHT,
        }}
        overScrollMode={"never"}
        bounces={false}
        stickyHeaderIndices={[0]}
      >
        <Animated.View
          style={[
            {
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              zIndex: 1,
            },
          ]}
        >
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
        <View style={{ zIndex: 10, position: "relative" }}>
          {loading ? (
            <MovieDetailsSkeleton />
          ) : (
            <MovieDetails type={typeOfContent} movie={movie as any} providers={providers} width={width} />
          )}
        </View>
      </Animated.ScrollView>

      <Actions movieId={movieId} type={typeOfContent} scrollOffset={scrollOffset} movie={movie} />
    </View>
  );
}

interface ActionsProps {
  movieId: number;

  type: "movie" | "tv";

  scrollOffset: any;

  movie: Movie;
}

const Actions = ({ movie, movieId, type: typeOfContent, scrollOffset }: ActionsProps) => {
  const [backButtonPurpose, setBackButtonPurpose] = useState<"back" | "close">("back");
  const navigation = useNavigation();
  const [isOpen, setIsOpen] = useState(false);

  const handleCloseTrailers = () => {
    setIsOpen(false);
    setBackButtonPurpose("back");
  };

  const handleClose = () => {
    if (backButtonPurpose === "back") {
      navigation.goBack();
      return;
    }

    // Trigger the trailers closing animation
    handleCloseTrailers();
  };

  const handleOpen = () => {
    setIsOpen(true);
    setBackButtonPurpose("close");
  };

  return (
    <>
      <Trailers isOpen={isOpen} handleClose={handleCloseTrailers} handleOpen={handleOpen} id={movieId} type={typeOfContent} />

      <FloatingMovieHeader
        backButtonIcon={isOpen ? "close" : "chevron-left"}
        onBack={handleClose}
        movie={movie! as any}
        scrollY={scrollOffset}
      />
    </>
  );
};
