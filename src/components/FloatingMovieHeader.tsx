import * as Haptics from "expo-haptics";
import { memo, useCallback, useMemo } from "react";
import { Dimensions, Platform, StyleSheet, View } from "react-native";
import { IconButton, MD2DarkTheme, Text } from "react-native-paper";
import Animated, { useAnimatedStyle, withTiming, SharedValue } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { AntDesign } from "@expo/vector-icons";
import { Movie } from "../../types";
import Thumbnail, { ThumbnailSizes } from "./Thumbnail";
import PlatformBlurView, { BlurViewWrapper } from "./PlatformBlurView";
import { addToGroup, removeFromGroup } from "../redux/favourites/favourites";
import { useAppDispatch, useAppSelector } from "../redux/store";

const { height } = Dimensions.get("screen");
const IMG_HEIGHT = height * 0.75;

interface FloatingMovieHeaderProps {
  movie: Movie;
  scrollY: SharedValue<number>;

  onBack?(): void;

  backButtonIcon?: string;
}

function FloatingMovieHeader({ movie, scrollY, backButtonIcon = "chevron-left", onBack }: FloatingMovieHeaderProps) {
  const insets = useSafeAreaInsets();
  const dispatch = useAppDispatch();
  const groups = useAppSelector((state) => state.favourite.groups);

  const isInFavourites = useMemo(() => {
    const favouritesGroup = groups.find((g) => g?.id === "1");
    if (!favouritesGroup) return false;
    return favouritesGroup.movies.some((m) => m?.id === movie?.id);
  }, [groups, movie?.id]);

  const handleFavouritePress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (!movie) return;

    if (!isInFavourites) {
      dispatch(
        addToGroup({
          groupId: "1",
          item: {
            id: movie.id,
            imageUrl: movie.poster_path,
            type: movie.type || (movie.title ? "movie" : "tv"),
          },
        })
      );
    } else {
      dispatch(
        removeFromGroup({
          groupId: "1",
          movieId: movie.id,
        })
      );
    }
  }, [dispatch, movie, isInFavourites]);

  const threshold = useMemo(() => IMG_HEIGHT * 0.9, []);

  const backgroundOpacity = useAnimatedStyle(() => {
    const isVisible = scrollY.value > threshold;
    return {
      opacity: isVisible ? withTiming(1, { duration: 250 }) : withTiming(0, { duration: 150 }),
    };
  });

  const contentOpacity = useAnimatedStyle(() => {
    const isVisible = scrollY.value > threshold;
    return {
      opacity: isVisible ? withTiming(1, { duration: 250 }) : withTiming(0, { duration: 150 }),
    };
  });

  const posterTransform = useAnimatedStyle(() => {
    const isVisible = scrollY.value > threshold;
    return {
      transform: [
        {
          translateX: isVisible ? withTiming(0, { duration: 250 }) : withTiming(-20, { duration: 150 }),
        },
      ],
    };
  });

  const textTransform = useAnimatedStyle(() => {
    const isVisible = scrollY.value > threshold;
    return {
      transform: [
        {
          translateY: isVisible ? withTiming(0, { duration: 250 }) : withTiming(10, { duration: 150 }),
        },
      ],
    };
  });

  const heartTransform = useAnimatedStyle(() => {
    const isVisible = scrollY.value > threshold;
    return {
      transform: [
        {
          translateX: isVisible ? withTiming(0, { duration: 250 }) : withTiming(20, { duration: 150 }),
        },
      ],
    };
  });

  return (
    <Animated.View style={[styles.headerContainer, { paddingTop: insets.top }]}>
      {Platform.OS === "ios" ? (
        <Animated.View style={[styles.backgroundContainer, backgroundOpacity]}>
          <BlurViewWrapper style={styles.iosBlurBackground} />
        </Animated.View>
      ) : (
        <Animated.View style={[styles.backgroundContainer, styles.androidBackground, backgroundOpacity]} />
      )}

      <View style={styles.headerContent}>
        <PlatformBlurView isInteractive style={[styles.buttonContainer]}>
          <IconButton icon={backButtonIcon} size={25} onPress={onBack} iconColor="white" />
        </PlatformBlurView>

        <Animated.View style={[styles.movieInfoContainer, contentOpacity]}>
          <Animated.View style={[styles.posterContainer, posterTransform]}>
            <Thumbnail
              size={ThumbnailSizes.poster.small}
              container={[styles.posterThumbnail]}
              path={movie?.poster_path}
              placeholder={movie?.placeholder_poster_path}
              priority="low"
            />
          </Animated.View>

          <View style={styles.textContainer}>
            <Animated.View style={textTransform}>
              <Text variant="titleMedium" style={styles.movieTitle} numberOfLines={1} ellipsizeMode="tail">
                {movie?.title || movie?.name}
              </Text>
            </Animated.View>

            <Animated.View style={[styles.metadataRow, textTransform]}>
              {!!movie?.vote_average && movie.vote_average > 0 && (
                <View style={styles.ratingContainer}>
                  <AntDesign name="star" size={12} color="#FFD700" />
                  <Text style={styles.ratingText}>{movie.vote_average.toFixed(1)}</Text>
                </View>
              )}

              {movie?.release_date && <Text style={styles.metadataText}>{new Date(movie.release_date).getFullYear()}</Text>}

              {movie?.runtime && movie.runtime > 0 && (
                <Text style={styles.metadataText}>
                  {Math.floor(movie.runtime / 60)}h {movie.runtime % 60}m
                </Text>
              )}

              {(movie as any)?.number_of_episodes && <Text style={styles.metadataText}>{(movie as any).number_of_episodes} episodes</Text>}

              {(movie as any)?.number_of_seasons && (
                <Text style={styles.metadataText}>
                  {(movie as any).number_of_seasons} season{(movie as any).number_of_seasons > 1 ? "s" : ""}
                </Text>
              )}
            </Animated.View>

            {movie?.genres && movie.genres.length > 0 && (
              <Animated.View style={[styles.genresContainer, textTransform]}>
                <Text style={styles.genresText} numberOfLines={1} ellipsizeMode="tail">
                  {movie.genres
                    .slice(0, 3)
                    .map((genre: any) => genre.name)
                    .join(" • ")}
                </Text>
              </Animated.View>
            )}
          </View>
        </Animated.View>

        <Animated.View style={[contentOpacity, heartTransform]}>
          <PlatformBlurView
            isInteractive
            style={[styles.buttonContainer, Platform.OS === "android" && styles.androidButtonBackground]}
            tintColor="#FF0000"
          >
            <IconButton
              icon={isInFavourites ? "heart" : "heart-outline"}
              size={25}
              onPress={handleFavouritePress}
              iconColor={isInFavourites ? "#FF6B6B" : "white"}
            />
          </PlatformBlurView>
        </Animated.View>
      </View>
    </Animated.View>
  );
}

export default memo(FloatingMovieHeader);

const styles = StyleSheet.create({
  headerContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    paddingBottom: 10,
    zIndex: 1000,
  },
  backgroundContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  iosBlurBackground: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    borderWidth: 0,
  },
  androidBackground: {
    backgroundColor: "rgba(0,0,0,0.9)",
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingTop: 5,
  },
  buttonContainer: {
    borderRadius: 100,
    overflow: "hidden",

    ...Platform.select({
      android: {
        backgroundColor: MD2DarkTheme.colors.surface,
        borderWidth: 2,
        borderColor: "#343434ff",
      },
    }),
  },
  androidButtonBackground: {
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  movieInfoContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    gap: 12,
  },
  posterContainer: {
    width: 40,
    height: 60,
    borderRadius: 6,
    overflow: "hidden",
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  posterThumbnail: {
    width: 40,
    height: 60,
  },
  textContainer: {
    flex: 1,
  },
  movieTitle: {
    color: "white",
    fontWeight: "600",
    marginBottom: 4,
  },
  metadataRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 8,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  ratingText: {
    color: "white",
    fontSize: 12,
    fontWeight: "500",
    marginLeft: 3,
  },
  metadataText: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 12,
  },
  genresContainer: {
    flexDirection: "row",
    marginTop: 3,
  },
  genresText: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 11,
  },
});
