import { CommonActions, useNavigation } from "@react-navigation/native";
import LottieView from "lottie-react-native";
import { useContext, useEffect, useState } from "react";
import { Dimensions, FlatList, ScrollView, StyleSheet, View } from "react-native";
import { Avatar, Button, MD2DarkTheme, Text, TouchableRipple, useTheme } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Movie } from "../../../types";
import { FancySpinner } from "../../components/FancySpinner";
import { AVATAR_COLORS } from "../../components/Home/ActiveUsers";
import Thumbnail from "../../components/Thumbnail";
import { addToGroup, removeFromGroup } from "../../redux/favourites/favourites";
import { roomActions } from "../../redux/room/roomSlice";
import { useAppDispatch, useAppSelector } from "../../redux/store";
import { SocketContext } from "../../service/SocketContext";
import useTranslation from "../../service/useTranslation";

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

export default function GameSummary({ route }: any) {
  const { roomId } = route.params;
  const navigation = useNavigation<any>();
  const dispatch = useAppDispatch();
  const theme = useTheme();
  const { socket } = useContext(SocketContext);
  const t = useTranslation();

  const [summary, setSummary] = useState<GameSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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
    // Clean up room state when component unmounts
    return () => {
      dispatch(roomActions.reset());
    };
  }, [dispatch]);

  const handleBackToHome = () => {
    dispatch(roomActions.reset());
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: "Landing" }],
      })
    );
  };

  const renderMovieItem = ({ item }: { item: Partial<Movie> }) => {
    return <MatchedItem {...item} summary={summary!} />;
  };

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

  return (
    <View style={{ flex: 1 }}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <View style={styles.statusContainer}>
            {summary?.gameEndReason === "all_users_finished" && (
              <LottieView source={require("../../assets/confetti.json")} autoPlay loop={false} style={styles.confetti} />
            )}
            <Text style={[styles.statusText, { color: theme.colors.primary }]}>
              {summary?.gameEndReason === "all_users_finished" ? t("game-summary.game-completed") : t("game-summary.game-finished")}
            </Text>

            {summary && (
              <Text style={styles.configText}>
                {summary.maxRounds} {t("game-summary.rounds")} •{" "}
                {summary.type === "movie" ? t("game-summary.movies") : t("game-summary.tv-shows")} • {t("game-summary.room")}
                {summary.roomId || roomId}
              </Text>
            )}
          </View>

          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: theme.colors.primary }]}>{summary?.totalUsers || 0}</Text>
              <Text style={styles.statLabel}>{t("game-summary.players")}</Text>
            </View>

            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: theme.colors.primary }]}>{summary?.totalMatches || 0}</Text>
              <Text style={styles.statLabel}>{t("game-summary.matches")}</Text>
            </View>

            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: theme.colors.primary }]}>
                {summary?.users?.reduce((total, user) => total + user.totalPicks, 0) || 0}
              </Text>
              <Text style={styles.statLabel}>{t("game-summary.total-picks")}</Text>
            </View>
          </View>

          {summary?.users && (
            <View style={styles.playersContainer}>
              <Text style={styles.playersTitle}>{t("game-summary.player-performance")}</Text>
              {summary.users.map((user, index) => (
                <View key={index} style={styles.playerItem}>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                    <Avatar.Text
                      size={24}
                      label={user.username?.[0].toUpperCase() || "U"}
                      color="white"
                      style={{
                        borderWidth: 0.5,
                        borderColor: "#fff",
                        backgroundColor: AVATAR_COLORS[index % AVATAR_COLORS.length],
                      }}
                    />
                    <Text style={styles.playerName}>{user.username}</Text>
                  </View>
                  <View style={styles.playerStats}>
                    <Text style={[styles.playerStatus, { color: user.finished ? "#4CAF50" : "#ff4444" }]}>{user.finished ? "✓" : "✗"}</Text>
                    <Text style={styles.pickCount}>
                      {user.totalPicks} {t("game-summary.picks")}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          )}

          {summary?.matchedMovies && summary.matchedMovies.length > 0 && (
            <View style={styles.matchesContainer}>
              <Text style={styles.matchesTitle}>{t("game-summary.matched-movies")}</Text>
              <FlatList
                data={summary.matchedMovies}
                renderItem={renderMovieItem}
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

const MatchedItem = ({ summary, ...item }: Partial<Movie> & { summary: { type: string } }) => {
  const navigation = useNavigation<any>();
  const screenWidth = Dimensions.get("window").width;
  const itemWidth = (screenWidth - 60) / 3;
  const dispatch = useAppDispatch();

  const { groups } = useAppSelector((state) => state.favourite);
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
    <View style={[styles.movieThumbnailContainer, { width: itemWidth, gap: 5, justifyContent: "space-between" }]}>
      <TouchableRipple
        onPress={() =>
          navigation.navigate("MovieDetails", {
            id: item.id,
            type: summary?.type || "movie",
            img: item.poster_path,
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
  container: {
    flex: 1,
    paddingHorizontal: 15,
  },
  statusContainer: {
    alignItems: "center",
    marginBottom: 30,
    position: "relative",
  },
  statusText: {
    fontSize: 64,
    fontFamily: "Bebas",
    marginBottom: 15,
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
  configText: {
    fontSize: 14,
    opacity: 0.7,
    fontWeight: "bold",
    textAlign: "center",
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
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 30,
  },
  statItem: {
    alignItems: "center",
  },
  statNumber: {
    fontSize: 48,
    fontWeight: "bold",
    fontFamily: "Bebas",
  },
  statLabel: {
    fontSize: 16,
    opacity: 0.7,
    marginTop: 5,
    fontWeight: "bold",
  },
  playersContainer: {
    marginBottom: 30,
  },
  playersTitle: {
    fontSize: 35,
    fontFamily: "Bebas",
    marginBottom: 15,
  },
  playerItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 15,
    marginBottom: 10,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 10,
  },
  playerName: {
    fontSize: 18,
    fontWeight: "bold",
  },
  playerStats: {
    flexDirection: "row",
    alignItems: "center",
    gap: 15,
  },
  playerStatus: {
    fontSize: 18,
    fontWeight: "bold",
  },
  pickCount: {
    fontSize: 16,
    opacity: 0.7,
    fontWeight: "bold",
  },
  matchesContainer: {
    marginBottom: 30,
  },
  matchesTitle: {
    fontSize: 35,
    fontFamily: "Bebas",
    marginBottom: 15,
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
