import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { StyleSheet, TouchableOpacity } from "react-native";
import Text from "./Text";
import PlatformBlurView from "./PlatformBlurView";
import { Movie } from "../../types";
import { useAppSelector } from "../redux/store";
import { useGetMyRatingQuery } from "../redux/ratings/ratingsApi";
import { colors, fontSize, fontWeight, radius, spacing } from "../constants/design";

interface Props {
  movie: Movie;
  contentType: string;
}

export default function RateMovieButton({ movie, contentType }: Props) {
  const user = useAppSelector((s) => s.auth.user);

  const { data: myRating } = useGetMyRatingQuery(
    { contentType, contentId: movie.id },
    { skip: !user || !movie?.id },
  );

  if (!user) return null;

  const handlePress = () => {
    router.push({
      pathname: "/rate-movie",
      params: {
        movieId: String(movie.id),
        contentType,
        rating: myRating?.rating ? String(myRating.rating) : "",
        note: myRating?.review ?? "",
      },
    });
  };

  return (
    <PlatformBlurView style={styles.blur}>
      <TouchableOpacity style={styles.row} onPress={handlePress} activeOpacity={0.7}>
        <MaterialCommunityIcons
          name={myRating ? "star" : "star-outline"}
          size={18}
          color={myRating ? "#FFD700" : colors.placeholder}
        />
        <Text style={styles.label}>
          {myRating ? `Your rating: ${myRating.rating}/10` : "Rate this movie"}
        </Text>
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
  label: {
    flex: 1,
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
    color: colors.text,
  },
});
