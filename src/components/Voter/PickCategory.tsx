import TypeCollageStep from "../Setup/TypeCollageStep";
import { useGetMovieCategoriesWithThumbnailsQuery, useGetTVCategoriesWithThumbnailsQuery } from "../../redux/movie/movieApi";
import useTranslation from "../../service/useTranslation";

export default function PickCategory({
  setCategory,
  category,
}: {
  setCategory: any;
  category: string;
}) {
  const t = useTranslation();
  const { data: movieCategories, isLoading: moviesLoading } = useGetMovieCategoriesWithThumbnailsQuery();
  const { data: tvCategories, isLoading: tvLoading } = useGetTVCategoriesWithThumbnailsQuery();

  const moviePosters = (movieCategories ?? []).map((c) => c.featured_poster).filter(Boolean);
  const tvPosters = (tvCategories ?? []).map((c) => c.featured_poster).filter(Boolean);
  const mixedPosters = [moviePosters[0], tvPosters[0], moviePosters[1], tvPosters[1]].filter(Boolean);

  return (
    <TypeCollageStep
      isLoading={moviesLoading || tvLoading}
      selected={category}
      onSelect={setCategory}
      options={[
        { value: "movie", label: t("voter.types.movie"), posters: moviePosters },
        { value: "Series", label: t("voter.types.series"), posters: tvPosters },
        { value: "Mixed", label: t("voter.types.mixed"), posters: mixedPosters },
      ]}
    />
  );
}
