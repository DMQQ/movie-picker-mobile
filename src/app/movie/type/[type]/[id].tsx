import { Link, router, useIsPreview, useLocalSearchParams } from "expo-router";
import { memo, useCallback, useMemo, useState } from "react";
import { Dimensions, Pressable, StyleSheet, View } from "react-native";
import Animated, {
  useAnimatedScrollHandler,
  useSharedValue,
} from "react-native-reanimated";
import { Movie } from "../../../../../types";
import FloatingMovieHeader from "../../../../components/FloatingMovieHeader";
import MovieDetails from "../../../../components/Movie/MovieDetails";
import MovieDetailsSkeleton from "../../../../components/Movie/MovieDetailsSkeleton";
import Thumbnail, { ThumbnailSizes } from "../../../../components/Thumbnail";
import Icon from "../../../../components/Icon";
import Text from "../../../../components/Text";
import { useGetCombinedMovieDetailsQuery } from "../../../../redux/movie/movieApi";
import { colors, radius } from "../../../../constants/design";
import { LinearGradient } from "expo-linear-gradient";
import useTranslation from "../../../../service/useTranslation";

const { width, height } = Dimensions.get("screen");

interface ActionsProps {
  movieId: number;
  type: "movie" | "tv";
  scrollOffset: any;
  movie: Movie;
}

const Actions = memo(({ movie, scrollOffset }: ActionsProps) => {
  const [backButtonPurpose, setBackButtonPurpose] = useState<"back" | "close">(
    "back",
  );
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
  const t = useTranslation();

  const IMG_HEIGHT = useMemo(
    () => height * (isPreview ? 0.5 : 0.75),
    [height, isPreview],
  );

  const scrollhandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollOffset.value = event.contentOffset.y;
    },
  });

  const params = useMemo(
    () => ({
      id: movieId,
      type: typeOfContent,
    }),
    [movieId, typeOfContent],
  );

  const numericId = Number(movieId);
  const isValidId =
    !!movieId && movieId !== "undefined" && !isNaN(numericId) && numericId > 0;
  const isValidType = !!typeOfContent && typeof typeOfContent !== "undefined";

  const { data: combined, isLoading: loading, isError, refetch } =
    useGetCombinedMovieDetailsQuery(
      { id: numericId, type: typeOfContent as "movie" | "tv" },
      {
        refetchOnReconnect: true,
        refetchOnMountOrArgChange: true,
        skip: !isValidId || !isValidType,
      },
    );

  const movie = (combined?.movie ?? {}) as Movie;
  const similarData = combined?.similar ?? undefined;
  const trailersData = combined?.trailers ?? undefined;
  const castData = combined?.keyPeople ?? undefined;
  const providers = combined?.providers ?? undefined;

  return (
    <View
      style={{ flex: 1, backgroundColor: colors.appBackground, width, height }}
    >
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
        showsVerticalScrollIndicator={false}
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
          <Link.AppleZoomTarget>
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
          </Link.AppleZoomTarget>
          <LinearGradient
            colors={["transparent", "rgba(0,0,0,0.45)", colors.appBackground]}
            style={StyleSheet.absoluteFill}
            locations={[0.45, 0.78, 1]}
          />
        </Animated.View>
        <View style={{ zIndex: 10, position: "relative", width, backgroundColor: colors.appBackground, borderTopLeftRadius: radius.modal, borderTopRightRadius: radius.modal, overflow: "hidden" }}>
          {loading ? (
            <MovieDetailsSkeleton />
          ) : isError && !movie?.id ? (
            <View style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingTop: 200, gap: 16, paddingHorizontal: 24 }}>
              <Icon source="cloud-off-outline" size={44} color="rgba(255,255,255,0.12)" />
              <Text style={{ fontSize: 14, fontWeight: "600", color: "rgba(255,255,255,0.25)", textAlign: "center" }}>
                {t("movie.details.loadError") as string}
              </Text>
              <Pressable
                onPress={() => refetch()}
                style={{ backgroundColor: "rgba(255,255,255,0.08)", borderRadius: 8, paddingHorizontal: 16, paddingVertical: 8 }}
              >
                <Text style={{ fontSize: 13, fontWeight: "700", color: "#fff", letterSpacing: 0.8 }}>{t("status-modal.retry") as string}</Text>
              </Pressable>
            </View>
          ) : (
            <MovieDetails
              castData={castData}
              similarData={similarData}
              trailersData={trailersData}
              providers={providers}
              type={typeOfContent}
              movie={movie as any}
              params={params}
            />
          )}
        </View>
      </Animated.ScrollView>

      {!isPreview && (
        <Actions
          movieId={Number(movieId)}
          type={typeOfContent as "movie" | "tv"}
          scrollOffset={scrollOffset}
          movie={movie}
        />
      )}
    </View>
  );
}
