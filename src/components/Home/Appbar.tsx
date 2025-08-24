import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useContext, useMemo, useState } from "react";
import { Image, Pressable, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Appbar, Button, MD2DarkTheme, useTheme } from "react-native-paper";
import Animated, { FadeIn, LinearTransition } from "react-native-reanimated";
import { Movie } from "../../../types";
import { useAppSelector } from "../../redux/store";
import { SocketContext } from "../../service/SocketContext";
import useTranslation from "../../service/useTranslation";
import { ThumbnailSizes } from "../Thumbnail";
import ActiveUsers from "./ActiveUsers";

const SmallButton = ({ children, onPress, icon, style }: { children?: string; onPress: () => void; icon?: string; style?: any }) => {
  const theme = useTheme();

  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.smallButton,
        {
          backgroundColor: `${theme.colors.primary}33`,
          borderColor: `${theme.colors.primary}66`,
        },
        style,
      ]}
      activeOpacity={0.7}
    >
      <View style={styles.buttonContent}>
        {icon && (
          <MaterialCommunityIcons name={icon as any} size={14} color={theme.colors.primary} style={[children && styles.buttonIcon]} />
        )}
        {children && <Text style={[styles.buttonText, { color: theme.colors.primary }]}>{children}</Text>}
      </View>
    </TouchableOpacity>
  );
};

export default function HomeAppbar({
  toggleLeaveModal,
  setShowQRModal,
  route,
  cards,
}: {
  toggleLeaveModal: () => void;
  setShowQRModal: React.Dispatch<React.SetStateAction<boolean>>;
  showQRModal: boolean;
  route: { params: { roomId: string } };
  cards: any;
}) {
  const theme = useTheme();
  const { socket } = useContext(SocketContext);
  const navigation = useNavigation<any>();

  const {
    room: { isFinished, users },
    isPlaying,
    isHost,
  } = useAppSelector((state) => state.room);

  const t = useTranslation();

  const handleEndGame = () => {
    const roomId = route.params?.roomId;
    socket?.emit("end-game", roomId);
    navigation.replace("GameSummary", { roomId });
  };

  return (
    <View style={{ marginTop: 0, flexDirection: "row", alignItems: "center" }}>
      {isHost ? (
        <Button onPress={handleEndGame} buttonColor="transparent" textColor="#ff4444">
          {t("dialogs.scan-code.endGame")}
        </Button>
      ) : (
        <Button onPress={toggleLeaveModal}>{t("dialogs.scan-code.leave")}</Button>
      )}

      <ActiveUsers data={users} />

      {!(cards.length > 0) && !isFinished && isPlaying && (
        <Appbar.Action
          color={theme.colors.primary}
          size={22}
          icon="refresh"
          onPress={() => {
            socket?.emit("get-movies", route.params?.roomId);
          }}
        />
      )}

      <SmallButton icon="qrcode-scan" onPress={() => setShowQRModal((p) => !p)} style={{ marginRight: 10 }} />

      <LikedMoviesPreview />
    </View>
  );
}

const LikedMoviesPreview = () => {
  const navigation = useNavigation<any>();
  const { likes } = useAppSelector((state) => state.room.room);
  const itemsToDisplay = useMemo(() => likes.toReversed().slice(0, 5), [likes]);
  const [loadedMovies, setLoadedMovies] = useState<Set<Movie>>(new Set());

  const handleImageLoaded = (movie: Movie) => {
    setLoadedMovies((prev) => new Set([...prev, movie]));
  };

  const loadedItems = Array.from(loadedMovies).reverse().slice(0, 5);

  return (
    <Pressable onPress={() => navigation.navigate("Overview")}>
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
  return;
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
