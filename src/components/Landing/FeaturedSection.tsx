import { Link } from "expo-router";
import Text from "../Text";
import {
  colors,
  fontWeight,
  fontSize,
  radius,
  spacing,
} from "../../constants/design";
import { LinearGradient } from "expo-linear-gradient";
import { memo, useMemo } from "react";
import { Dimensions, StyleSheet, View } from "react-native";
import RatingIcons from "../RatingIcons";
import Skeleton from "../Skeleton/Skeleton";
import { Image, ImageBackground } from "expo-image";
import { useGetFeaturedQuery } from "../../redux/movie/movieApi";
import Chip from "../Chip";
import Touch from "../Touch";

const { width, height } = Dimensions.get("screen");
const HERO_HEIGHT = height * 0.72;

export const FeaturedSectionSkeleton = memo(() => {
  return (
    <View style={[styles.featuredContainer]}>
      <View style={styles.gradientContainer}>
        <View style={styles.contentWrapper}>
          <View
            style={[styles.topContentContainer, { alignItems: "flex-end" }]}
          >
            <Skeleton>
              <View
                style={{
                  width: 105,
                  height: 155,
                  borderRadius: radius.md,
                  backgroundColor: "#222",
                }}
              />
            </Skeleton>

            <View style={[styles.detailsContainer, { gap: spacing.sm + 2 }]}>
              <Skeleton>
                <View
                  style={{
                    width: "85%",
                    height: 32,
                    backgroundColor: "#222",
                    borderRadius: radius.xs,
                    marginBottom: spacing.md,
                  }}
                />
              </Skeleton>

              <Skeleton>
                <View
                  style={{
                    width: "60%",
                    height: 14,
                    backgroundColor: "#222",
                    borderRadius: radius.xs,
                    marginBottom: spacing.md,
                  }}
                />
              </Skeleton>

              <View style={styles.ratingContainer}>
                <Skeleton>
                  <View
                    style={{
                      width: 100,
                      height: 16,
                      backgroundColor: "#222",
                      borderRadius: radius.xs,
                    }}
                  />
                </Skeleton>
              </View>

              {/* Genres */}
              <View style={[styles.genreContainer, { marginTop: spacing.sm }]}>
                {[1, 2].map((i) => (
                  <Skeleton key={i}>
                    <View
                      style={{
                        width: 55,
                        height: 22,
                        backgroundColor: "#222",
                        borderRadius: radius.xs + 2,
                      }}
                    />
                  </Skeleton>
                ))}
              </View>
            </View>
          </View>

          {/* Overview Block - This fills the gap between thumbnail and buttons */}
          <View style={{ marginTop: spacing.xs + 1, marginBottom: spacing.xl, gap: spacing.sm + 2 }}>
            <Skeleton>
              <View
                style={{
                  width: "100%",
                  height: 14,
                  backgroundColor: "#222",
                  borderRadius: radius.xs,
                  marginBottom: spacing.sm,
                }}
              />
            </Skeleton>
            <Skeleton>
              <View
                style={{
                  width: "90%",
                  height: 14,
                  backgroundColor: "#222",
                  borderRadius: radius.xs,
                  marginBottom: spacing.sm,
                }}
              />
            </Skeleton>
            <Skeleton>
              <View
                style={{
                  width: "40%",
                  height: 14,
                  backgroundColor: "#222",
                  borderRadius: radius.xs,
                }}
              />
            </Skeleton>
          </View>

        </View>
      </View>
    </View>
  );
});

const gradient = [
  "transparent",
  "rgba(0,0,0,0.1)",
  "rgba(0,0,0,0.5)",
  "rgba(0,0,0,0.8)",
  colors.appBackground,
];

interface FeaturedSectionProps {
  categoryId: string;
}

const FeaturedSection = memo(({ categoryId }: FeaturedSectionProps) => {
  const { data: featured, isLoading } = useGetFeaturedQuery(
    useMemo(
      () => ({
        selectedChip: categoryId || "all",
      }),
      [categoryId],
    ),
  );

  const genres = useMemo(() => {
    return (featured?.genres || []).slice(0, 3) as unknown as string[];
  }, [featured]);

  const imageUrl = useMemo(() => {
    const path = featured?.backdrop_path || featured?.poster_path;
    return path ? "https://image.tmdb.org/t/p/w1280" + path : null;
  }, [featured]);

  const thumbnailUrl = useMemo(() => {
    return featured?.poster_path
      ? "https://image.tmdb.org/t/p/w342" + featured.poster_path
      : null;
  }, [featured]);

  if (isLoading || !featured || !imageUrl) {
    return <FeaturedSectionSkeleton />;
  }

  return (
    <View style={styles.featuredContainer}>
      <ImageBackground
        style={StyleSheet.absoluteFill}
        source={{ uri: imageUrl }}
        placeholderContentFit="cover"
        cachePolicy="disk"
        recyclingKey={imageUrl}
        contentFit="cover"
        transition={300}
      >
        <View style={StyleSheet.absoluteFill}>
          <LinearGradient
            style={styles.gradientContainer}
            colors={gradient as any}
          >
            <View style={styles.contentWrapper}>
              <Link
                href={{
                  pathname: "/movie/type/[type]/[id]",
                  params: {
                    id: featured?.id,
                    type: featured?.type || (featured?.title ? "movie" : "tv"),
                    img: featured?.poster_path,
                    source: "discover",
                  },
                }}
                asChild
              >
                <Touch>
                  <View style={styles.topContentContainer}>
                    {thumbnailUrl && (
                      <Link.AppleZoom>
                        <Image
                          source={{ uri: thumbnailUrl }}
                          style={styles.thumbnail}
                          contentFit="cover"
                          transition={300}
                          cachePolicy="disk"
                        />
                      </Link.AppleZoom>
                    )}

                    <View style={styles.detailsContainer}>
                      <Text style={styles.title} numberOfLines={2}>
                        {featured?.title || featured?.name}
                      </Text>

                      {featured?.tagline ? (
                        <Text style={styles.tagline} numberOfLines={2}>
                          "{featured.tagline}"
                        </Text>
                      ) : null}

                      <View style={styles.ratingContainer}>
                        <RatingIcons vote={featured?.vote_average} size={16} />
                        <Text style={styles.yearText}>
                          •{" "}
                          {new Date(
                            featured?.release_date ||
                              featured?.first_air_date ||
                              Date.now(),
                          ).getFullYear()}
                        </Text>
                      </View>

                      <View style={styles.genreContainer}>
                        {genres.map((g) => (
                          <Chip key={g}>{g}</Chip>
                        ))}
                      </View>
                    </View>
                  </View>

                  <Text numberOfLines={3} style={styles.overview}>
                    {featured?.overview}
                  </Text>
                </Touch>
              </Link>
            </View>
          </LinearGradient>
        </View>
      </ImageBackground>
    </View>
  );
});

const styles = StyleSheet.create({
  skeletonContainer: {
    width,
    backgroundColor: colors.appBackground,
  },
  skeletonThumbnail: {
    width: 100,
    height: 150,
    backgroundColor: "#333",
    borderRadius: radius.md,
  },
  featuredContainer: {
    width,
    height: HERO_HEIGHT,
    position: "relative",
    marginBottom: spacing.sm,
    marginTop: -100,
  },
  gradientContainer: {
    flex: 1,
    justifyContent: "flex-end",
  },
  contentWrapper: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xl,
    paddingTop: spacing.xl,
  },
  topContentContainer: {
    flexDirection: "row",
    marginBottom: spacing.screen,
    alignItems: "flex-end",
  },
  thumbnail: {
    width: 105,
    height: 155,
    borderRadius: radius.md,
    backgroundColor: colors.border,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 6,
    elevation: 8,
  },
  detailsContainer: {
    flex: 1,
    marginLeft: spacing.screen,
    paddingTop: spacing.xs - 2,
    justifyContent: "flex-end",
  },
  title: {
    fontSize: 30,
    fontFamily: "Bebas",
    lineHeight: 32,
    color: colors.text,
    textShadowColor: "rgba(0, 0, 0, 0.75)",
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },
  tagline: {
    fontSize: fontSize.md - 1,
    fontStyle: "italic",
    color: "rgba(255,255,255,0.8)",
    marginBottom: spacing.sm,
    marginTop: spacing.xs - 2,
    lineHeight: 16,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  yearText: {
    color: "rgba(255,255,255,0.7)",
    fontSize: fontSize.md - 1,
    marginLeft: spacing.xs + 2,
    fontWeight: fontWeight.semibold,
  },
  genreContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm - 2,
  },
  overview: {
    fontSize: fontSize.md,
    color: "rgba(255,255,255,0.85)",
    lineHeight: 20,
    marginBottom: spacing.xl,
    marginTop: spacing.xs + 1,
    textShadowColor: "rgba(0, 0, 0, 0.5)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 5,
  },
});

export default FeaturedSection;
