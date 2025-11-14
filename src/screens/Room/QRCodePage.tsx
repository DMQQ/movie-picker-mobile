import { FontAwesome } from "@expo/vector-icons";
import { router } from "expo-router";
import { useLocalSearchParams } from "expo-router";
import { memo, useContext, useEffect, useMemo, useRef, useState, useTransition } from "react";
import { Dimensions, Platform, Share, View } from "react-native";
import { Avatar, Button, MD2DarkTheme, Text, useTheme } from "react-native-paper";
import QRCode from "react-native-qrcode-svg";
import { Movie } from "../../../types";
import { AVATAR_COLORS } from "../../components/Home/ActiveUsers";
import PageHeading from "../../components/PageHeading";
import { roomActions } from "../../redux/room/roomSlice";
import { useAppDispatch, useAppSelector } from "../../redux/store";
import { SocketContext } from "../../service/SocketContext";
import useTranslation from "../../service/useTranslation";
import { getMovieCategories, getSeriesCategories } from "../../utils/roomsConfig";
import { FancySpinner } from "../../components/FancySpinner";
import Animated, { FadeInDown } from "react-native-reanimated";
// SafeAreaView removed as we're using a wrapper View

interface RoomSetupParams {
  category: string;
  maxRounds: number;
  genre: { id: number; name: string }[];
  providers: number[];

  specialCategories: string[];
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
  const roomSetup = params.roomSetup ? (JSON.parse(params.roomSetup as string) as RoomSetupParams) : undefined;
  const { category, maxRounds, genre, providers, specialCategories } = roomSetup || {};
  const { qrCode, nickname } = useAppSelector((state) => state.room);
  const dispatch = useAppDispatch();
  const { socket } = useContext(SocketContext);
  const t = useTranslation();
  const [moviesCount, setMoviesCount] = useState<number | null>(null);

  const [isPending, startTransition] = useTransition();

  const {
    room: { users, roomId },
  } = useAppSelector((state) => state.room);

  const roomConfig = useMemo(() => {
    console.log("Creating roomConfig with:", {
      category,
      maxRounds,
      genre,
      providers,
      specialCategories,
      nickname,
      quickStart: params?.quickStart,
    });

    if (!params?.quickStart) {
      if (!category || !nickname || !socket) {
        console.log("Missing required data:", { category, nickname, socketExists: !!socket });
        return null;
      }
      return {
        type: category,
        pageRange: Math.trunc(Math.random() * 5),
        genre: genre?.map((g) => g.id) || [],
        nickname,
        providers: providers || [],
        maxRounds: maxRounds || 6,
        specialCategories: specialCategories || [],
      };
    }

    if (!nickname || !socket) {
      return null;
    }

    const movieCategories = getMovieCategories(t).slice(0, 3);
    const seriesCategories = getSeriesCategories(t).slice(0, 3);

    const randomMovie = movieCategories[Math.floor(Math.random() * movieCategories.length)];
    const randomSeries = seriesCategories[Math.floor(Math.random() * seriesCategories.length)];

    const randomCategory = Math.random() < 0.5 ? randomMovie : randomSeries;

    const config = {
      type: randomCategory.path,
      pageRange: Math.trunc(Math.random() * 5),
      genre: [],
      nickname,
      providers: [],
      maxRounds: 3,
      specialCategories: [],
    };
    return config;
  }, [params?.quickStart, category, maxRounds, genre, providers, nickname, socket]);

  const [createRoomLoading, setCreateRoomLoading] = useState(false);
  const roomCreationAttempted = useRef(false);

  useEffect(() => {
    if (!roomConfig || !socket || !nickname || qrCode || roomCreationAttempted.current) {
      return;
    }

    roomCreationAttempted.current = true;

    (async () => {
      try {
        console.log("🎯 Starting room creation...");
        setCreateRoomLoading(true);

        const response = (await socket.emitWithAck("create-room", roomConfig)) as ISocketResponse;

        if (response) {
          console.log("💡 Room created:", response.roomId);
          dispatch(roomActions.setRoom(response.details));
          dispatch(roomActions.setQRCode(response.roomId));

          socket.emit("join-room", response.roomId, nickname);
        }
      } catch (error) {
        console.log("💥 Error creating room:", error);
        roomCreationAttempted.current = false; // Reset on error to allow retry
      } finally {
        setCreateRoomLoading(false);
      }
    })();

    return () => {
      socket?.off("active");
      socket?.off("movies");
    };
  }, [roomConfig, socket, nickname, qrCode, dispatch]);

  useEffect(() => {
    if (!socket) return;
    socket?.on("active", (users: string[]) => {
      dispatch(roomActions.setActiveUsers(users));
    });

    socket?.on("movies", ({ movies }: { movies: Movie[] }) => {
      setMoviesCount(movies.length);
      if (!!movies) dispatch(roomActions.addMovies(movies));
    });

    return () => {
      socket?.off("active");
      socket?.off("movies");
    };
  }, [socket, qrCode]);

  const onJoinOwnRoom = (code: string) => {
    startTransition(() => {
      socket?.emit("room:start", roomId);
      dispatch(roomActions.setPlaying(true));

      let gameType = "movie";
      if (params?.quickStart && roomConfig) {
        gameType = roomConfig.type?.includes("/tv") ? "tv" : "movie";
      } else if (category) {
        gameType = category.includes("/movie") || category.includes("movie") ? "movie" : "tv";
      }

      router.push({
        pathname: "/room/[roomId]",
        params: {
          roomId: code,
          type: gameType,
        },
      });
    });
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#000" }}>
      <PageHeading useSafeArea={false} title={t("room.qr-title")} />
      <View
        style={[
          { position: "relative", flex: 1, padding: 15, paddingTop: 80, paddingBottom: 0 },
          { marginTop: Platform.OS === "android" ? 20 : 0 },
        ]}
      >
        <Text
          style={{
            fontSize: 16,
            color: "#fff",
          }}
        >
          {t("room.qr-subtitle")}
        </Text>

        {createRoomLoading ? (
          <Animated.View entering={FadeInDown} style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
            <FancySpinner size={100} />
            <Text style={{ color: "#fff", marginTop: 20 }}>Creating room...</Text>
          </Animated.View>
        ) : qrCode ? (
          <Animated.View entering={FadeInDown} style={{ flex: 1 }}>
            <QrCodeBox code={qrCode} />
          </Animated.View>
        ) : (
          <Animated.View entering={FadeInDown} style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
            <Text style={{ color: "#fff" }}>No QR code generated yet</Text>
            <Text style={{ color: "#fff", marginTop: 10 }}>Room config: {roomConfig ? "✓" : "✗"}</Text>
            <Text style={{ color: "#fff", marginTop: 5 }}>Socket: {socket ? "✓" : "✗"}</Text>
            <Text style={{ color: "#fff", marginTop: 5 }}>Nickname: {nickname || "Not set"}</Text>
          </Animated.View>
        )}
      </View>
      <View style={{ paddingHorizontal: 15, paddingTop: 15, gap: 7.5 }}>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            height: 25,
            alignItems: "center",
          }}
        >
          <Text style={{ fontSize: 16 }}>{t("room.active")}:</Text>
          <View style={{ flexDirection: "row", gap: 5 }}>
            {users.map((nick, index) => (
              <View
                key={nick + index}
                style={{
                  flexDirection: "row",
                  backgroundColor: "#000",
                  gap: 5,
                  borderRadius: 100,
                  alignItems: "center",
                }}
              >
                <Avatar.Text size={25} label={nick[0].toUpperCase()} style={{ backgroundColor: AVATAR_COLORS[index % 5] }} />
              </View>
            ))}
          </View>
        </View>
        <Text style={{ color: "gray" }}>
          {moviesCount != null && moviesCount < 15 ? t("room.lower-results-count", { count: moviesCount }) : ""}
        </Text>

        <Button
          disabled={!qrCode || (moviesCount != null ? moviesCount < 5 : false) || createRoomLoading || isPending}
          mode="contained"
          style={{
            borderRadius: 100,
            marginTop: 10,
          }}
          contentStyle={{ padding: 7.5 }}
          onPress={() => {
            onJoinOwnRoom(qrCode);
          }}
        >
          {moviesCount === 0 ? t("room.too-restricted") : "start"}
        </Button>
      </View>
    </View>
  );
}

const QrCodeBox = memo(({ code }: { code: string }) => {
  const theme = useTheme();

  const shareCode = async (code: string) => {
    Share.share({
      message: "Hey! Join my room on FlickMate: " + code,
      title: "Join my room on FlickMate!",
      url: "https://movie.dmqq.dev/swipe/" + code.toUpperCase(),
    });
  };

  return (
    <View
      style={{
        justifyContent: "center",
        alignItems: "center",
        flex: 1,
      }}
    >
      <View
        style={{
          padding: 10,
          borderColor: theme.colors.primary,
          borderWidth: 5,
        }}
      >
        <QRCode
          backgroundColor={theme.colors.surface}
          color={theme.colors.primary}
          value={`flickmate://swipe/${code}`}
          size={Dimensions.get("screen").width * 0.6}
        />
      </View>

      <Button
        icon={() => <FontAwesome name="share" size={24} color={MD2DarkTheme.colors.primary} />}
        onPress={async () => {
          shareCode(code);
        }}
        contentStyle={{ flexDirection: "row-reverse" }}
        style={{ marginTop: 15 }}
      >
        <Text style={{ fontSize: 25, letterSpacing: 1, color: theme.colors.primary }}>{code || "Loading..."}</Text>
      </Button>
    </View>
  );
});
