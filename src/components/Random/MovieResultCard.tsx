import { Dimensions, Platform, Pressable, StyleSheet, TouchableOpacity, View } from "react-native";
import { Text, Chip } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { Movie, MovieDetails } from "../../../types";
import { ThumbnailSizes } from "../Thumbnail";
import { IconShareButton } from "../ShareTicketButton";
import useTranslation from "../../service/useTranslation";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

interface MovieResultCardProps {
  movie: Movie;
  details?: MovieDetails | null;
  onPress?: () => void;
  onSuperLike?: () => void;
  onBlock?: () => void;
  isSuperLiked?: boolean;
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
  isSuperLiked = false,
  width = CARD_WIDTH,
  height = CARD_HEIGHT,
}: MovieResultCardProps) {
  const t = useTranslation();
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
            {movie.vote_average > 0 && (
              <>
                <MaterialCommunityIcons name="star" size={16} color="#fbbf24" />
                <Text style={styles.ratingText}>{movie.vote_average.toFixed(1)}</Text>
              </>
            )}
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

          {movie?.overview && (
            <Text style={styles.overview} numberOfLines={3}>
              {movie.overview}
            </Text>
          )}

          <View style={styles.bottomRow}>
            <View style={styles.hintRow}>
              <Text style={styles.hintText}>{t("fortune-wheel.tap-for-details")}</Text>
              <MaterialCommunityIcons name="chevron-right" size={14} color="rgba(255,255,255,0.5)" />
            </View>

            <View style={styles.actionIcons}>
              {onSuperLike && (
                <TouchableOpacity onPress={onSuperLike} style={styles.iconButton}>
                  <MaterialCommunityIcons name={isSuperLiked ? "star" : "star-outline"} size={24} color="#fbbf24" />
                </TouchableOpacity>
              )}
              {onBlock && (
                <TouchableOpacity onPress={onBlock} style={styles.iconButton}>
                  <MaterialCommunityIcons name="block-helper" size={22} color="#ef4444" />
                </TouchableOpacity>
              )}
              <IconShareButton movie={movie} />
            </View>
          </View>
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
    fontSize: 32,
    color: "#fff",
    fontFamily: "Bebas",
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
  bottomRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 12,
  },
  hintRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  hintText: {
    color: "rgba(255,255,255,0.5)",
    fontSize: 12,
    fontWeight: "500",
  },
  actionIcons: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  iconButton: {
    padding: 4,
  },
});
