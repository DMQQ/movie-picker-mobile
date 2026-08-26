import { View, StyleSheet } from "react-native";
import TypeCollageStep from "../Setup/TypeCollageStep";
import CustomMoviesBanner from "../CustomMoviesBanner";
import { useGetCategoriesWithThumbnailsQuery } from "../../redux/movie/movieApi";
import useTranslation from "../../service/useTranslation";
import { spacing } from "../../constants/design";
import { type PickedMovie } from "../../redux/moviePicker/moviePickerSlice";

export default function PickCategory({
  setCategory,
  category,
  customMovies = [],
  onPickCustom,
  isCustomSelected = false,
  onClearCustom,
}: {
  setCategory: (cat: string) => void;
  category: string;
  customMovies?: PickedMovie[];
  onPickCustom?: () => void;
  isCustomSelected?: boolean;
  onClearCustom?: () => void;
}) {
  const t = useTranslation();
  const { data: movieCategories, isLoading: moviesLoading } = useGetCategoriesWithThumbnailsQuery({ type: "movie" });
  const { data: tvCategories, isLoading: tvLoading } = useGetCategoriesWithThumbnailsQuery({ type: "tv" });

  const moviePosters = (movieCategories ?? []).map((c) => c.featured_poster).filter(Boolean);
  const tvPosters = (tvCategories ?? []).map((c) => c.featured_poster).filter(Boolean);
  const mixedPosters = [moviePosters[0], tvPosters[0], moviePosters[1], tvPosters[1]].filter(Boolean);

  const isCustom = isCustomSelected;

  const handleTileSelect = (value: string) => {
    onClearCustom?.();
    setCategory(value);
  };

  return (
    <View style={styles.container}>
      <TypeCollageStep
        isLoading={moviesLoading || tvLoading}
        selected={isCustom ? "" : category}
        onSelect={handleTileSelect}
        style={{ paddingTop: spacing.xl }}
        options={[
          { value: "movie", label: t("voter.types.movie"), posters: moviePosters },
          { value: "Series", label: t("voter.types.series"), posters: tvPosters },
          { value: "Mixed", label: t("voter.types.mixed"), posters: mixedPosters },
        ]}
      />
      <CustomMoviesBanner
        selected={isCustomSelected}
        moviesCount={customMovies.length}
        onPress={() => onPickCustom?.()}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: spacing.md,
  },
});
