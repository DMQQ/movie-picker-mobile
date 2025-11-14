import { MaterialCommunityIcons } from "@expo/vector-icons";
// useNavigation removed - using expo-router
import { memo, useContext, useMemo, useState } from "react";
import { Image, Platform, Pressable, StyleSheet, View } from "react-native";
import { Appbar, Button, MD2DarkTheme, useTheme } from "react-native-paper";
import Animated, { FadeIn, LinearTransition } from "react-native-reanimated";
import { Movie } from "../../../types";
import { useAppSelector } from "../../redux/store";
import { SocketContext } from "../../service/SocketContext";
import useTranslation from "../../service/useTranslation";
import { ThumbnailSizes } from "../Thumbnail";
import ActiveUsers from "./ActiveUsers";
import DialogModals from "./DialogModals";
import { GlassView } from "expo-glass-effect";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";

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
      pathname: "/game-summary",
      params: { roomId },
    });
  };

  const insets = useSafeAreaInsets();

  return (
    <>
      <View style={{ marginTop: 0, flexDirection: "row", alignItems: "center", paddingTop: Platform.OS === "android" ? insets.top : 0 }}>
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

        <ActiveUsers data={users} onPress={() => setShowQRModal((p) => !p)} />

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

const LikedMoviesPreview = () => {
  const likes = useAppSelector((state) => state.room.room.likes);
  const itemsToDisplay = useMemo(() => likes.toReversed().slice(0, 5), [likes]);
  const [loadedMovies, setLoadedMovies] = useState<Set<Movie>>(new Set());

  const handleImageLoaded = (movie: Movie) => {
    setLoadedMovies((prev) => new Set([...prev, movie]));
  };

  const loadedItems = Array.from(loadedMovies).reverse().slice(0, 5);

  return (
    <Pressable onPress={() => router.navigate("/room/overview")}>
      <Animated.View layout={LinearTransition} style={styles.likedContainer}>
        {loadedItems.length === 0 && <PlaceholderImage />}

        {itemsToDisplay.map((movie) => (
          <PrefetchedImage key={`prefetch-${movie.id}`} movie={movie} onLoaded={handleImageLoaded} />
        ))}

        {loadedItems.map((movie, index) => (
          <Animated.View
            entering={FadeIn}
            key={`display-${movie.id}`}
            style={{
              position: "absolute",
              transform: [{ translateX: index * 5 }],
              zIndex: loadedItems.length - index,
            }}
          >
            <LikedMovieImage movie={movie} />
          </Animated.View>
        ))}
      </Animated.View>
    </Pressable>
  );
};

const PrefetchedImage = ({ movie, onLoaded }: { movie: Movie; onLoaded: (movie: Movie) => void }) => {
  const uri = `https://image.tmdb.org/t/p/w${ThumbnailSizes.logo.tiny}${movie.poster_path}`;

  return (
    <Image
      style={{ width: 1, height: 1, position: "absolute", opacity: 0 }}
      source={{ uri, width: 25, height: 40, cache: "force-cache" }}
      onLoad={() => onLoaded(movie)}
      onError={() => onLoaded(movie)}
    />
  );
};

const LikedMovieImage = ({ movie }: { movie: Movie }) => {
  const uri = `https://image.tmdb.org/t/p/w${ThumbnailSizes.logo.tiny}${movie.poster_path}`;

  return <Image style={styles.likedImage} source={{ uri, width: 25, height: 40, cache: "force-cache" }} />;
};

const PlaceholderImage = () => {
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
};

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
