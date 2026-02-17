import { Dimensions, Platform, Pressable, StyleSheet, View } from "react-native";
import { Text, Chip } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { Movie, MovieDetails } from "../../../types";
import { ActionButtons } from "./shared";
import { ThumbnailSizes } from "../Thumbnail";
import Animated from "react-native-reanimated";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

interface MovieResultCardProps {
  movie: Movie;
  details?: MovieDetails | null;
  onPress?: () => void;
  onSuperLike?: () => void;
  onBlock?: () => void;
  superLikeLabel: string;
  blockLabel: string;
  superLikeIconScale?: Animated.SharedValue<number>;
  width?: number;
  height?: number;
}

export const CARD_WIDTH = screenWidth * 0.9;
export const CARD_HEIGHT = screenHeight * 0.65;

export default function MovieResultCard({
  movie,
  details,
  onPress,
  onSuperLike,
  onBlock,
  superLikeLabel,
  blockLabel,
  superLikeIconScale,
  width = CARD_WIDTH,
  height = CARD_HEIGHT,
}: MovieResultCardProps) {
  return (
    <View style={[styles.card, { width, height }]}>
      <Pressable onPress={onPress} style={styles.cardPressable}>
        <Image
          placeholder={`https://image.tmdb.org/t/p/${ThumbnailSizes.poster.tiny}${movie.poster_path}`}
          source={{ uri: `https://image.tmdb.org/t/p/w780${movie.poster_path}` }}
          style={styles.poster}
          contentFit="cover"
        />
        <LinearGradient
          colors={["transparent", "rgba(0,0,0,0.6)", "rgba(0,0,0,0.95)", "#000"]}
          locations={[0, 0.4, 0.75, 1]}
          style={styles.infoOverlay}
        >
          <Text style={styles.movieTitle} numberOfLines={2}>
            {movie.title || movie.name}
          </Text>

          <View style={styles.ratingRow}>
            <MaterialCommunityIcons name="star" size={16} color="#fbbf24" />
            <Text style={styles.ratingText}>{movie.vote_average.toFixed(1)}</Text>
            {details?.runtime ? (
              <>
                <Text style={styles.dotSeparator}>•</Text>
                <Text style={styles.ratingText}>{details.runtime} min</Text>
              </>
            ) : null}

            {details?.genres && details.genres.length > 0 && (
              <>
                <Text style={styles.dotSeparator}>•</Text>
                {details.genres.slice(0, 3).map((genre) => (
                  <Chip key={genre.id} style={styles.genreChip} textStyle={styles.genreText} compact>
                    {genre.name}
                  </Chip>
                ))}
              </>
            )}
          </View>

          {movie.overview && (
            <Text style={styles.overview} numberOfLines={3}>
              {movie.overview}
            </Text>
          )}

          {onSuperLike && onBlock && (
            <ActionButtons
              onSuperLike={onSuperLike}
              onBlock={onBlock}
              superLikeLabel={superLikeLabel}
              blockLabel={blockLabel}
              superLikeIconScale={superLikeIconScale}
            />
          )}
        </LinearGradient>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 28,
    overflow: "hidden",
    backgroundColor: "#1e1e1e",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.6,
    shadowRadius: 24,
    elevation: 12,
  },
  cardPressable: {
    flex: 1,
  },
  poster: {
    width: "100%",
    height: "100%",
  },
  infoOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    paddingTop: 80,
    justifyContent: "flex-end",
  },
  movieTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: "#fff",
    marginBottom: 8,
    fontFamily: Platform.OS === "ios" ? "System" : "sans-serif-condensed",
    textShadowColor: "rgba(0,0,0,0.5)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 10,
    flexWrap: "wrap",
  },
  ratingText: {
    color: "#e2e8f0",
    fontWeight: "600",
    fontSize: 14,
  },
  dotSeparator: {
    color: "#64748b",
    fontSize: 14,
  },
  genreChip: {
    backgroundColor: "rgba(255,255,255,0.3)",
    height: 26,
  },
  genreText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "600",
    marginVertical: 0,
    marginHorizontal: 2,
  },
  overview: {
    color: "rgba(255,255,255,0.85)",
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "400",
  },
});
