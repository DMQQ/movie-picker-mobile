import { useNavigation } from "@react-navigation/native";
import LottieView from "lottie-react-native";
import { useContext, useEffect, useState } from "react";
import { Dimensions, FlatList, ScrollView, StyleSheet, View } from "react-native";
import { Button, Text, TouchableRipple, useTheme } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { FancySpinner } from "../../components/FancySpinner";
import SafeIOSContainer from "../../components/SafeIOSContainer";
import Thumbnail from "../../components/Thumbnail";
import { roomActions } from "../../redux/room/roomSlice";
import { useAppDispatch } from "../../redux/store";
import { SocketContext } from "../../service/SocketContext";

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

  const [summary, setSummary] = useState<GameSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const insets = useSafeAreaInsets();

  // Fetch game summary when component mounts
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
        setError("Failed to load game summary");
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
    navigation.navigate("Landing");
  };

  const renderMovieItem = ({ item }: { item: any }) => {
    const screenWidth = Dimensions.get("window").width;
    const itemWidth = (screenWidth - 60) / 3; // 15px padding on each side + 15px gaps between items

    return (
      <TouchableRipple
        style={[styles.movieThumbnailContainer, { width: itemWidth }]}
        onPress={() =>
          navigation.navigate("MovieDetails", {
            id: item.id,
            type: summary?.type || "movie",
            img: item.poster_path,
          })
        }
      >
        <View>
          <Thumbnail size={200} path={item.poster_path} style={styles.movieThumbnail} />
          <Text style={styles.movieTitleSmall} numberOfLines={2}>
            {item.title}
          </Text>
        </View>
      </TouchableRipple>
    );
  };

  if (loading) {
    return (
      <SafeIOSContainer>
        <View style={[styles.container, styles.centered]}>
          <FancySpinner size={80} />
          <Text style={styles.loadingText}>Loading game summary...</Text>
        </View>
      </SafeIOSContainer>
    );
  }

  if (error) {
    return (
      <SafeIOSContainer>
        <View style={[styles.container, styles.centered]}>
          <Text style={styles.errorText}>Error: {error}</Text>
          <Button mode="contained" onPress={handleBackToHome} style={styles.backButton}>
            Back to Home
          </Button>
        </View>
      </SafeIOSContainer>
    );
  }

  return (
    <SafeIOSContainer>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <View style={styles.statusContainer}>
            {summary?.gameEndReason === "all_users_finished" && (
              <LottieView source={require("../../assets/confetti.json")} autoPlay loop={false} style={styles.confetti} />
            )}
            <Text style={[styles.statusText, { color: theme.colors.primary }]}>
              {summary?.gameEndReason === "all_users_finished" ? "Game Completed!" : "Game finished!"}
            </Text>

            {summary && (
              <Text style={styles.configText}>
                {summary.maxRounds} rounds • {summary.type === "movie" ? "Movies" : "TV Shows"} • Room: {summary.roomId || roomId}
              </Text>
            )}
          </View>

          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: theme.colors.primary }]}>{summary?.totalUsers || 0}</Text>
              <Text style={styles.statLabel}>Players</Text>
            </View>

            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: theme.colors.primary }]}>{summary?.totalMatches || 0}</Text>
              <Text style={styles.statLabel}>Matches</Text>
            </View>

            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: theme.colors.primary }]}>
                {summary?.users?.reduce((total, user) => total + user.totalPicks, 0) || 0}
              </Text>
              <Text style={styles.statLabel}>Total Picks</Text>
            </View>
          </View>

          {summary?.users && (
            <View style={styles.playersContainer}>
              <Text style={styles.playersTitle}>Player Performance:</Text>
              {summary.users.map((user, index) => (
                <View key={index} style={styles.playerItem}>
                  <Text style={styles.playerName}>{user.username}</Text>
                  <View style={styles.playerStats}>
                    <Text style={[styles.playerStatus, { color: user.finished ? "#4CAF50" : "#ff4444" }]}>{user.finished ? "✓" : "✗"}</Text>
                    <Text style={styles.pickCount}>{user.totalPicks} picks</Text>
                  </View>
                </View>
              ))}
            </View>
          )}

          {summary?.matchedMovies && summary.matchedMovies.length > 0 && (
            <View style={styles.matchesContainer}>
              <Text style={styles.matchesTitle}>Matched Movies</Text>
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
          Back to Home
        </Button>
      </View>
    </SafeIOSContainer>
  );
}

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
    marginTop: 5,
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
