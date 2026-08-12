import { Dimensions, Pressable, StyleSheet, View } from "react-native";
import Text from "../Text";
import { colors, fontWeight, fontSize, radius, spacing } from "../../constants/design";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { Movie, MovieDetails } from "../../../types";
import { ThumbnailSizes } from "../Thumbnail";
import GenresView from "../GenresView";
import RatingIcons from "../RatingIcons";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

interface MovieResultCardProps {
  movie: Movie;
  details?: MovieDetails | null;
  onPress?: () => void;
  width?: number;
  height?: number;
}

export const CARD_WIDTH = screenWidth * 0.85;
export const CARD_HEIGHT = screenHeight * 0.6;

export default function MovieResultCard({
  movie,
  details,
  onPress,
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
          colors={["transparent", "rgba(0,0,0,0.6)", "rgba(0,0,0,0.95)", colors.appBackground]}
          locations={[0, 0.4, 0.75, 1]}
          style={styles.infoOverlay}
        >
          <Text style={styles.movieTitle} numberOfLines={2}>
            {movie.title || movie.name}
          </Text>

          <View style={styles.ratingRow}>
            {movie.vote_average > 0 && (
              <RatingIcons size={20} vote={movie.vote_average} showText />
            )}
            {details?.runtime ? (
              <>
                <Text style={styles.dotSeparator}>•</Text>
                <Text style={styles.ratingText}>{details.runtime} min</Text>
              </>
            ) : null}
          </View>

          {details?.genres && details.genres.length > 0 && (
            <View style={styles.genresRow}>
              <GenresView genres={details.genres.slice(0, 3)} />
            </View>
          )}

          {movie?.overview && (
            <Text style={styles.overview} numberOfLines={3}>
              {movie.overview}
            </Text>
          )}
        </LinearGradient>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.lg + 4,
    overflow: "hidden",
    backgroundColor: colors.appBackground,
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
    padding: spacing.xl,
    paddingTop: spacing.xl * 3,
    justifyContent: "flex-end",
  },
  movieTitle: {
    fontSize: 32,
    color: colors.text,
    fontFamily: "Bebas",
    textShadowColor: "rgba(0,0,0,0.5)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm - 2,
    marginBottom: spacing.sm - 2,
  },
  ratingText: {
    color: "#e2e8f0",
    fontWeight: fontWeight.semibold,
    fontSize: fontSize.md,
  },
  dotSeparator: {
    color: "#64748b",
    fontSize: fontSize.md,
  },
  genresRow: {
    flexDirection: "row",
    flexWrap: "nowrap",
    overflow: "hidden",
    gap: spacing.sm - 2,
    marginBottom: spacing.sm + 2,
  },
  overview: {
    color: "rgba(255,255,255,0.85)",
    fontSize: fontSize.md - 1,
    lineHeight: 18,
    fontWeight: fontWeight.normal,
  },
});
