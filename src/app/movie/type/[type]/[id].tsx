import { router, useIsPreview, useLocalSearchParams } from "expo-router";
import { useMemo, useState } from "react";
import { Dimensions, View } from "react-native";
import Animated, { useAnimatedScrollHandler, useSharedValue } from "react-native-reanimated";
import { Movie } from "../../../../../types";
import FloatingMovieHeader from "../../../../components/FloatingMovieHeader";
import MovieDetails from "../../../../components/Movie/MovieDetails";
import MovieDetailsSkeleton from "../../../../components/Movie/MovieDetailsSkeleton";
import Trailers from "../../../../components/Movie/Trailers";
import Thumbnail, { ThumbnailSizes } from "../../../../components/Thumbnail";
import { useGetMovieQuery } from "../../../../redux/movie/movieApi";

const { width, height } = Dimensions.get("screen");

interface ActionsProps {
  movieId: number;
  type: "movie" | "tv";
  scrollOffset: any;
  movie: Movie;
}

const Actions = ({ movie, movieId, type: typeOfContent, scrollOffset }: ActionsProps) => {
  const [backButtonPurpose, setBackButtonPurpose] = useState<"back" | "close">("back");
  const [isOpen, setIsOpen] = useState(false);

  const handleCloseTrailers = () => {
    setIsOpen(false);
    setBackButtonPurpose("back");
  };

  const handleClose = () => {
    if (backButtonPurpose === "back") {
      router.back();
      return;
    }

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

export default function MovieDetailsScreen() {
  const scrollOffset = useSharedValue(0);
  const {
    type: typeOfContent,
    img: posterPath,
    id: movieId,
  } = useLocalSearchParams<{
    type: "movie" | "tv";
    img?: string;
    id: string;
  }>();

  const isPreview = useIsPreview();

  const IMG_HEIGHT = useMemo(() => height * (isPreview ? 0.5 : 0.75), [height, isPreview]);

  const scrollhandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollOffset.value = event.contentOffset.y;
    },
  });

  const { data: movie = {} as Movie, isLoading: loading } = useGetMovieQuery(
    {
      id: Number(movieId),
      type: typeOfContent,
    },
    { refetchOnReconnect: true, refetchOnMountOrArgChange: true, skip: !movieId || !typeOfContent }
  );

  const params = useMemo(
    () => ({
      id: movieId,
      type: typeOfContent,
    }),
    [movieId, typeOfContent]
  );

  return (
    <View style={{ flex: 1, backgroundColor: "#000" }}>
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
          {loading ? <MovieDetailsSkeleton /> : <MovieDetails type={typeOfContent} movie={movie as any} params={params} />}
        </View>
      </Animated.ScrollView>

      {!isPreview && <Actions movieId={Number(movieId)} type={typeOfContent as "movie" | "tv"} scrollOffset={scrollOffset} movie={movie} />}
    </View>
  );
}
