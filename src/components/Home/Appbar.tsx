import { MaterialCommunityIcons } from "@expo/vector-icons";
import { memo, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { Platform, Pressable, StyleSheet, View } from "react-native";
import { Appbar, Button, MD2DarkTheme, Text, useTheme } from "react-native-paper";
import Animated, { FadeIn, LinearTransition, SlideInRight } from "react-native-reanimated";
import { Movie } from "../../../types";
import { useAppSelector } from "../../redux/store";
import { SocketContext } from "../../context/SocketContext";
import useTranslation from "../../service/useTranslation";
import { ThumbnailSizes } from "../Thumbnail";
import ActiveUsers from "./ActiveUsers";
import DialogModals from "./DialogModals";
import { LiquidGlassView } from "@callstack/liquid-glass";
import { router } from "expo-router";
import { Image } from "expo-image";
import RateAppPill from "../RateAppPill";
import ReviewManager from "../../utils/rate";

interface HomeAppbarProps {
  roomId: string;
  hasCards: boolean;
}

function HomeAppbar({ roomId, hasCards }: HomeAppbarProps) {
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [showRatePill, setShowRatePill] = useState(false);
  const wasPillShown = useRef(false);

  const matches = useAppSelector((state) => state.room.room.matches);
  const likes = useAppSelector((state) => state.room.room.likes);

  useEffect(() => {
    if (wasPillShown.current) return;

    const checkAndShowRatePill = async () => {
      if ((matches.length >= 5 || likes.length >= 5) && (await ReviewManager.canRequestReviewFromRating())) {
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
  const { socket } = useContext(SocketContext);

  const {
    room: { isFinished, users },
    isPlaying,
    isHost,
  } = useAppSelector((state) => state.room);

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
          style={[{ borderRadius: 100, marginLeft: 10, overflow: "hidden", zIndex: 50 }]}
          interactive
        >
          {isHost ? (
            <Button onPress={handleEndGame} buttonColor={Platform.OS === "ios" ? "transparent" : "#ff4444"} textColor="#fff">
              {t("dialogs.scan-code.endGame")}
            </Button>
          ) : (
            <Button onPress={toggleLeaveModal} textColor={Platform.OS === "ios" ? "#fff" : theme.colors.error}>
              {t("dialogs.scan-code.leave")}
            </Button>
          )}
        </LiquidGlassView>

        <View style={[styles.midSection, showRatePill && { width: "75%" }]}>
          {showRatePill ? (
            <RateAppPill onDismiss={() => setShowRatePill(false)} />
          ) : (
            <ActiveUsers data={users} onPress={onActiveUsersPress} />
          )}
        </View>

        {!hasCards && !isFinished && isPlaying && (
          <Appbar.Action
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

const LikedMoviesPreview = memo(() => {
  const likes = useAppSelector((state) => state.room.room.likes);
  const itemsToDisplay = useMemo(() => likes.toReversed().slice(0, 4), [likes]);
  const hasMore = likes.length > 5;

  return (
    <Pressable onPress={() => router.navigate("/room/overview")}>
      <Animated.View style={styles.likedContainer}>
        {itemsToDisplay.length === 0 ? (
          <PlaceholderStack />
        ) : (
          itemsToDisplay.map((movie, index) => (
            <Animated.View
              entering={SlideInRight.delay(index * 50)}
              key={`display-${movie.id}`}
              style={[
                styles.stackedCard,
                {
                  transform: [{ translateX: (index + 1) * 10 }, { rotate: `${(index - 1) * 5}deg` }],
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
    </Pressable>
  );
});

const LikedMovieImage = memo(({ movie }: { movie: Movie }) => {
  const uri = `https://image.tmdb.org/t/p/w${ThumbnailSizes.logo.tiny}${movie.poster_path}`;

  return (
    <View style={styles.imageWrapper}>
      <MaterialCommunityIcons name="movie-outline" size={16} color="rgba(255,255,255,0.2)" style={styles.imagePlaceholderIcon} />
      <Image style={styles.likedImage} cachePolicy="memory" source={{ uri, width: 32, height: 48 }} transition={150} />
    </View>
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
            transform: [{ translateX: (index + 1) * 10 }, { rotate: `${(index - 1) * 3}deg` }],
            zIndex: 3 - index,
          },
        ]}
      >
        <MaterialCommunityIcons name="movie-outline" size={18} color="rgba(255,255,255,0.2)" />
      </Animated.View>
    ))}
  </>
));

const styles = StyleSheet.create({
  smallButton: {
    height: 30,
    paddingHorizontal: 12.5,
    paddingVertical: 5,
    borderRadius: 14,
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
    marginRight: 4,
  },
  buttonText: {
    fontSize: 11,
    fontWeight: "500",
    includeFontPadding: false,
  },

  likedContainer: {
    flexDirection: "row",
    alignItems: "center",
    height: 52,
    width: 80,
  },
  stackedCard: {
    position: "absolute",
    borderRadius: 6,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 4,
    right: 40,
  },
  imageWrapper: {
    width: 32,
    height: 48,
    backgroundColor: MD2DarkTheme.colors.surface,
    borderRadius: 6,
    justifyContent: "center",
    alignItems: "center",
  },
  imagePlaceholderIcon: {
    position: "absolute",
  },
  likedImage: {
    width: 32,
    height: 48,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  placeholderCard: {
    width: 32,
    height: 48,
    backgroundColor: MD2DarkTheme.colors.surface,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  moreIndicator: {
    position: "absolute",
    right: 0,
    bottom: 15,
    backgroundColor: MD2DarkTheme.colors.surface,
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    zIndex: 100,
  },
  moreText: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#fff",
  },
  midSection: {
    position: "absolute",
    left: "50%",
    transform: [{ translateX: "-50%" }],
    justifyContent: "center",
    alignItems: "center",
  },
});
