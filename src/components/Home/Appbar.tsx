import { MaterialCommunityIcons } from "@expo/vector-icons";
import { memo, useCallback, useContext, useMemo, useState } from "react";
import { Platform, Pressable, StyleSheet, View } from "react-native";
import { Appbar, Button, MD2DarkTheme, useTheme } from "react-native-paper";
import Animated, { FadeIn, LinearTransition } from "react-native-reanimated";
import { Movie } from "../../../types";
import { useAppSelector } from "../../redux/store";
import { SocketContext } from "../../context/SocketContext";
import useTranslation from "../../service/useTranslation";
import { ThumbnailSizes } from "../Thumbnail";
import ActiveUsers from "./ActiveUsers";
import DialogModals from "./DialogModals";
import { GlassView } from "expo-glass-effect";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Image } from "expo-image";

function HomeAppbar({ roomId, hasCards }: { roomId: string; hasCards: boolean }) {
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);

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

  const insets = useSafeAreaInsets();

  const onActiveUsersPress = useCallback(() => setShowQRModal((p) => !p), []);

  return (
    <>
      <View
        style={{
          marginTop: 0,
          flexDirection: "row",
          alignItems: "center",
          paddingTop: Platform.OS === "android" ? insets.top : 0,
          position: "relative",
          justifyContent: "space-between",
        }}
      >
        <GlassView
          key={isHost ? "host" : "regular"}
          glassEffectStyle="clear"
          tintColor={"#ff4444"}
          style={{ borderRadius: 100, marginLeft: 10, overflow: "hidden" }}
          isInteractive
        >
          {isHost ? (
            <Button onPress={handleEndGame} buttonColor="transparent" textColor="#fff">
              {t("dialogs.scan-code.endGame")}
            </Button>
          ) : (
            <Button onPress={toggleLeaveModal} textColor={Platform.OS === "ios" ? "#fff" : theme.colors.error}>
              {t("dialogs.scan-code.leave")}
            </Button>
          )}
        </GlassView>

        <View
          style={{
            position: "absolute",
            left: "50%",
            transform: [{ translateX: "-50%" }],
            marginTop: Platform.OS === "android" ? insets.top : 0,
          }}
        >
          <ActiveUsers data={users} onPress={onActiveUsersPress} />
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
  const itemsToDisplay = useMemo(() => likes.toReversed().slice(0, 5), [likes]);

  return (
    <Pressable onPress={() => router.navigate("/room/overview")}>
      <Animated.View layout={LinearTransition} style={styles.likedContainer}>
        {itemsToDisplay.length === 0 && <PlaceholderImage />}

        {itemsToDisplay.map((movie, index) => (
          <Animated.View
            entering={FadeIn}
            key={`display-${movie.id}`}
            style={{
              position: "absolute",
              transform: [{ translateX: index * 5 }],
              zIndex: itemsToDisplay.length - index,
            }}
          >
            <LikedMovieImage movie={movie} />
          </Animated.View>
        ))}
      </Animated.View>
    </Pressable>
  );
});

const LikedMovieImage = memo(({ movie }: { movie: Movie }) => {
  const uri = `https://image.tmdb.org/t/p/w${ThumbnailSizes.logo.tiny}${movie.poster_path}`;

  return (
    <View style={{ backgroundColor: MD2DarkTheme.colors.surface }}>
      <Image style={styles.likedImage} cachePolicy={"disk"} source={{ uri, width: 25, height: 40 }} />
    </View>
  );
});

const PlaceholderImage = memo(() => {
  return Array.from(new Array(3).keys()).map((index) => (
    <Animated.View
      key={`placeholder-${index}`}
      entering={FadeIn}
      style={{
        position: "absolute",
        transform: [{ translateX: index * 5 }],
        zIndex: 4 - index,
      }}
    >
      <View style={[styles.likedImage, { backgroundColor: MD2DarkTheme.colors.surface }]}>
        <MaterialCommunityIcons name="movie" size={20} color="rgba(255,255,255,0.3)" style={{ alignSelf: "center", marginTop: 10 }} />
      </View>
    </Animated.View>
  ));
});

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

  likedImage: {
    width: 25,
    height: 40,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 2,
  },

  likedContainer: {
    position: "relative",
    width: 50,
    height: 40,
    marginLeft: 10,
    overflow: "hidden",
    borderRadius: 2,
  },
});
