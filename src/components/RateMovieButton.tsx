import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import Text from "./Text";
import AvatarText from "./AvatarText";
import PlatformBlurView from "./PlatformBlurView";
import { Movie } from "../../types";
import { useAppSelector } from "../redux/store";
import { useGetMyRatingQuery } from "../redux/ratings/ratingsApi";
import { getUserAvatarColor, getInitials } from "../utils/avatar";
import useTranslation from "../service/useTranslation";
import { colors, fontSize, fontWeight, radius, spacing } from "../constants/design";

interface Props {
  movie: Movie;
  contentType: string;
}

function formatDate(unix: number) {
  return new Date(unix * 1000).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function StarRow({ rating }: { rating: number }) {
  return (
    <View style={styles.starRow}>
      {Array.from({ length: 10 }, (_, i) => (
        <MaterialCommunityIcons
          key={i}
          name={i < rating ? "star" : "star-outline"}
          size={14}
          color={i < rating ? "#FFD700" : colors.border}
        />
      ))}
      <Text style={styles.ratingNum}>{rating}/10</Text>
    </View>
  );
}

export default function RateMovieButton({ movie, contentType }: Props) {
  const t = useTranslation();
  const user = useAppSelector((s) => s.auth.user);

  const { data: myRating } = useGetMyRatingQuery(
    { contentType, contentId: movie.id },
    { skip: !user || user.provider === "anonymous" || !movie?.id },
  );

  const handlePress = () => {
    router.push({
      pathname: "/rate-movie",
      params: {
        movieId: String(movie.id),
        contentType,
        rating: myRating?.rating != null ? String(myRating.rating) : "",
        review: myRating?.review ?? "",
      },
    });
  };

  const avatar = user ? (
    <AvatarText
      label={getInitials(user.name)}
      size={38}
      style={{ backgroundColor: getUserAvatarColor(user.name) }}
    />
  ) : null;

  return (
    <PlatformBlurView style={styles.blur}>
      <TouchableOpacity style={styles.row} onPress={handlePress} activeOpacity={0.7}>
        {myRating ? avatar : null}
        <View style={styles.content}>
          {myRating ? (
            <>
              <Text style={styles.reviewLabel}>{t("ratings.yourReview")}</Text>
              {myRating.review ? (
                <Text style={styles.review} numberOfLines={2}>{myRating.review}</Text>
              ) : null}
              <View style={styles.bottomRow}>
                <StarRow rating={myRating.rating} />
                <Text style={styles.date}>{formatDate(myRating.createdAt)}</Text>
              </View>
            </>
          ) : (
            <View style={styles.ratePrompt}>
              <MaterialCommunityIcons name="star-outline" size={16} color={colors.placeholder} />
              <Text style={styles.promptText}>{t("ratings.rateTitle")}</Text>
            </View>
          )}
        </View>
        <MaterialCommunityIcons name="chevron-right" size={18} color={colors.placeholder} />
      </TouchableOpacity>
    </PlatformBlurView>
  );
}

const styles = StyleSheet.create({
  blur: {
    borderRadius: radius.card,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md + 2,
  },
  content: {
    flex: 1,
    gap: spacing.xs + 2,
  },
  ratePrompt: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  promptText: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
    color: colors.text,
  },
  starRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  ratingNum: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    color: "#FFD700",
    marginLeft: spacing.xs,
  },
  reviewLabel: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
    color: colors.text,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  review: {
    fontSize: fontSize.sm + 1,
    color: colors.text,
    lineHeight: fontSize.sm + 6,
  },
  bottomRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  date: {
    fontSize: fontSize.xs,
    color: "rgba(255,255,255,0.25)",
  },
});
