import { MaterialCommunityIcons } from "@expo/vector-icons";
import AppbarAction from "../AppbarAction";
import Text from "../Text";
import { useTheme } from "../../hooks/useTheme";
import {
  memo,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Platform, Pressable, StyleSheet, View } from "react-native";

import Button from "../Button";
import { colors, fontWeight, fontSize, radius, spacing } from "../../constants/design";
import Animated, {
  FadeIn,
  useAnimatedProps,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { Movie } from "../../../types";
import { useAppSelector } from "../../redux/store";
import { ConnectionStatus, SocketContext } from "../../context/SocketContext";
import useTranslation from "../../service/useTranslation";
import { ThumbnailSizes } from "../Thumbnail";
import ActiveUsers from "./ActiveUsers";
import DialogModals from "./DialogModals";
import { LiquidGlassView } from "@callstack/liquid-glass";
import { router } from "expo-router";
import { Image } from "expo-image";
import RateAppPill from "../RateAppPill";
import ReviewManager from "../../utils/rate";
import Svg, { Circle } from "react-native-svg";

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

function HomeAppbar() {
  const roomId = useAppSelector((state) => state.room.roomId);
  const hasCards = useAppSelector((state) => state.room.movies.length > 0);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [showRatePill, setShowRatePill] = useState(false);
  const wasPillShown = useRef(false);

  const matches = useAppSelector((state) => state.room.matches);
  const likes = useAppSelector((state) => state.room.likes);

  useEffect(() => {
    if (wasPillShown.current) return;

    const checkAndShowRatePill = async () => {
      if (
        (matches.length >= 5 || likes.length >= 5) &&
        (await ReviewManager.canRequestReviewFromRating())
      ) {
        setShowRatePill(true);
        wasPillShown.current = true;
      }
    };
    checkAndShowRatePill();
  }, [matches.length, likes.length]);

  const toggleLeaveModal = () => {
    setShowLeaveModal((p) => !p);
  };
  const theme = useTheme();
  const { socket, connectionStatus } = useContext(SocketContext);

  const { isFinished, users, isPlaying, isHost } = useAppSelector((state) => state.room);

  const t = useTranslation();

  const handleEndGame = () => {
    socket?.emit("end-game", roomId);
    router.replace({
      pathname: "/room/summary",
      params: { roomId },
    });
  };

  const onActiveUsersPress = useCallback(() => setShowQRModal((p) => !p), []);

  return (
    <>
      <View
        style={{
          marginTop: 0,
          flexDirection: "row",
          alignItems: "center",
          position: "relative",
          justifyContent: "space-between",
        }}
      >
        <LiquidGlassView
          key={isHost ? "host" : "regular"}
          effect="clear"
          tintColor={"#ff4444"}
          style={[
            {
              borderRadius: radius.pill,
              marginLeft: spacing.sm + 2,
              overflow: "hidden",
              zIndex: 50,
            },
          ]}
          interactive
        >
          {isHost ? (
            <Button
              onPress={handleEndGame}
              buttonColor={Platform.OS === "ios" ? "transparent" : "#ff4444"}
              textColor={colors.text}
            >
              {t("dialogs.scan-code.endGame")}
            </Button>
          ) : (
            <Button
              onPress={toggleLeaveModal}
              textColor={Platform.OS === "ios" ? colors.text : theme.colors.error}
            >
              {t("dialogs.scan-code.leave")}
            </Button>
          )}
        </LiquidGlassView>

        <View style={[styles.midSection, showRatePill && { width: "75%" }]}>
          <ActiveUsers data={users} onPress={onActiveUsersPress} isHost={isHost} />
          <ConnectionChip status={connectionStatus} />
        </View>

        {!hasCards && !isFinished && isPlaying && (
          <AppbarAction
            color={theme.colors.primary}
            size={22}
            icon="refresh"
            onPress={() => {
              socket?.emit("get-movies", roomId);
            }}
          />
        )}

        <LikedMoviesPreview />
      </View>

      <DialogModals
        showLeaveModal={showLeaveModal}
        roomId={roomId}
        toggleLeaveModal={toggleLeaveModal}
        setShowQRModal={setShowQRModal}
        showQRModal={showQRModal}
      />
    </>
  );
}

export default memo(HomeAppbar);

const CIRCLE_SIZE = 58;
const STROKE_WIDTH = 2;
const RADIUS = (CIRCLE_SIZE - STROKE_WIDTH) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const LikedMoviesPreview = memo(() => {
  const { likes, dislikes, maxRounds } = useAppSelector((state) => state.room);
  const isPlaying = useAppSelector((state) => state.room.isPlaying);
  const itemsToDisplay = useMemo(
    () => likes.slice().reverse().slice(0, 4),
    [likes],
  );
  const hasMore = likes.length > 5;

  const swiped = likes.length + dislikes.length;
  const total = maxRounds * 20;
  const progress = useSharedValue(0);
  const theme = useTheme();

  useEffect(() => {
    if (total > 0) {
      progress.value = withSpring(Math.min(swiped / total, 1), {
        damping: 15,
        stiffness: 100,
      });
    }
  }, [swiped, total]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: CIRCUMFERENCE * (1 - progress.value),
  }));

  const showProgress = isPlaying && maxRounds > 0;

  return (
    <Pressable onPress={() => router.navigate("/room/overview")}>
      <View style={styles.likedWrapper}>
        {showProgress && (
          <>
            <Svg
              width={CIRCLE_SIZE}
              height={CIRCLE_SIZE}
              style={styles.circularProgress}
            >
              <Circle
                cx={CIRCLE_SIZE / 2}
                cy={CIRCLE_SIZE / 2}
                r={RADIUS}
                stroke={colors.overlay}
                strokeWidth={STROKE_WIDTH}
                fill="transparent"
              />
              <AnimatedCircle
                cx={CIRCLE_SIZE / 2}
                cy={CIRCLE_SIZE / 2}
                r={RADIUS}
                stroke={theme.colors.primary}
                strokeWidth={STROKE_WIDTH}
                fill="transparent"
                strokeDasharray={CIRCUMFERENCE}
                strokeLinecap="round"
                animatedProps={animatedProps}
                transform={`rotate(-90 ${CIRCLE_SIZE / 2} ${CIRCLE_SIZE / 2})`}
                opacity={0.6}
              />
            </Svg>
            <Text style={styles.progressLabel}>
              {swiped}/{total}
            </Text>
          </>
        )}
        <Animated.View style={styles.likedContainer}>
          {itemsToDisplay.length === 0 ? (
            <PlaceholderStack />
          ) : (
            itemsToDisplay.map((movie, index) => (
              <Animated.View
                entering={FadeIn}
                key={`display-${movie.id}`}
                style={[
                  styles.stackedCard,
                  {
                    transform: [
                      { translateX: (index - 1) * 4 },
                      { rotate: `${(index - 1) * 4}deg` },
                    ],
                    zIndex: itemsToDisplay.length - index,
                  },
                ]}
              >
                <LikedMovieImage movie={movie} />
              </Animated.View>
            ))
          )}
          {hasMore && (
            <View style={styles.moreIndicator}>
              <Text style={styles.moreText}>+{likes.length - 5}</Text>
            </View>
          )}
        </Animated.View>
      </View>
    </Pressable>
  );
});

const LikedMovieImage = memo(({ movie }: { movie: Movie }) => {
  const uri = `https://image.tmdb.org/t/p/w${ThumbnailSizes.logo.tiny}${movie.poster_path}`;

  return (
    <View style={styles.imageWrapper}>
      <Image
        style={styles.likedImage}
        cachePolicy="memory-disk"
        source={{ uri, width: 24, height: 36 }}
      />
    </View>
  );
});

const ConnectionChip = memo(({ status }: { status: ConnectionStatus }) => {
  const t = useTranslation();
  if (status === "idle" || status === "connected") return null;

  const isReconnecting = status === "reconnecting";
  const color = isReconnecting ? "#FFA500" : "#FF4444";
  const bg = isReconnecting ? "rgba(255,160,0,0.12)" : "rgba(255,60,60,0.12)";
  const border = isReconnecting ? "rgba(255,160,0,0.3)" : "rgba(255,60,60,0.3)";

  return (
    <Animated.View entering={FadeIn} style={[styles.connectionChip, { backgroundColor: bg, borderColor: border }]}>
      <Text style={[styles.connectionChipText, { color }]}>
        {isReconnecting ? t("room.reconnecting") : t("room.disconnected")}
      </Text>
    </Animated.View>
  );
});

const PlaceholderStack = memo(() => (
  <>
    {[0, 1, 2].map((index) => (
      <Animated.View
        key={`placeholder-${index}`}
        entering={FadeIn.delay(index * 50)}
        style={[
          styles.stackedCard,
          styles.placeholderCard,
          {
            transform: [
              { translateX: (index - 1) * 4 },
              { rotate: `${(index - 1) * 4}deg` },
            ],
            zIndex: 3 - index,
          },
        ]}
      >
        <MaterialCommunityIcons
          name="movie-outline"
          size={12}
          color="rgba(255,255,255,0.2)"
        />
      </Animated.View>
    ))}
  </>
));

const styles = StyleSheet.create({
  smallButton: {
    height: 30,
    paddingHorizontal: spacing.md + 0.5,
    paddingVertical: spacing.xs + 1,
    borderRadius: radius.md + 2,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  buttonIcon: {
    marginRight: spacing.xs,
  },
  buttonText: {
    fontSize: fontSize.sm - 1,
    fontWeight: fontWeight.medium,
    includeFontPadding: false,
  },

  likedContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: CIRCLE_SIZE,
    width: CIRCLE_SIZE,
    marginTop: -5,
  },
  stackedCard: {
    position: "absolute",
    borderRadius: radius.xs,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.25,
    shadowRadius: 2,
    elevation: 3,
  },
  imageWrapper: {
    width: 24,
    height: 36,
    backgroundColor: colors.surface,
    borderRadius: radius.xs,
    justifyContent: "center",
    alignItems: "center",
  },
  likedImage: {
    width: 24,
    height: 36,
    borderRadius: radius.xs,
    borderWidth: 1,
    borderColor: colors.border,
  },
  placeholderCard: {
    width: 24,
    height: 36,
    backgroundColor: colors.surface,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.overlay,
  },
  moreIndicator: {
    position: "absolute",
    right: 8,
    bottom: 8,
    backgroundColor: colors.surface,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.xs - 3,
    zIndex: 100,
  },
  moreText: {
    fontSize: fontSize.xs - 2,
    fontWeight: fontWeight.bold,
    color: colors.text,
  },
  midSection: {
    position: "absolute",
    left: "50%",
    transform: [{ translateX: "-50%" }],
    justifyContent: "center",
    alignItems: "center",
  },
  likedWrapper: {
    alignItems: "center",
    justifyContent: "center",
    width: CIRCLE_SIZE + 10,
    height: CIRCLE_SIZE,
  },
  circularProgress: {
    position: "absolute",
    top: 0,
  },
  progressLabel: {
    position: "absolute",
    bottom: -10,
    fontSize: fontSize.xs - 2,
    color: "rgba(255,255,255,0.4)",
    fontWeight: fontWeight.semibold,
  },
  connectionChip: {
    marginTop: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs - 2,
    borderRadius: radius.sm + 2,
    borderWidth: 1,
  },
  connectionChipText: {
    fontSize: fontSize.xs - 1,
    fontWeight: fontWeight.semibold,
  },
});
