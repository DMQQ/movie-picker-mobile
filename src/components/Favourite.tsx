import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Movie } from "../../types";
import { useAppSelector } from "../redux/store";
import useTranslation from "../service/useTranslation";
import { fontSize, spacing } from "../constants/design";

export default function CustomFavourite({
  movie,
  showLabel = true,
}: {
  movie: Movie;
  showLabel?: boolean;
}) {
  const t = useTranslation();
  const favourites = useAppSelector((state) => state.favourite.groups);

  const isFavorite = favourites?.some((group) =>
    group.movies.some((m) => m?.id === movie?.id),
  );

  if (!movie) return null;

  const openSheet = () => {
    router.push({
      pathname: "/favourite-groups",
      params: {
        movieId: movie.id,
        movieTitle: movie.title ?? "",
        movieName: movie.name ?? "",
        moviePosterPath: movie.poster_path ?? "",
        movieType: movie.type ?? (movie?.title !== undefined ? "movie" : "tv"),
      },
    });
  };

  return (
    <View>
      <TouchableOpacity style={styles.iconButton} onPress={openSheet}>
        <>
          <MaterialCommunityIcons
            name={isFavorite ? "bookmark-check" : "bookmark"}
            size={35}
            color="#fff"
          />
          {showLabel && (
            <Text style={styles.iconText}>{t("quick-actions.my-lists")}</Text>
          )}
        </>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  iconText: {
    fontFamily: "Bebas",
    fontSize: fontSize.xxl,
    color: "#fff",
  },
  iconButton: {
    justifyContent: "center",
    alignItems: "center",
    gap: spacing.sm + 2,
    overflow: "hidden",
  },
});
