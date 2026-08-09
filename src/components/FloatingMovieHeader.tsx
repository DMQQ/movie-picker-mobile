import { memo, useMemo } from "react";
import IconButton from "./IconButton";
import Text from "./Text";
import { Dimensions, Platform, StyleSheet, View } from "react-native";

import { colors, common, fontWeight, fontSize, radius, spacing } from "../constants/design";
import Animated, {
  useAnimatedStyle,
  withTiming,
  SharedValue,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Movie } from "../../types";
import Thumbnail, { ThumbnailSizes } from "./Thumbnail";
import PlatformBlurView, { BlurViewWrapper } from "./PlatformBlurView";
import { IconShareButton } from "./ShareTicketButton";

const { height } = Dimensions.get("screen");
const IMG_HEIGHT = height * 0.75;

interface FloatingMovieHeaderProps {
  movie: Movie;
  scrollY: SharedValue<number>;

  onBack?(): void;

  backButtonIcon?: string;
}

function FloatingMovieHeader({
  movie,
  scrollY,
  backButtonIcon = "chevron-left",
  onBack,
}: FloatingMovieHeaderProps) {
  const insets = useSafeAreaInsets();

  const threshold = useMemo(() => IMG_HEIGHT * 0.9, []);

  const backgroundOpacity = useAnimatedStyle(() => {
    const isVisible = scrollY.value > threshold;
    return {
      opacity: isVisible
        ? withTiming(1, { duration: 250 })
        : withTiming(0, { duration: 150 }),
    };
  });

  const contentOpacity = useAnimatedStyle(() => {
    const isVisible = scrollY.value > threshold;
    return {
      opacity: isVisible
        ? withTiming(1, { duration: 250 })
        : withTiming(0, { duration: 150 }),
    };
  });

  const posterTransform = useAnimatedStyle(() => {
    const isVisible = scrollY.value > threshold;
    return {
      transform: [
        {
          translateX: isVisible
            ? withTiming(0, { duration: 250 })
            : withTiming(-20, { duration: 150 }),
        },
      ],
    };
  });

  const textTransform = useAnimatedStyle(() => {
    const isVisible = scrollY.value > threshold;
    return {
      transform: [
        {
          translateY: isVisible
            ? withTiming(0, { duration: 250 })
            : withTiming(10, { duration: 150 }),
        },
      ],
    };
  });

  const heartTransform = useAnimatedStyle(() => {
    const isVisible = scrollY.value > threshold;
    return {
      transform: [
        {
          translateX: isVisible
            ? withTiming(0, { duration: 250 })
            : withTiming(20, { duration: 150 }),
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
        <Animated.View
          style={[
            styles.backgroundContainer,
            styles.androidBackground,
            backgroundOpacity,
          ]}
        />
      )}

      <View style={styles.headerContent}>
        <PlatformBlurView interactive style={[styles.buttonContainer]}>
          <IconButton
            icon={backButtonIcon}
            size={28}
            style={common.iconButton}
            onPress={onBack}
            iconColor={colors.text}
          />
        </PlatformBlurView>

        <Animated.View style={[styles.movieInfoContainer, contentOpacity]}>
          <Animated.View style={[styles.posterContainer, posterTransform]}>
            <Thumbnail
              size={ThumbnailSizes.poster.small}
              container={[styles.posterThumbnail]}
              path={movie?.poster_path}
              priority="low"
            />
          </Animated.View>

          <View style={styles.textContainer}>
            <Animated.View style={textTransform}>
              <Text
                variant="titleMedium"
                style={styles.movieTitle}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {movie?.title || movie?.name}
              </Text>
            </Animated.View>

            <Animated.View style={[styles.metadataRow, textTransform]}>
              {(movie?.vote_average || 0) > 0 && (
                <View style={styles.ratingContainer}>
                  <MaterialCommunityIcons
                    name="star"
                    size={12}
                    color="#FFD700"
                  />
                  <Text style={styles.ratingText}>
                    {movie?.vote_average.toFixed(1)}
                  </Text>
                </View>
              )}

              {movie?.release_date && (
                <Text style={styles.metadataText}>
                  {new Date(movie.release_date).getFullYear()}
                </Text>
              )}

              {movie?.runtime > 0 && (
                <Text style={styles.metadataText}>
                  {Math.floor(movie.runtime / 60)}h {movie.runtime % 60}m
                </Text>
              )}

              {(movie as any)?.number_of_episodes > 0 && (
                <Text style={styles.metadataText}>
                  {(movie as any).number_of_episodes} episodes
                </Text>
              )}

              {(movie as any)?.number_of_seasons > 0 && (
                <Text style={styles.metadataText}>
                  {(movie as any).number_of_seasons} season
                  {(movie as any).number_of_seasons > 1 ? "s" : ""}
                </Text>
              )}
            </Animated.View>

            {movie?.genres && movie.genres.length > 0 && (
              <Animated.View style={[styles.genresContainer, textTransform]}>
                <Text
                  style={styles.genresText}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
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
            interactive
            style={[
              styles.buttonContainer,
              Platform.OS === "android" && styles.androidButtonBackground,
            ]}
            tintColor={colors.primary}
          >
            {movie && <IconShareButton movie={movie} />}
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
    paddingBottom: spacing.sm + 2,
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
    paddingHorizontal: spacing.screen,
    paddingTop: spacing.xs + 1,
  },
  buttonContainer: {
    borderRadius: radius.pill,
    overflow: "hidden",
    backgroundColor: colors.appBackground,
  },
  androidButtonBackground: {
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  movieInfoContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.screen,
    gap: spacing.md,
  },
  posterContainer: {
    width: 40,
    height: 60,
    borderRadius: radius.xs + 2,
    overflow: "hidden",
    backgroundColor: colors.border,
  },
  posterThumbnail: {
    width: 40,
    height: 60,
  },
  textContainer: {
    flex: 1,
  },
  movieTitle: {
    color: colors.text,
    fontWeight: fontWeight.semibold,
    marginBottom: spacing.xs,
  },
  metadataRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  ratingText: {
    color: colors.text,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    marginLeft: spacing.xs - 1,
  },
  metadataText: {
    color: "rgba(255,255,255,0.8)",
    fontSize: fontSize.sm,
  },
  genresContainer: {
    flexDirection: "row",
    marginTop: spacing.xs - 1,
  },
  genresText: {
    color: "rgba(255,255,255,0.6)",
    fontSize: fontSize.sm - 1,
  },
});
