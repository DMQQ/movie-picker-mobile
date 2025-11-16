import { router } from "expo-router";
import { useLocalSearchParams } from "expo-router";
import LottieView from "lottie-react-native";
import { ReactNode, useContext, useEffect, useState, useRef } from "react";
import { Dimensions, FlatList, Platform, ScrollView, StyleSheet, View, ImageBackground, Animated } from "react-native";
import { Avatar, Button, MD2DarkTheme, Text, TouchableRipple, useTheme } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Movie } from "../../../types";
import CreateCollectionFromLiked from "../../components/CreateCollectionFromLiked";
import { FancySpinner } from "../../components/FancySpinner";
import { AVATAR_COLORS } from "../../components/Home/ActiveUsers";
import Thumbnail from "../../components/Thumbnail";
import { addToGroup, removeFromGroup } from "../../redux/favourites/favourites";
import { roomActions } from "../../redux/room/roomSlice";
import { useAppDispatch, useAppSelector } from "../../redux/store";
import { SocketContext } from "../../service/SocketContext";
import useTranslation from "../../service/useTranslation";
import SafeIOSContainer from "../../components/SafeIOSContainer";
import { AntDesign, MaterialIcons } from "@expo/vector-icons";
import ThumbsUp from "../../assets/ThumbsUp";
import { GlassView } from "expo-glass-effect";
import { BlurView } from "expo-blur";

interface GameSummary {
  roomId: string;
  type: string;
  genres: number[];
  providers: number[];
  maxRounds: number;
  finalPage: number;
  totalUsers: number;
  users: Array<{
    userId: string;
    username: string;
    finished: boolean;
    totalPicks: number;
    picks: Record<string, string>;
  }>;
  matchedMovies: Array<{
    id: number;
    title: string;
    poster_path: string;
  }>;
  totalMatches: number;
  gameEndReason: string;
}

const Badge = () => {
  return (
    <View style={{ position: "absolute", top: 5, left: 5, borderRadius: 100, overflow: "hidden", zIndex: 10 }}>
      <GlassView
        glassEffectStyle="regular"
        tintColor={MD2DarkTheme.colors.primary + "aa"}
        style={[
          {
            borderRadius: 100,
            padding: 5,
            borderWidth: 1,
            borderColor: MD2DarkTheme.colors.primary,
          },
          Platform.OS === "android" && { backgroundColor: MD2DarkTheme.colors.primary + "cc" },
        ]}
      >
        <ThumbsUp width={18} height={18} />
      </GlassView>
    </View>
  );
};

export default function GameSummary() {
  const params = useLocalSearchParams();
  const roomId = params.roomId as string;
  const dispatch = useAppDispatch();
  const { socket } = useContext(SocketContext);
  const t = useTranslation();

  const [summary, setSummary] = useState<GameSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bgImageIndexA, setBgImageIndexA] = useState(0);
  const [bgImageIndexB, setBgImageIndexB] = useState(1);
  const [activeLayer, setActiveLayer] = useState<"A" | "B">("A");
  const layerAOpacity = useRef(new Animated.Value(1)).current;
  const layerBOpacity = useRef(new Animated.Value(0)).current;
  const insets = useSafeAreaInsets();

  useEffect(() => {
    const fetchGameSummary = async () => {
      if (!socket || !roomId) return;

      setLoading(true);
      setError(null);

      try {
        const response = await socket.emitWithAck("get-game-summary", roomId);

        if (response.success) {
          setSummary(response.summary);
        } else {
          setError(response.error);
        }
      } catch (err) {
        setError(t("game-summary.failed-to-load"));
      } finally {
        setLoading(false);
      }
    };

    fetchGameSummary();
  }, [socket, roomId]);

  useEffect(() => {
    return () => {
      dispatch(roomActions.reset());
    };
  }, []);

  useEffect(() => {
    if (summary?.matchedMovies && summary.matchedMovies.length > 1) {
      const interval = setInterval(() => {
        if (activeLayer === "A") {
          const nextIndex = (bgImageIndexA + 1) % summary.matchedMovies.length;
          setBgImageIndexB(nextIndex);

          Animated.parallel([
            Animated.timing(layerAOpacity, {
              toValue: 0,
              duration: 1000,
              useNativeDriver: true,
            }),
            Animated.timing(layerBOpacity, {
              toValue: 1,
              duration: 1000,
              useNativeDriver: true,
            }),
          ]).start(() => {
            setActiveLayer("B");
          });
        } else {
          const nextIndex = (bgImageIndexB + 1) % summary.matchedMovies.length;
          setBgImageIndexA(nextIndex);

          Animated.parallel([
            Animated.timing(layerBOpacity, {
              toValue: 0,
              duration: 1000,
              useNativeDriver: true,
            }),
            Animated.timing(layerAOpacity, {
              toValue: 1,
              duration: 1000,
              useNativeDriver: true,
            }),
          ]).start(() => {
            setActiveLayer("A");
          });
        }
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [summary?.matchedMovies, activeLayer, bgImageIndexA, bgImageIndexB, layerAOpacity, layerBOpacity]);

  const handleBackToHome = () => {
    dispatch(roomActions.reset());
    router.replace("/");
  };

  const handleTryAgain = () => {
    dispatch(roomActions.reset());
    router.replace("/room/qr-code");
  };

  const renderMovieItem = ({ item }: { item: Partial<Movie> }) => {
    return <MatchedItem {...item} summary={summary!} />;
  };

  const renderLikedItem = ({ item }: { item: Partial<Movie> }) => {
    return (
      <MatchedItem {...item} summary={summary!} badge={(summary?.matchedMovies || [])?.findIndex((like) => like.id === item.id) >= 0} />
    );
  };

  const likes = useAppSelector((st) => st.room.room.likes);

  if (loading) {
    return (
      <View style={{ flex: 1 }}>
        <View style={[styles.container, styles.centered]}>
          <FancySpinner size={80} />
          <Text style={styles.loadingText}>{t("game-summary.loading")}</Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={{ flex: 1 }}>
        <View style={[styles.container, styles.centered]}>
          <Text style={styles.errorText}>
            {t("game-summary.error")}
            {error}
          </Text>
          <Button mode="contained" onPress={handleBackToHome} style={styles.backButton}>
            {t("game-summary.back-to-home")}
          </Button>
        </View>
      </View>
    );
  }

  const backgroundUriA = summary?.matchedMovies?.[bgImageIndexA]?.poster_path
    ? `https://image.tmdb.org/t/p/w300${summary.matchedMovies[bgImageIndexA].poster_path}`
    : null;

  const backgroundUriB = summary?.matchedMovies?.[bgImageIndexB]?.poster_path
    ? `https://image.tmdb.org/t/p/w300${summary.matchedMovies[bgImageIndexB].poster_path}`
    : null;

  return (
    <View style={{ flex: 1, backgroundColor: "#000" }}>
      {(backgroundUriA || backgroundUriB) && (
        <>
          {/* Layer A */}
          {backgroundUriA && (
            <Animated.View style={[styles.backgroundImageContainer, { opacity: layerAOpacity }]}>
              <ImageBackground source={{ uri: backgroundUriA }} style={styles.backgroundImage} blurRadius={8}>
                <BlurView intensity={15} style={styles.blurOverlay} />
              </ImageBackground>
            </Animated.View>
          )}

          {/* Layer B */}
          {backgroundUriB && (
            <Animated.View style={[styles.backgroundImageContainer, { opacity: layerBOpacity }]}>
              <ImageBackground source={{ uri: backgroundUriB }} style={styles.backgroundImage} blurRadius={8}>
                <BlurView intensity={15} style={styles.blurOverlay} />
              </ImageBackground>
            </Animated.View>
          )}
        </>
      )}
      <ScrollView
        style={[
          styles.container,
          { paddingTop: Platform.OS === "android" ? insets.top : 0, marginTop: Platform.OS === "ios" ? -insets.top : 0 },
        ]}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: Platform.OS === "ios" ? insets.top : 0 }}
      >
        <View style={styles.content}>
          <View style={styles.headerSection}>
            {summary?.gameEndReason === "all_users_finished" && (
              <LottieView source={require("../../assets/confetti.json")} autoPlay loop={false} style={styles.confetti} />
            )}

            <View style={styles.titleContainer}>
              <View style={styles.statusIconRow}>
                {summary?.gameEndReason === "all_users_finished" ? (
                  <MaterialIcons name="celebration" size={40} color="#FFD700" />
                ) : (
                  <MaterialIcons name="check-circle" size={40} color="#4CAF50" />
                )}
                <Text style={styles.statusTitle}>
                  {summary?.gameEndReason === "all_users_finished" ? t("game-summary.game-completed") : t("game-summary.game-finished")}
                </Text>
              </View>

              {summary && (
                <Text style={styles.gameSubtitle}>
                  {summary.maxRounds} {t("game-summary.rounds")} •{" "}
                  {summary.type === "movie" ? t("game-summary.movies") : t("game-summary.tv-shows")} • {summary.roomId || roomId}
                </Text>
              )}
            </View>
          </View>

          <View style={styles.dashboardContainer}>
            <View style={styles.dashboardCard}>
              <View style={styles.statRow}>
                <View style={styles.statBlock}>
                  <View style={styles.statHeader}>
                    <MaterialIcons name="people" size={18} color="#64B5F6" />
                    <Text style={styles.statTitle}>{t("game-summary.players")}</Text>
                  </View>
                  <Text style={[styles.statValue, { color: "#64B5F6" }]}>{summary?.totalUsers || 0}</Text>
                </View>

                <View style={styles.statDivider} />

                <View style={styles.statBlock}>
                  <View style={styles.statHeader}>
                    <MaterialIcons name="favorite" size={18} color="#FF6B6B" />
                    <Text style={styles.statTitle}>{t("game-summary.matches")}</Text>
                  </View>
                  <Text style={[styles.statValue, { color: "#FF6B6B" }]}>{summary?.totalMatches || 0}</Text>
                </View>

                <View style={styles.statDivider} />

                <View style={styles.statBlock}>
                  <View style={styles.statHeader}>
                    <MaterialIcons name="touch-app" size={18} color="#81C784" />
                    <Text style={styles.statTitle}>{t("game-summary.total-picks")}</Text>
                  </View>
                  <Text style={[styles.statValue, { color: "#81C784" }]}>
                    {summary?.users?.reduce((total, user) => total + user.totalPicks, 0) || 0}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {summary?.users && (
            <View style={styles.playersContainer}>
              <Text style={styles.playersTitle}>{t("game-summary.player-performance")}</Text>
              <View style={styles.playersGrid}>
                {summary.users.map((user, index) => (
                  <View key={index} style={styles.playerChip}>
                    <View style={styles.avatarContainer}>
                      <Avatar.Text
                        size={28}
                        label={user.username?.[0].toUpperCase() || "U"}
                        color="white"
                        style={{
                          borderWidth: 1.5,
                          borderColor: "rgba(255,255,255,0.4)",
                          backgroundColor: AVATAR_COLORS[index % AVATAR_COLORS.length],
                        }}
                      />
                      <View style={[styles.playerStatusIndicator, user.finished ? styles.finishedIndicator : styles.inProgressIndicator]}>
                        {user.finished ? (
                          <MaterialIcons name="done" size={9} color="white" />
                        ) : (
                          <MaterialIcons name="more-horiz" size={8} color="white" />
                        )}
                      </View>
                    </View>
                    <Text style={styles.playerChipName}>{user.username}</Text>
                    <View style={styles.chipMetrics}>
                      <AntDesign name="heart" size={12} color="#FF6B6B" />
                      <Text style={styles.chipPickCount}>{user.totalPicks}</Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          )}

          {summary?.matchedMovies && summary.matchedMovies.length > 0 ? (
            <View style={styles.matchesContainer}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 15 }}>
                <Text style={styles.matchesTitle}>{t("game-summary.matched-movies")}</Text>

                <CreateCollectionFromLiked data={summary.matchedMovies} />
              </View>
              {summary.matchedMovies.length === 0 ? (
                <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                  <Text style={{ color: "#fff", fontSize: 16 }}>{t("game-summary.no-matches")}</Text>
                </View>
              ) : (
                <FlatList
                  data={summary.matchedMovies}
                  renderItem={renderMovieItem}
                  numColumns={3}
                  keyExtractor={(item) => item.id.toString()}
                  columnWrapperStyle={styles.movieRow}
                  showsVerticalScrollIndicator={false}
                  scrollEnabled={false}
                />
              )}
            </View>
          ) : (
            <View style={{ flex: 1, justifyContent: "center", alignItems: "center", marginTop: 30 }}>
              <Text style={{ color: "#fff", fontSize: 45, fontFamily: "Bebas" }}>{t("game-summary.no-matches")}</Text>
              <Text
                style={{
                  color: "#fff",
                  fontSize: 16,
                  textAlign: "center",
                  marginVertical: 15,
                  maxWidth: 300,
                }}
              >
                {t("game-summary.no-matches-desc")}
              </Text>
              <Button onPress={handleTryAgain}>{t("game-summary.try-again")}</Button>
            </View>
          )}

          {likes && likes.length > 0 && (
            <View
              style={{
                marginTop: 30,
              }}
            >
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 15 }}>
                <Text style={styles.matchesTitle}>{t("game-summary.your-picks")}</Text>

                <CreateCollectionFromLiked data={likes} />
              </View>

              <FlatList
                data={likes}
                renderItem={renderLikedItem}
                numColumns={3}
                keyExtractor={(item) => item.id.toString()}
                columnWrapperStyle={styles.movieRow}
                showsVerticalScrollIndicator={false}
                scrollEnabled={false}
              />
            </View>
          )}
        </View>
      </ScrollView>

      <View style={{ paddingHorizontal: 15, paddingTop: 15 }}>
        <Button mode="contained" onPress={handleBackToHome} style={styles.backButton} contentStyle={styles.backButtonContent}>
          {t("game-summary.back-to-home")}
        </Button>
      </View>
    </View>
  );
}

const MatchedItem = ({ summary, badge = false, ...item }: Partial<Movie> & { summary: { type: string }; badge?: boolean }) => {
  const screenWidth = Dimensions.get("window").width;
  const itemWidth = (screenWidth - 60) / 3;
  const dispatch = useAppDispatch();

  const groups = useAppSelector((state) => state.favourite.groups);
  const t = useTranslation();

  const isInGroup = (groupId: "1" | "2" | "999") => {
    const group = groups.find((g) => g?.id === groupId);
    if (!group) return false;
    return group.movies.some((m) => m?.id === item?.id);
  };

  const isInGroup1 = isInGroup("1");

  const onPress = () => {
    isInGroup1
      ? dispatch(
          removeFromGroup({
            groupId: "1",
            movieId: item.id!,
          })
        )
      : dispatch(
          addToGroup({
            item: {
              id: item.id!,
              imageUrl: item.poster_path!,
              type: item.type as "movie" | "tv",
            },
            groupId: "1",
          })
        );
  };

  return (
    <View style={[styles.movieThumbnailContainer, { width: itemWidth, gap: 5, justifyContent: "space-between", position: "relative" }]}>
      {badge && <Badge />}
      <TouchableRipple
        onPress={() =>
          router.push({
            pathname: "/movie/type/[type]/[id]",
            params: {
              id: item.id,
              type: summary?.type || "movie",
              img: item.poster_path,
            },
          })
        }
      >
        <Thumbnail size={200} path={item.poster_path!} style={styles.movieThumbnail} />
      </TouchableRipple>
      <View style={{ flex: 1, justifyContent: "space-between" }}>
        <Text style={styles.movieTitleSmall} numberOfLines={2}>
          {item.title}
        </Text>

        <Button
          style={{ marginTop: 10, borderColor: isInGroup1 ? MD2DarkTheme.colors.error : MD2DarkTheme.colors.primary }}
          mode="outlined"
          onPress={onPress}
          textColor={isInGroup1 ? MD2DarkTheme.colors.error : MD2DarkTheme.colors.primary}
        >
          {!isInGroup1 ? t("game-summary.add-to-favourites") : "" + t("game-summary.remove-from-favourites")}
        </Button>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  backgroundImage: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: -50,
    opacity: 0.3,
  },
  backgroundImageContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: -50,
  },
  blurOverlay: {
    position: "absolute",
    top: -50,
    left: 0,
    right: 0,
    bottom: -50,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
  },
  container: {
    flex: 1,
    paddingHorizontal: 15,
  },
  headerSection: {
    marginBottom: 20,
    position: "relative",
  },
  titleContainer: {
    alignItems: "center",
  },
  statusIconRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 8,
  },
  statusTitle: {
    fontSize: 55,
    fontFamily: "Bebas",
    color: "#FFFFFF",
    letterSpacing: 1,
  },
  gameSubtitle: {
    fontSize: 14,
    color: "rgba(255,255,255,0.7)",
    fontWeight: "500",
    textAlign: "center",
    letterSpacing: 0.3,
  },
  content: {
    paddingTop: 15,
    paddingBottom: 20,
  },
  centered: {
    justifyContent: "center",
    alignItems: "center",
  },
  confetti: {
    position: "absolute",
    width: 300,
    height: 300,
    zIndex: 10,
    top: -150,
  },
  loadingText: {
    fontSize: 18,
    marginTop: 15,
    opacity: 0.7,
    fontWeight: "bold",
  },
  errorText: {
    fontSize: 18,
    color: "#ff4444",
    textAlign: "center",
    marginBottom: 20,
    fontWeight: "bold",
  },
  dashboardContainer: {
    marginBottom: 24,
  },
  dashboardCard: {
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 25,
    padding: 15,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },
  statRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  statBlock: {
    flex: 1,
    alignItems: "center",
  },
  statHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    marginBottom: 8,
  },
  statTitle: {
    fontSize: 10,
    flexWrap: "nowrap",
    fontWeight: "600",
    color: "rgba(255,255,255,0.8)",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  statValue: {
    fontSize: 35,
    fontWeight: "bold",
    fontFamily: "Bebas",
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: "rgba(255,255,255,0.2)",
    marginHorizontal: 15,
  },
  playersContainer: {
    marginBottom: 30,
  },
  playersTitle: {
    fontSize: 32,
    fontFamily: "Bebas",
    marginBottom: 16,
    color: "#FFFFFF",
    letterSpacing: 1,
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  playersGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    justifyContent: "flex-start",
  },
  playerChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 25,
    paddingVertical: 8,
    paddingHorizontal: 8,
    paddingRight: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
    gap: 8,
    marginBottom: 8,
  },
  playerChipName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
    letterSpacing: 0.2,
  },
  avatarContainer: {
    position: "relative",
  },
  playerStatusIndicator: {
    position: "absolute",
    bottom: -1,
    right: -1,
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 1.5,
    borderColor: "white",
    alignItems: "center",
    justifyContent: "center",
  },
  finishedIndicator: {
    backgroundColor: "#4CAF50",
  },
  inProgressIndicator: {
    backgroundColor: "#FF9800",
  },
  chipMetrics: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  chipPickCount: {
    fontSize: 12,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  chipStatusBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  finishedChipBadge: {
    backgroundColor: "rgba(76, 175, 80, 0.2)",
    borderColor: "rgba(76, 175, 80, 0.5)",
  },
  inProgressChipBadge: {
    backgroundColor: "rgba(255, 152, 0, 0.2)",
    borderColor: "rgba(255, 152, 0, 0.5)",
  },
  playerMetrics: {
    alignItems: "center",
    gap: 8,
  },
  metricItem: {
    alignItems: "center",
  },
  metricIconContainer: {
    marginBottom: 4,
  },
  metricNumber: {
    fontSize: 28,
    fontWeight: "bold",
    fontFamily: "Bebas",
    color: "#FFFFFF",
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  metricLabel: {
    fontSize: 11,
    opacity: 0.8,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    color: "#E0E0E0",
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  finishedBadge: {
    backgroundColor: "rgba(76, 175, 80, 0.15)",
    borderColor: "rgba(76, 175, 80, 0.4)",
  },
  inProgressBadge: {
    backgroundColor: "rgba(255, 152, 0, 0.15)",
    borderColor: "rgba(255, 152, 0, 0.4)",
  },
  statusText: {
    fontSize: 10,
    fontWeight: "600",
    letterSpacing: 0.3,
  },
  finishedText: {
    color: "#4CAF50",
  },
  inProgressText: {
    color: "#FF9800",
  },
  matchesContainer: {
    marginBottom: 30,
  },
  matchesTitle: {
    fontSize: 35,
    fontFamily: "Bebas",
  },
  movieRow: {
    justifyContent: "space-between",
    marginBottom: 15,
  },
  movieThumbnailContainer: {
    marginBottom: 15,
  },
  movieThumbnail: {
    width: "100%",
    aspectRatio: 2 / 3,
    borderRadius: 10,
  },
  movieTitleSmall: {
    fontSize: 12,
    fontWeight: "bold",
  },
  absoluteButtonContainer: {
    position: "absolute",
    left: 15,
    right: 15,
    zIndex: 10,
  },
  backButton: {
    borderRadius: 100,
  },
  backButtonContent: {
    paddingVertical: 7.5,
  },
});
