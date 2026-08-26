import { View, StyleSheet } from "react-native";
import TypeCollageStep from "../../Setup/TypeCollageStep";
import CustomMoviesBanner from "../../CustomMoviesBanner";
import { useGetCategoriesWithThumbnailsQuery } from "../../../redux/movie/movieApi";
import useTranslation from "../../../service/useTranslation";
import { spacing } from "../../../constants/design";
import { type PickedMovie } from "../../../redux/moviePicker/moviePickerSlice";

export type EitherOrType = "movie" | "tv" | "custom";

interface Props {
  type: EitherOrType;
  onSelect: (type: EitherOrType) => void;
  visibleTypes?: EitherOrType[];
  customMovies: PickedMovie[];
  onPickCustom: () => void;
}

export default function Step1Type({ type, onSelect, visibleTypes, customMovies, onPickCustom }: Props) {
  const t = useTranslation();
  const { data: movieCategories, isLoading: moviesLoading } = useGetCategoriesWithThumbnailsQuery({ type: "movie" });
  const { data: tvCategories, isLoading: tvLoading } = useGetCategoriesWithThumbnailsQuery({ type: "tv" });

  const moviePosters = (movieCategories ?? []).map((c) => c.featured_poster).filter(Boolean);
  const tvPosters = (tvCategories ?? []).map((c) => c.featured_poster).filter(Boolean);

  const allOptions = [
    { value: "movie" as EitherOrType, label: t("room.builder.step1.movies"), posters: moviePosters },
    { value: "tv" as EitherOrType, label: t("room.builder.step1.tv"), posters: tvPosters },
  ];

  const showCollage = !visibleTypes || visibleTypes.some((v) => v === "movie" || v === "tv");
  const showBanner = !visibleTypes || visibleTypes.includes("custom");
  const collageOptions = visibleTypes ? allOptions.filter((o) => visibleTypes.includes(o.value)) : allOptions;

  const isCustom = type === "custom";

  const handleBannerPress = () => {
    onSelect("custom");
    onPickCustom();
  };

  return (
    <View style={styles.container}>
      {showCollage && collageOptions.length > 0 && (
        <TypeCollageStep
          isLoading={moviesLoading || tvLoading}
          selected={isCustom ? "" : type}
          onSelect={(value) => onSelect(value as EitherOrType)}
          options={collageOptions}
          style={showBanner ? { paddingTop: spacing.xl } : undefined}
        />
      )}
      {showBanner && (
        <CustomMoviesBanner
          selected={isCustom}
          moviesCount={customMovies.length}
          onPress={handleBannerPress}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: spacing.md,
  },
});
