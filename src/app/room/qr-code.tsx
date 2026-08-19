import Button from "../../components/Button";
import Text from "../../components/Text";
import { router, Link } from "expo-router";
import { useLocalSearchParams } from "expo-router";
import { useContext, useEffect, useRef, useState, useTransition } from "react";
import { View, StyleSheet } from "react-native";

import { colors, radius, spacing } from "../../constants/design";
import PrimaryButton from "../../components/PrimaryButton";
import QrCodeBox from "../../components/GameLobby/QrCodeBox";
import PlayersRow from "../../components/GameLobby/PlayersRow";
import LobbyShell from "../../components/GameLobby/LobbyShell";
import { Movie } from "../../../types";
import PageHeading from "../../components/PageHeading";
import { roomActions } from "../../redux/room/roomSlice";
import { useAppDispatch, useAppSelector } from "../../redux/store";
import { SocketContext } from "../../context/SocketContext";
import useTranslation from "../../service/useTranslation";
import { FancySpinner } from "../../components/FancySpinner";
import Animated, { FadeInDown } from "react-native-reanimated";
import { hash } from "../../utils/hash";
import {
  useGetMovieCategoriesWithThumbnailsQuery,
  useGetTVCategoriesWithThumbnailsQuery,
} from "../../redux/movie/movieApi";
import { useFilterPreferences } from "../../hooks/useFilterPreferences";
import { reset } from "../../redux/roomBuilder/roomBuilderSlice";
import { useBlockedMovies } from "../../hooks/useBlockedMovies";
import { useSuperLikedMovies } from "../../hooks/useSuperLikedMovies";
import { Platform } from "react-native";

const SYNC_PHRASES = [
  "Calculating scores...",
  "Finding best movies...",
  "Syncing your library...",
  "Curating your picks...",
  "Analyzing taste profiles...",
  "Getting the best results...",
];

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
  const [isRefetching, setIsRefetching] = useState(false);
  const [syncPhraseIndex, setSyncPhraseIndex] = useState(0);
  const hashOptionsRef = useRef<string>("");
  const [isPending, startTransition] = useTransition();
  const { qrCode, nickname } = useAppSelector((state) => state.room);
  const users = useAppSelector((state) => state.room.users);
  const roomId = useAppSelector((state) => state.room.roomId);
  const existingMovies = useAppSelector((state) => state.room.movies);

  const { preferences } = useFilterPreferences();
  const movieCategoriesQuery = useGetMovieCategoriesWithThumbnailsQuery();
  const tvCategoriesQuery = useGetTVCategoriesWithThumbnailsQuery();
  const { getBlockedIds, isReady: blockedReady } = useBlockedMovies();
  const { getSuperLikedIds, isReady: superLikedReady } = useSuperLikedMovies();

  const [roomConfig, setRoomConfig] = useState<any>(null);
  const [createRoomLoading, setCreateRoomLoading] = useState(false);

  useEffect(() => {
    if (roomConfig) return;

    if (params?.quickStart) {
      if (movieCategoriesQuery.data && tvCategoriesQuery.data) {
        const movieCats = movieCategoriesQuery.data.slice(0, 3);
        const tvCats = tvCategoriesQuery.data.slice(0, 2);

        const randomMovie =
          movieCats[Math.floor(Math.random() * movieCats.length)];
        const randomSeries = tvCats[Math.floor(Math.random() * tvCats.length)];
        const chosen = Math.random() < 0.5 ? randomMovie : randomSeries;

        setRoomConfig({
          type: chosen.path,
          genre: [],
          nickname,
          providers: preferences?.providers || [],
          maxRounds: 3,
          specialCategories: [],
          quickStart: true,
        });
      }
    } else {
      const roomSetup = params.roomSetup
        ? (JSON.parse(params.roomSetup as string) as RoomSetupParams)
        : undefined;

      if (roomSetup) {
        setRoomConfig({
          type: roomSetup.category,
          genre: roomSetup.genre?.map((g) => g.id) || [],
          nickname,
          providers: roomSetup.providers || [],
          maxRounds: roomSetup.maxRounds || 6,
          specialCategories: roomSetup.specialCategories || [],
          quickStart: false,
        });
      }
    }
  }, [
    roomConfig,
    params,
    movieCategoriesQuery.data,
    tvCategoriesQuery.data,
    preferences,
    nickname,
  ]);

  useEffect(() => {
    if (existingMovies && existingMovies.length > 0) {
      setMoviesCount(existingMovies.length);
      setIsLoadingMovies(false);
    }
  }, []);

  // Clear hash on socket reconnect so create-room/update-config is re-emitted
  useEffect(() => {
    if (!socket) return;
    hashOptionsRef.current = "";
  }, [socket]);

  useEffect(() => {
    if (
      !roomConfig ||
      !socket ||
      !nickname ||
      !blockedReady ||
      !superLikedReady
    )
      return;

    const configHash = hash(JSON.stringify(roomConfig)).toString();

    if (hashOptionsRef.current === configHash) {
      return;
    }

    hashOptionsRef.current = configHash;

    (async () => {
      try {
        const [blockedMovies, superLikedMovies] = await Promise.all([
          getBlockedIds(),
          getSuperLikedIds(),
        ]);

        const mappedBlocked = blockedMovies.map(
          (movie) => `${movie.type === "movie" ? "m" : "t"}${movie.id}`,
        );
        const mappedSuperLiked = superLikedMovies.map(
          (movie) => `${movie.type === "movie" ? "m" : "t"}${movie.id}`,
        );

        if (qrCode && roomId) {
          if (existingMovies.length === 0) {
            setIsLoadingMovies(true);
            setMoviesCount(null);
          }
          socket.emit("room:update-config", {
            roomId: roomId.toUpperCase(),
            config: {
              ...roomConfig,
              blockedMovies: mappedBlocked,
              superLikedMovies: mappedSuperLiked,
            },
          });
          return;
        }

        setCreateRoomLoading(true);
        setIsLoadingMovies(true);

        const response = (await socket.emitWithAck("create-room", {
          ...roomConfig,
          blockedMovies: mappedBlocked,
          superLikedMovies: mappedSuperLiked,
        })) as ISocketResponse;

        if (response) {
          dispatch(roomActions.setRoom(response.details));
          dispatch(roomActions.setQRCode(response.roomId));
          socket.emit(
            "join-room",
            response.roomId.toUpperCase(),
            nickname,
            mappedBlocked,
            mappedSuperLiked,
          );
        }
      } catch (error) {
        console.error("Error creating room:", error);
        hashOptionsRef.current = "";
        setIsLoadingMovies(false);
      } finally {
        setCreateRoomLoading(false);
      }
    })();
  }, [
    roomConfig,
    socket,
    nickname,
    qrCode,
    roomId,
    blockedReady,
    superLikedReady,
  ]);

  useEffect(() => {
    if (!socket) return;

    const handleActive = (users: string[]) => {
      dispatch(roomActions.setActiveUsers(users));
    };

    const handleMovies = ({
      movies,
      index,
    }: {
      movies: Movie[];
      index?: number;
    }) => {
      setMoviesCount(movies.length);
      setIsLoadingMovies(false);
      if (!!movies) dispatch(roomActions.addMovies({ movies, index }));
    };

    const handleRefetching = ({ refetching }: { refetching: boolean }) => {
      setIsRefetching(refetching);
      setIsLoadingMovies(refetching);
      if (refetching) setMoviesCount(null);
    };

    socket.on("active", handleActive);
    socket.on("movies", handleMovies);
    socket.on("room:refetching", handleRefetching);

    return () => {
      socket.off("active", handleActive);
      socket.off("movies", handleMovies);
      socket.off("room:refetching", handleRefetching);
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

  useEffect(() => {
    if (!isRefetching) {
      setSyncPhraseIndex(0);
      return;
    }
    const id = setInterval(
      () => setSyncPhraseIndex((i) => (i + 1) % SYNC_PHRASES.length),
      2200,
    );
    return () => clearInterval(id);
  }, [isRefetching]);

  const startGameHref = (() => {
    if (!qrCode) return "#";
    const gameType = roomConfig?.type?.includes("/tv") ? "tv" : "movie";
    return {
      pathname: "/room/[roomId]",
      params: { roomId: qrCode.toUpperCase(), type: gameType },
    } as const;
  })();

  const handleStartGame = () => {
    if (!qrCode) return;
    startTransition(() => {
      socket?.emit("room:start", roomId);
      dispatch(roomActions.setPlaying(true));
      dispatch(reset());
    });
  };

  const isDisabled =
    !qrCode ||
    isLoadingMovies ||
    (moviesCount != null && moviesCount < 5) ||
    createRoomLoading ||
    isPending;

  return (
    <View style={styles.container}>
      <PageHeading
        showGradientBackground={false}
        useSafeArea={false}
        title={t("room.qr-title") as string}
        onPress={() =>
          router.canGoBack() ? router.back() : router.replace("/(tabs)")
        }
      />

      <LobbyShell
        bottomContent={
          <>
            <View
              style={{
                width: "100%",
                alignItems: "center",
                height: 20,
              }}
            >
              {isLoadingMovies && !isRefetching ? (
                <Text style={styles.infoText}>Checking available movies...</Text>
              ) : moviesCount === 0 ? (
                <Text style={styles.warningText}>{t("room.too-restricted")}</Text>
              ) : moviesCount != null && moviesCount < 5 ? (
                <Text style={styles.warningText}>
                  {t("room.lower-results-count", { count: moviesCount })}
                </Text>
              ) : null}
            </View>

            <PlayersRow
              players={users.map((nick) => ({ id: nick, name: nick }))}
              waitingLabel={t("room.waiting-for-players")}
            />
          </>
        }
        actions={
          <View style={styles.actionRow}>
            <Button
              mode="outlined"
              disabled={!qrCode}
              icon="account-multiple-plus"
              compact
              style={styles.inviteButton}
              onPress={() =>
                router.push({
                  pathname: "/invite-players",
                  params: { roomId: qrCode, gameType: "swipe" },
                })
              }
            >
              {""}
            </Button>

            <Link
              href={startGameHref}
              asChild
              disabled={isDisabled}
              onPress={handleStartGame}
            >
              <PrimaryButton
                disabled={isDisabled}
                style={styles.startButton}
              >
                {isRefetching
                  ? SYNC_PHRASES[syncPhraseIndex]
                  : isLoadingMovies
                    ? "Loading..."
                    : moviesCount === 0
                      ? t("room.too-restricted")
                      : users.length === 1
                        ? t("room.play-alone")
                        : t("room.start")}
              </PrimaryButton>
            </Link>
          </View>
        }
      >
        {createRoomLoading ? (
          <Animated.View entering={FadeInDown} style={styles.loadingContainer}>
            <FancySpinner size={100} />
            <Text style={styles.loadingText}>Creating room...</Text>
          </Animated.View>
        ) : (
          qrCode && (
            <Animated.View entering={FadeInDown} style={{ flex: 1 }}>
              <QrCodeBox code={qrCode} scheme="room" webPath="swipe" />
            </Animated.View>
          )
        )}
      </LobbyShell>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.appBackground,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: colors.text,
    marginTop: spacing.xl,
  },
  warningText: {
    color: "#ff6b6b",
  },
  infoText: {
    color: "#888",
    fontStyle: "italic",
  },
  startButton: {
    borderRadius: radius.pill,
    flex: 3,
  },
  startButtonContent: {
    paddingVertical: spacing.sm,
  },
  actionRow: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  inviteButton: {
    borderRadius: radius.pill,
    width: 48,
    height: 48,
  },
});
