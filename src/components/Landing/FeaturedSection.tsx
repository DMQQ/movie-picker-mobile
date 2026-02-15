import { Link } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { memo, useMemo } from "react";
import { Dimensions, StyleSheet, TouchableOpacity, View, Pressable } from "react-native";
import { Button, Text } from "react-native-paper";
import Animated, { FadeInDown } from "react-native-reanimated";
import RatingIcons from "../RatingIcons";
import Skeleton from "../Skeleton/Skeleton";
import { Image, ImageBackground } from "expo-image";
import { FontAwesome, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useAppDispatch, useAppSelector } from "../../redux/store";
import { addToGroup, removeFromGroup } from "../../redux/favourites/favourites";
import { Movie } from "../../../types";
import useTranslation from "../../service/useTranslation";

const { width, height } = Dimensions.get("screen");
const HERO_HEIGHT = height * 0.72;

const FeaturedQuickActions = ({ movie }: { movie: Movie }) => {
  const dispatch = useAppDispatch();
  const groups = useAppSelector((state) => state.favourite.groups);

  const isInGroup = (groupId: "1" | "2" | "999") => {
    const group = groups.find((g) => g?.id === groupId);
    if (!group) return false;
    return group.movies.some((m) => m?.id === movie?.id);
  };

  const handlePress = (groupId: "1" | "2" | "999") => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (!movie) return;

    if (!isInGroup(groupId)) {
      dispatch(
        addToGroup({
          groupId,
          item: {
            id: movie.id,
            imageUrl: movie.poster_path,
            type: movie.type || (movie.title ? "movie" : "tv"),
          },
        }),
      );
    } else {
      dispatch(removeFromGroup({ groupId, movieId: movie.id }));
    }
  };

  return (
    <View style={styles.quickActionsRow}>
      <TouchableOpacity style={styles.iconButton} onPress={() => handlePress("2")}>
        <MaterialCommunityIcons name={isInGroup("2") ? "clock" : "clock-check-outline"} size={22} color="#fff" />
      </TouchableOpacity>

      <TouchableOpacity style={styles.iconButton} onPress={() => handlePress("1")}>
        <FontAwesome name={isInGroup("1") ? "heart" : "heart-o"} size={20} color="#fff" />
      </TouchableOpacity>
    </View>
  );
};

const FeaturedSectionSkeleton = memo(() => {
  return (
    <View style={[styles.featuredContainer]}>
      <View style={styles.gradientContainer}>
        <View style={styles.contentWrapper}>
          <View style={[styles.topContentContainer, { alignItems: "flex-end" }]}>
            <Skeleton>
              <View
                style={{
                  width: 105,
                  height: 155,
                  borderRadius: 12,
                  backgroundColor: "#222",
                }}
              />
            </Skeleton>

            <View style={[styles.detailsContainer, { gap: 10 }]}>
              <Skeleton>
                <View style={{ width: "85%", height: 32, backgroundColor: "#222", borderRadius: 4, marginBottom: 12 }} />
              </Skeleton>

              <Skeleton>
                <View style={{ width: "60%", height: 14, backgroundColor: "#222", borderRadius: 4, marginBottom: 12 }} />
              </Skeleton>

              <View style={styles.ratingContainer}>
                <Skeleton>
                  <View style={{ width: 100, height: 16, backgroundColor: "#222", borderRadius: 4 }} />
                </Skeleton>
              </View>

              {/* Genres */}
              <View style={[styles.genreContainer, { marginTop: 8 }]}>
                {[1, 2].map((i) => (
                  <Skeleton key={i}>
                    <View style={{ width: 55, height: 22, backgroundColor: "#222", borderRadius: 6 }} />
                  </Skeleton>
                ))}
              </View>
            </View>
          </View>

          {/* Overview Block - This fills the gap between thumbnail and buttons */}
          <View style={{ marginTop: 20, marginBottom: 20, gap: 10 }}>
            <Skeleton>
              <View style={{ width: "100%", height: 14, backgroundColor: "#222", borderRadius: 4, marginBottom: 8 }} />
            </Skeleton>
            <Skeleton>
              <View style={{ width: "90%", height: 14, backgroundColor: "#222", borderRadius: 4, marginBottom: 8 }} />
            </Skeleton>
            <Skeleton>
              <View style={{ width: "40%", height: 14, backgroundColor: "#222", borderRadius: 4 }} />
            </Skeleton>
          </View>

          {/* Action Row */}
          <View style={styles.actionRow}>
            <Skeleton>
              <View style={{ width: width * 0.5, height: 42, backgroundColor: "#222", borderRadius: 100 }} />
            </Skeleton>

            <View style={styles.quickActionsRow}>
              <Skeleton>
                <View style={{ width: 44, height: 44, backgroundColor: "#222", borderRadius: 22 }} />
              </Skeleton>
              <Skeleton>
                <View style={{ width: 44, height: 44, backgroundColor: "#222", borderRadius: 22 }} />
              </Skeleton>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
});

const gradient = ["transparent", "rgba(0,0,0,0.1)", "rgba(0,0,0,0.5)", "rgba(0,0,0,0.8)", "#000000"];

interface FeaturedSectionProps {
  featured: Movie | null;

  isLoading: boolean;
}

const FeaturedSection = memo(({ featured, isLoading }: FeaturedSectionProps) => {
  const t = useTranslation();
  // const {
  //   data: featured,
  //   error,
  //   isLoading,
  // } = useGetFeaturedQuery({
  //   selectedChip: props.selectedChip || "all",
  // });

  const genres = useMemo(() => {
    return (featured?.genres || []).slice(0, 3) as unknown as string[];
  }, [featured]);

  const imageUrl = useMemo(() => {
    const path = featured?.backdrop_path || featured?.poster_path;
    return path ? "https://image.tmdb.org/t/p/w1280" + path : null;
  }, [featured]);

  const thumbnailUrl = useMemo(() => {
    return featured?.poster_path ? "https://image.tmdb.org/t/p/w342" + featured.poster_path : null;
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
          <LinearGradient style={styles.gradientContainer} colors={gradient as any}>
            <Animated.View entering={FadeInDown.duration(600).delay(200)} style={styles.contentWrapper}>
              <Link
                href={{
                  pathname: "/movie/type/[type]/[id]",
                  params: {
                    id: featured?.id,
                    type: featured?.type || (featured?.title ? "movie" : "tv"),
                    img: featured?.poster_path,
                  },
                }}
                asChild
              >
                <Pressable>
                  <View style={styles.topContentContainer}>
                    {thumbnailUrl && (
                      <Image
                        source={{ uri: thumbnailUrl }}
                        style={styles.thumbnail}
                        contentFit="cover"
                        transition={300}
                        cachePolicy="disk"
                      />
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
                          • {new Date(featured?.release_date || featured?.first_air_date || Date.now()).getFullYear()}
                        </Text>
                      </View>

                      <View style={styles.genreContainer}>
                        {genres.map((genre) => {
                          return (
                            <View key={genre} style={styles.genreChip}>
                              <Text style={styles.genreText}>{genre}</Text>
                            </View>
                          );
                        })}
                      </View>
                    </View>
                  </View>

                  <Text numberOfLines={3} style={styles.overview}>
                    {featured?.overview}
                  </Text>
                </Pressable>
              </Link>

              <View style={styles.actionRow}>
                <Link
                  href={{
                    pathname: "/movie/type/[type]/[id]",
                    params: {
                      id: featured?.id,
                      type: featured?.type || (featured?.title ? "movie" : "tv"),
                      img: featured?.poster_path,
                    },
                  }}
                  asChild
                >
                  <Button
                    mode="outlined"
                    textColor="#fff"
                    style={styles.seeMoreButton}
                    labelStyle={styles.seeMoreLabel}
                    contentStyle={{ height: 42 }}
                    icon="arrow-right"
                  >
                    {t("movie.details.show_more")}
                  </Button>
                </Link>

                <FeaturedQuickActions movie={featured as Movie} />
              </View>
            </Animated.View>
          </LinearGradient>
        </View>
      </ImageBackground>
    </View>
  );
});

const styles = StyleSheet.create({
  skeletonContainer: {
    width,
    backgroundColor: "#000",
  },
  skeletonThumbnail: {
    width: 100,
    height: 150,
    backgroundColor: "#333",
    borderRadius: 12,
  },
  featuredContainer: {
    width,
    height: HERO_HEIGHT,
    position: "relative",
    marginBottom: 20,
    marginTop: -100,
  },
  gradientContainer: {
    flex: 1,
    justifyContent: "flex-end",
  },
  contentWrapper: {
    paddingHorizontal: 20,
    paddingBottom: 35,
    paddingTop: 20,
  },
  topContentContainer: {
    flexDirection: "row",
    marginBottom: 15,
    alignItems: "flex-end",
  },
  thumbnail: {
    width: 105,
    height: 155,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.1)",
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
    marginLeft: 15,
    paddingTop: 2,
    justifyContent: "flex-end",
  },
  title: {
    fontSize: 30,
    fontFamily: "Bebas",
    lineHeight: 32,
    color: "#fff",
    textShadowColor: "rgba(0, 0, 0, 0.75)",
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },
  tagline: {
    fontSize: 13,
    fontStyle: "italic",
    color: "rgba(255,255,255,0.8)",
    marginBottom: 8,
    marginTop: 2,
    lineHeight: 16,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  yearText: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 13,
    marginLeft: 6,
    fontWeight: "600",
  },
  genreContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  genreChip: {
    backgroundColor: "rgba(255,255,255,0.15)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },
  genreText: {
    color: "rgba(255,255,255,0.9)",
    fontSize: 11,
    fontWeight: "600",
  },
  overview: {
    fontSize: 14,
    color: "rgba(255,255,255,0.85)",
    lineHeight: 20,
    marginBottom: 20,
    marginTop: 5,
    textShadowColor: "rgba(0, 0, 0, 0.5)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 5,
  },
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 5,
  },
  seeMoreButton: {
    borderRadius: 100,
    borderColor: "rgba(255,255,255,0.5)",
    borderWidth: 1,
    backgroundColor: "rgba(255,255,255,0.1)",
    flex: 1,
    marginRight: 20,
  },
  seeMoreLabel: {
    fontSize: 14,
    fontWeight: "bold",
    letterSpacing: 0.5,
  },
  quickActionsRow: {
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
  },
  iconButton: {
    backgroundColor: "rgba(0,0,0,0.4)",
    padding: 10,
    borderRadius: 50,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
  },
});

export default FeaturedSection;
