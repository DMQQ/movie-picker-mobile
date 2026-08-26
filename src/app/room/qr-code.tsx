import Button from "../../components/Button";
import Text from "../../components/Text";
import { router, Link } from "expo-router";
import { useLocalSearchParams } from "expo-router";
import { useContext, useEffect, useRef, useState, useTransition } from "react";
import { View, StyleSheet } from "react-native";

import { colors, fontSize, fontWeight, radius, spacing, withAlpha } from "../../constants/design";
import PrimaryButton from "../../components/PrimaryButton";
import QrCodeBox from "../../components/GameLobby/QrCodeBox";
import PlayersRow from "../../components/GameLobby/PlayersRow";
import LobbyShell from "../../components/GameLobby/LobbyShell";
import { Movie } from "../../../types";
import PageHeading from "../../components/PageHeading";
import { roomActions } from "../../redux/room/roomSlice";
import { partyActions } from "../../redux/party/partySlice";
import { useAppDispatch, useAppSelector } from "../../redux/store";
import { SocketContext } from "../../context/SocketContext";
import { usePartySocket } from "../../context/PartySocketContext";
import useTranslation from "../../service/useTranslation";
import { FancySpinner } from "../../components/FancySpinner";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import Animated, { FadeInDown } from "react-native-reanimated";
import { hash } from "../../utils/hash";
import { useGetCategoriesWithThumbnailsQuery } from "../../redux/movie/movieApi";
import { useFilterPreferences } from "../../hooks/useFilterPreferences";
import { reset } from "../../redux/roomBuilder/roomBuilderSlice";
import { useBlockedMovies } from "../../hooks/useBlockedMovies";
import { useSuperLikedMovies } from "../../hooks/useSuperLikedMovies";
import { Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import NewBadge from "@/components/NewBadge";
import FloatingBadge from "@/components/FloatingBadge";

const SYNC_PHRASES = [
  "room.loading-calculating",
  "room.loading-finding",
  "room.loading-syncing",
  "room.loading-curating",
  "room.loading-analyzing",
  "room.loading-results",
];

const AUTO_START_PHRASES = [
  "room.loading-sneaking",
  "room.loading-bribing",
  "room.loading-popcorn",
  "room.loading-gods",
  "room.loading-shuffling",
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
  partyId: string;
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
  const partySocket = usePartySocket();
  const t = useTranslation();
  const autoStart = params?.autoStart === "true";
  const hasAutoStarted = useRef(false);
  const [moviesCount, setMoviesCount] = useState<number | null>(null);
  const [isLoadingMovies, setIsLoadingMovies] = useState(false);
  const [isRefetching, setIsRefetching] = useState(false);
  const [syncPhraseIndex, setSyncPhraseIndex] = useState(0);
  const [autoStartPhraseIndex, setAutoStartPhraseIndex] = useState(0);
  const [autoStartTriggered, setAutoStartTriggered] = useState(false);
  const hashOptionsRef = useRef<string>("");
  const [isPending, startTransition] = useTransition();
  const qrCode = useAppSelector((state) => state.room.qrCode);
  const nickname = useAppSelector((state) => state.app.nickname);
  const users = useAppSelector((state) => state.room.users);
  const roomId = useAppSelector((state) => state.room.roomId);
  const existingMovies = useAppSelector((state) => state.room.movies);

  const { preferences } = useFilterPreferences();
  const movieCategoriesQuery = useGetCategoriesWithThumbnailsQuery({ type: "movie" });
  const tvCategoriesQuery = useGetCategoriesWithThumbnailsQuery({ type: "tv" });
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
        const customMovies = roomSetup.customMovies;
        setRoomConfig({
          type: roomSetup.category || "movies/discover",
          genre: roomSetup.genre?.map((g: { id: number }) => g.id) || [],
          nickname,
          providers: roomSetup.providers || [],
          maxRounds: roomSetup.maxRounds || 6,
          specialCategories: roomSetup.specialCategories || [],
          quickStart: false,
          ...(customMovies?.length > 0 && {
            customMovies: customMovies.map((m: { id: number; title: string; poster_path: string; contentType?: string }) => ({
              id: m.id,
              title: m.title,
              poster_path: m.poster_path,
              type: m.contentType ?? "movie",
            })),
          }),
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
          if (response.partyId) {
            dispatch(partyActions.setParty({ partyId: response.partyId }));
            partySocket?.emit("party:join", response.partyId);
          }
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

  const showAutoStartLoading =
    autoStart &&
    (createRoomLoading ||
      isLoadingMovies ||
      (!autoStartTriggered && !isDisabled));

  useEffect(() => {
    if (!showAutoStartLoading) {
      setAutoStartPhraseIndex(0);
      return;
    }
    const id = setInterval(
      () => setAutoStartPhraseIndex((i) => (i + 1) % AUTO_START_PHRASES.length),
      2200,
    );
    return () => clearInterval(id);
  }, [showAutoStartLoading]);

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

  useEffect(() => {
    if (!autoStart || isDisabled || !qrCode || hasAutoStarted.current) return;
    hasAutoStarted.current = true;
    const gameType = roomConfig?.type?.includes("/tv") ? "tv" : "movie";
    socket?.emit("room:start", roomId);
    dispatch(roomActions.setPlaying(true));
    dispatch(reset());
    startTransition(() => {
      setAutoStartTriggered(true);
      router.push({
        pathname: "/room/[roomId]",
        params: { roomId: qrCode.toUpperCase(), type: gameType },
      } as any);
    });
  }, [autoStart, isDisabled, qrCode]);

  return (
    <View style={[styles.container, { paddingTop: spacing.screen * 3 }]}>
      <PageHeading
        useSafeArea={false}
        showGradientBackground={false}
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
                <Text style={styles.infoText}>Preparing content...</Text>
              ) : moviesCount === 0 ? (
                <Text style={styles.warningText}>{t("room.too-restricted")}</Text>
              ) : moviesCount != null && moviesCount < 5 ? (
                <Text style={styles.warningText}>
                  {t("room.lower-results-count", { count: moviesCount })}
                </Text>
              ) : null}
            </View>

            <PlayersRow
              players={users.map((nick, index) => ({ id: nick, name: nick, isHost: index === 0 }))}
              waitingLabel={t("room.waiting-for-players")}
              style={{ marginBottom: 0 }}
              showNames
            />
            <NewBadge featureKey="async-play">
              <View style={styles.asyncBanner}>
                <MaterialCommunityIcons name="account-clock-outline" size={22} color={colors.primary} />
                <View style={styles.asyncBannerText}>
                  <Text style={styles.asyncBannerTitle}>{t("room.async-play-title")}</Text>
                  <Text style={styles.asyncBannerDesc}>{t("room.async-play-desc")}</Text>
                </View>
              </View>
           </NewBadge>
          </>
        }
        actions={
          <View style={styles.actionRow}>
            <NewBadge featureKey="invite-players">
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
            </NewBadge>

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
                  ? t(SYNC_PHRASES[syncPhraseIndex])
                  : isLoadingMovies
                    ? t("room.loading-movies")
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
        {showAutoStartLoading ? (
          <Animated.View entering={FadeInDown} style={styles.loadingContainer}>
            <FancySpinner size={100} />
            <Text style={styles.loadingText}>
              {t(AUTO_START_PHRASES[autoStartPhraseIndex])}
            </Text>
          </Animated.View>
        ) : createRoomLoading ? (
          <Animated.View entering={FadeInDown} style={styles.loadingContainer}>
            <FancySpinner size={100} />
            <Text style={styles.loadingText}>{t("room.setting-up")}</Text>
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
  asyncBanner: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.md,
    backgroundColor: withAlpha(colors.primary, 0.08),
    borderWidth: 1,
    borderColor: withAlpha(colors.primary, 0.2),
    borderRadius: radius.card,
    padding: spacing.md,
    width: "100%",
    marginBottom: spacing.md
  },
  asyncBannerText: {
    flex: 1,
    gap: spacing.xs,
  },
  asyncBannerTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.text,
  },
  asyncBannerDesc: {
    fontSize: fontSize.sm,
    color: colors.placeholder,
    lineHeight: 18,
  },
});
