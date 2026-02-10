import { FontAwesome, MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useLocalSearchParams } from "expo-router";
import { memo, useContext, useEffect, useRef, useState, useTransition } from "react";
import { Dimensions, Platform, Share, View, StyleSheet } from "react-native";
import { Avatar, Button, Text, useTheme } from "react-native-paper";
import QRCode from "react-native-qrcode-svg";
import { Movie } from "../../../types";
import { AVATAR_COLORS } from "../../components/Home/ActiveUsers";
import PageHeading from "../../components/PageHeading";
import { roomActions } from "../../redux/room/roomSlice";
import { useAppDispatch, useAppSelector } from "../../redux/store";
import { SocketContext } from "../../context/SocketContext";
import useTranslation from "../../service/useTranslation";
import { FancySpinner } from "../../components/FancySpinner";
import Animated, { FadeInDown } from "react-native-reanimated";
import { hash } from "../../utils/hash";
import { useGetMovieCategoriesWithThumbnailsQuery, useGetTVCategoriesWithThumbnailsQuery } from "../../redux/movie/movieApi";
import { useFilterPreferences } from "../../hooks/useFilterPreferences";
import { reset } from "../../redux/roomBuilder/roomBuilderSlice";

interface RoomSetupParams {
  category: string;
  maxRounds: number;
  genre: { id: number; name: string }[];
  providers: number[];
  specialCategories: string[];
  cacheKey?: string;
}

interface ISocketResponse {
  roomId: string;
  details: {
    type: "movie" | "tv";
    page: number;
    genres: number[];
    host: string;
    id: string;
    users: string[];
  };
}

export default function QRCodePage() {
  const params = useLocalSearchParams();
  const dispatch = useAppDispatch();
  const { socket } = useContext(SocketContext);
  const t = useTranslation();
  const [moviesCount, setMoviesCount] = useState<number | null>(null);
  const [isLoadingMovies, setIsLoadingMovies] = useState(false);
  const hashOptionsRef = useRef<string>("");
  const [isPending, startTransition] = useTransition();
  const { qrCode, nickname } = useAppSelector((state) => state.room);
  const users = useAppSelector((state) => state.room.room.users);
  const roomId = useAppSelector((state) => state.room.room.roomId);
  const existingMovies = useAppSelector((state) => state.room.room.movies);

  const { preferences } = useFilterPreferences();
  const movieCategoriesQuery = useGetMovieCategoriesWithThumbnailsQuery();
  const tvCategoriesQuery = useGetTVCategoriesWithThumbnailsQuery();

  const [roomConfig, setRoomConfig] = useState<any>(null);
  const [createRoomLoading, setCreateRoomLoading] = useState(false);

  useEffect(() => {
    if (roomConfig) return;

    if (params?.quickStart) {
      if (movieCategoriesQuery.data && tvCategoriesQuery.data) {
        const movieCats = movieCategoriesQuery.data.slice(0, 3);
        const tvCats = tvCategoriesQuery.data.slice(0, 3);

        const randomMovie = movieCats[Math.floor(Math.random() * movieCats.length)];
        const randomSeries = tvCats[Math.floor(Math.random() * tvCats.length)];
        const chosen = Math.random() < 0.5 ? randomMovie : randomSeries;

        setRoomConfig({
          type: chosen.path,
          genre: [],
          nickname,
          providers: preferences?.providers || [],
          maxRounds: 3,
          specialCategories: [],
        });
      }
    } else {
      const roomSetup = params.roomSetup ? (JSON.parse(params.roomSetup as string) as RoomSetupParams) : undefined;

      if (roomSetup) {
        setRoomConfig({
          type: roomSetup.category,
          genre: roomSetup.genre?.map((g) => g.id) || [],
          nickname,
          providers: roomSetup.providers || [],
          maxRounds: roomSetup.maxRounds || 6,
          specialCategories: roomSetup.specialCategories || [],
        });
      }
    }
  }, [roomConfig, params, movieCategoriesQuery.data, tvCategoriesQuery.data, preferences, nickname]);

  useEffect(() => {
    if (existingMovies && existingMovies.length > 0) {
      setMoviesCount(existingMovies.length);
      setIsLoadingMovies(false);
    }
  }, []);

  useEffect(() => {
    if (!roomConfig || !socket || !nickname) return;

    const configHash = hash(JSON.stringify(roomConfig)).toString();

    if (hashOptionsRef.current === configHash) {
      return;
    }

    hashOptionsRef.current = configHash;

    (async () => {
      try {
        if (qrCode && roomId) {
          if (existingMovies.length === 0) {
            setIsLoadingMovies(true);
            setMoviesCount(null);
          }
          console.log("Updating room with config:", roomConfig);
          socket.emit("room:update-config", { roomId, config: roomConfig });
          return;
        }

        setCreateRoomLoading(true);
        setIsLoadingMovies(true);

        const response = (await socket.emitWithAck("create-room", roomConfig)) as ISocketResponse;
        console.log("Room created with response:", response);

        if (response) {
          dispatch(roomActions.setRoom(response.details));
          dispatch(roomActions.setQRCode(response.roomId));
          socket.emit("join-room", response.roomId, nickname);
        }
      } catch (error) {
        console.error("Error creating room:", error);
        hashOptionsRef.current = "";
        setIsLoadingMovies(false);
      } finally {
        setCreateRoomLoading(false);
      }
    })();
  }, [roomConfig, socket, nickname, qrCode, roomId]);

  useEffect(() => {
    if (!socket) return;

    const handleActive = (users: string[]) => {
      dispatch(roomActions.setActiveUsers(users));
    };

    const handleMovies = ({ movies }: { movies: Movie[] }) => {
      setMoviesCount(movies.length);
      setIsLoadingMovies(false);
      if (!!movies) dispatch(roomActions.addMovies(movies));
    };

    socket.on("active", handleActive);
    socket.on("movies", handleMovies);

    return () => {
      socket.off("active", handleActive);
      socket.off("movies", handleMovies);
    };
  }, [socket]);

  useEffect(() => {
    if (!isLoadingMovies) return;

    const timeout = setTimeout(() => {
      if (moviesCount === null) {
        setMoviesCount(0);
        setIsLoadingMovies(false);
      }
    }, 10000);

    return () => clearTimeout(timeout);
  }, [isLoadingMovies, moviesCount]);

  const onJoinOwnRoom = (code: string) => {
    startTransition(() => {
      socket?.emit("room:start", roomId);
      dispatch(roomActions.setPlaying(true));

      let gameType = "movie";
      if (roomConfig) {
        gameType = roomConfig.type?.includes("/tv") ? "tv" : "movie";
      }

      router.replace({
        pathname: "/room/[roomId]",
        params: {
          roomId: code,
          type: gameType,
        },
      });

      dispatch(reset());
    });
  };

  return (
    <View style={styles.container}>
      <PageHeading showGradientBackground={false} useSafeArea={false} title={t("room.qr-title")} />
      <View style={[styles.contentContainer, Platform.OS === "android" && styles.contentContainerAndroid]}>
        {createRoomLoading ? (
          <Animated.View entering={FadeInDown} style={styles.loadingContainer}>
            <FancySpinner size={100} />
            <Text style={styles.loadingText}>Creating room...</Text>
          </Animated.View>
        ) : (
          qrCode && (
            <Animated.View entering={FadeInDown} style={styles.qrCodeContainer}>
              <QrCodeBox code={qrCode} />
            </Animated.View>
          )
        )}
      </View>
      <View style={styles.bottomSection}>
        <View style={styles.activeUsersRow}>
          <Text style={styles.activeUsersLabel}>{t("room.active")}:</Text>
          <View style={styles.avatarsContainer}>
            {users.map((nick, index) => (
              <View key={nick + index} style={styles.avatarWrapper}>
                <Avatar.Text size={25} label={nick[0].toUpperCase()} style={{ backgroundColor: AVATAR_COLORS[index % 5] }} />
              </View>
            ))}
          </View>
        </View>

        {isLoadingMovies ? (
          <Text style={styles.infoText}>Checking available movies...</Text>
        ) : moviesCount === 0 ? (
          <Text style={styles.warningText}>{t("room.too-restricted")}</Text>
        ) : moviesCount != null && moviesCount < 15 ? (
          <Text style={styles.warningText}>{t("room.lower-results-count", { count: moviesCount })}</Text>
        ) : null}

        <Button
          disabled={!qrCode || isLoadingMovies || (moviesCount != null && moviesCount < 5) || createRoomLoading || isPending}
          mode="contained"
          style={styles.startButton}
          contentStyle={styles.startButtonContent}
          onPress={() => {
            onJoinOwnRoom(qrCode);
          }}
        >
          {isLoadingMovies ? "Loading..." : moviesCount === 0 ? t("room.too-restricted") : "Start"}
        </Button>
      </View>
    </View>
  );
}

const TutorialTips = () => {
  const theme = useTheme();
  const t = useTranslation();

  const tips = [
    {
      icon: "camera" as const,
      text: t("room.tutorial.native-camera"),
    },
    {
      icon: "qrcode-scan" as const,
      text: t("room.tutorial.in-app-scanner"),
    },
    {
      icon: "account-multiple-plus" as const,
      text: t("room.tutorial.join-during-game"),
    },
  ];

  return (
    <View style={styles.tutorialContainer}>
      {tips.map((tip, index) => (
        <View key={index} style={styles.tipRow}>
          <View style={[styles.tipIconContainer, { backgroundColor: theme.colors.primary + "20" }]}>
            <MaterialCommunityIcons name={tip.icon} size={20} color={theme.colors.primary} />
          </View>
          <Text style={styles.tipText}>{tip.text}</Text>
        </View>
      ))}
    </View>
  );
};

const QrCodeBox = memo(({ code }: { code: string }) => {
  const theme = useTheme();
  const t = useTranslation();

  const shareCode = async (code: string) => {
    Share.share({
      message: t("room.share.message", { code }),
      title: t("room.share.title"),
      url: "https://movie.dmqq.dev/swipe/" + code.toUpperCase(),
    });
  };

  return (
    <View style={styles.qrBoxContainer}>
      <View
        style={[
          styles.qrCodeWrapper,
          {
            borderColor: theme.colors.primary,
            backgroundColor: theme.colors.surface,
            shadowColor: theme.colors.primary,
          },
        ]}
      >
        <QRCode
          backgroundColor={theme.colors.surface}
          color={theme.colors.primary}
          value={`flickmate://room/${code}`}
          size={Dimensions.get("screen").width * 0.6}
        />
      </View>

      <Button
        onPress={async () => {
          shareCode(code);
        }}
        style={styles.shareButton}
      >
        {!!code && code.length > 0 ? (
          <>
            {code.split("").map((char, index) => (
              <Text key={index} style={styles.codeChar}>
                {char}
              </Text>
            ))}
          </>
        ) : (
          <Text style={{ color: "#fff" }}>Loading</Text>
        )}
      </Button>
      <Text style={styles.shareButtonText}>
        {t("room.share.button")} <FontAwesome name="share" size={14} color={theme.colors.primary} />
      </Text>

      <TutorialTips />
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  contentContainer: {
    position: "relative",
    flex: 1,
    paddingHorizontal: 15,
  },
  contentContainerAndroid: {
    marginTop: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: "#fff",
    marginTop: 20,
  },
  qrCodeContainer: {
    flex: 1,
  },
  bottomSection: {
    paddingHorizontal: 15,
    paddingTop: 15,
    gap: 7.5,
  },
  activeUsersRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    height: 25,
    alignItems: "center",
  },
  activeUsersLabel: {
    fontSize: 16,
  },
  avatarsContainer: {
    flexDirection: "row",
    gap: 5,
  },
  avatarWrapper: {
    flexDirection: "row",
    backgroundColor: "#000",
    gap: 5,
    borderRadius: 100,
    alignItems: "center",
  },
  warningText: {
    color: "#ff6b6b",
  },
  infoText: {
    color: "#888",
    fontStyle: "italic",
  },
  startButton: {
    borderRadius: 100,
    marginTop: 10,
    marginBottom: 15,
  },
  startButtonContent: {
    padding: 7.5,
  },
  tutorialContainer: {
    marginTop: 15,
    paddingHorizontal: 10,
    gap: 10,
  },
  tipRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    width: "80%",
  },
  tipIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    color: "#fff",
    opacity: 0.85,
  },
  qrBoxContainer: {
    justifyContent: "center",
    alignItems: "center",
    flex: 1,
  },
  qrCodeWrapper: {
    padding: 15,
    borderWidth: 5,
    borderRadius: 20,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 10,
  },
  shareButton: {
    marginTop: 10,
  },
  codeRow: {
    flexDirection: "row",
    gap: 5,
    justifyContent: "center",
    alignItems: "center",
  },
  codeChar: {
    fontSize: 20,
    fontWeight: "bold",
  },
  shareButtonText: {
    opacity: 0.7,
    textAlign: "center",
  },
});
