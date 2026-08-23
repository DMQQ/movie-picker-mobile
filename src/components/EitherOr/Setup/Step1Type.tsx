import { View, StyleSheet } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import TypeCollageStep from "../../Setup/TypeCollageStep";
import { useGetMovieCategoriesWithThumbnailsQuery, useGetTVCategoriesWithThumbnailsQuery } from "../../../redux/movie/movieApi";
import Text from "../../Text";
import Touch from "../../Touch";
import useTranslation from "../../../service/useTranslation";
import { colors, fontSize, fontWeight, radius, spacing, withAlpha } from "../../../constants/design";
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
  const { data: movieCategories, isLoading: moviesLoading } = useGetMovieCategoriesWithThumbnailsQuery();
  const { data: tvCategories, isLoading: tvLoading } = useGetTVCategoriesWithThumbnailsQuery();

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
  const hasCustom = isCustom && customMovies.length > 0;

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
        <Touch scaleTo={0.97} onPress={handleBannerPress} style={[styles.customBanner, isCustom && styles.customBannerSelected]}>
          <View style={[styles.customBannerIcon, isCustom && styles.customBannerIconSelected]}>
            <MaterialCommunityIcons name="movie-filter" size={20} color={isCustom ? colors.primary : colors.placeholder} />
          </View>
          <View style={styles.customBannerText}>
            <Text style={[styles.customBannerTitle, isCustom && styles.customBannerTitleSelected]}>Pick your own movies</Text>
            <Text style={styles.customBannerSubtitle}>
              {hasCustom ? `${customMovies.length} movies selected · tap to change` : "Choose exactly what gets swiped"}
            </Text>
          </View>
          <MaterialCommunityIcons name="chevron-right" size={22} color={isCustom ? colors.primary : colors.placeholder} />
        </Touch>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: spacing.md,
  },
  customBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.card,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md + 2,
    borderWidth: 1,
    borderColor: "transparent",
  },
  customBannerSelected: {
    backgroundColor: withAlpha(colors.primary, 0.1),
    borderColor: withAlpha(colors.primary, 0.35),
  },
  customBannerIcon: {
    width: 38,
    height: 38,
    borderRadius: radius.sm,
    backgroundColor: colors.input,
    alignItems: "center",
    justifyContent: "center",
  },
  customBannerIconSelected: {
    backgroundColor: withAlpha(colors.primary, 0.15),
  },
  customBannerText: {
    flex: 1,
    gap: 2,
  },
  customBannerTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.text,
  },
  customBannerTitleSelected: {
    color: colors.primary,
  },
  customBannerSubtitle: {
    fontSize: fontSize.sm,
    color: colors.placeholder,
  },
});
