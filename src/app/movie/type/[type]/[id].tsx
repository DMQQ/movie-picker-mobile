import { router, useIsPreview, useLocalSearchParams } from "expo-router";
import { memo, useCallback, useMemo, useState } from "react";
import { Dimensions, Platform, StyleSheet, View } from "react-native";
import Animated, { useAnimatedScrollHandler, useSharedValue } from "react-native-reanimated";
import { Movie } from "../../../../../types";
import FloatingMovieHeader from "../../../../components/FloatingMovieHeader";
import MovieDetails from "../../../../components/Movie/MovieDetails";
import MovieDetailsSkeleton from "../../../../components/Movie/MovieDetailsSkeleton";
import Thumbnail, { ThumbnailSizes } from "../../../../components/Thumbnail";
import { useGetMovieProvidersQuery, useGetMovieQuery } from "../../../../redux/movie/movieApi";
import ShareTicketButton from "../../../../components/ShareTicketButton";

const { width, height } = Dimensions.get("screen");

interface ActionsProps {
  movieId: number;
  type: "movie" | "tv";
  scrollOffset: any;
  movie: Movie;
}

const Actions = memo(({ movie, scrollOffset }: ActionsProps) => {
  const [backButtonPurpose, setBackButtonPurpose] = useState<"back" | "close">("back");
  const [isOpen, setIsOpen] = useState(false);

  const handleCloseTrailers = useCallback(() => {
    setIsOpen(false);
    setBackButtonPurpose("back");
  }, []);

  const handleClose = useCallback(() => {
    if (backButtonPurpose === "back") {
      router.back();
      return;
    }

    handleCloseTrailers();
  }, [backButtonPurpose]);

  return (
    <FloatingMovieHeader
      backButtonIcon={isOpen ? "close" : "chevron-left"}
      onBack={handleClose}
      movie={movie! as any}
      scrollY={scrollOffset}
    />
  );
});

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
    {
      refetchOnReconnect: true,
      refetchOnMountOrArgChange: true,
      skip: !movieId || !typeOfContent,
    },
  );

  const params = useMemo(
    () => ({
      id: movieId,
      type: typeOfContent,
    }),
    [movieId, typeOfContent],
  );

  const { data: providers } = useGetMovieProvidersQuery({
    id: Number(movieId),
    type: typeOfContent,
  });

  return (
    <View style={{ flex: 1, backgroundColor: "#000", width, height }}>
      <Animated.ScrollView
        onScroll={scrollhandler}
        contentContainerStyle={{
          alignItems: "center",
          paddingTop: IMG_HEIGHT,
          width,
        }}
        overScrollMode={"never"}
        bounces={false}
        stickyHeaderIndices={[0]}
        nestedScrollEnabled
      >
        <Animated.View
          style={[
            {
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              zIndex: 1,
              width: width,
              height: IMG_HEIGHT,
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
            priority="high"
          />
        </Animated.View>
        <View style={{ zIndex: 10, position: "relative" }}>
          {loading ? (
            <MovieDetailsSkeleton />
          ) : (
            <MovieDetails providers={providers} type={typeOfContent} movie={movie as any} params={params} />
          )}
        </View>
      </Animated.ScrollView>

      {!isPreview && <Actions movieId={Number(movieId)} type={typeOfContent as "movie" | "tv"} scrollOffset={scrollOffset} movie={movie} />}

      <View style={styles.floatingShare}>
        <ShareTicketButton
          movie={movie}
          providers={providers as any}
          headerText="Tonight's Pick"
          pickupLine="I invite you to watch with me!"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  floatingShare: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    padding: 15,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },
});
