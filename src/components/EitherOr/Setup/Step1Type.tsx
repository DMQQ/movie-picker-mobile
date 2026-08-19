import TypeCollageStep from "../../Setup/TypeCollageStep";
import { useGetMovieCategoriesWithThumbnailsQuery, useGetTVCategoriesWithThumbnailsQuery } from "../../../redux/movie/movieApi";
import { useAppSelector } from "../../../redux/store";
import useTranslation from "../../../service/useTranslation";

export type EitherOrType = "movie" | "tv" | "custom";

interface Props {
  type: EitherOrType;
  onSelect: (type: EitherOrType) => void;
}

export default function Step1Type({ type, onSelect }: Props) {
  const t = useTranslation();
  const { data: movieCategories, isLoading: moviesLoading } = useGetMovieCategoriesWithThumbnailsQuery();
  const { data: tvCategories, isLoading: tvLoading } = useGetTVCategoriesWithThumbnailsQuery();
  const groups = useAppSelector((s) => s.favourite.groups);

  const moviePosters = (movieCategories ?? []).map((c) => c.featured_poster).filter(Boolean);
  const tvPosters = (tvCategories ?? []).map((c) => c.featured_poster).filter(Boolean);
  const customPosters = groups
    .flatMap((g) => g.movies.map((m) => m.imageUrl))
    .filter(Boolean)
    .slice(0, 10) as string[];

  return (
    <TypeCollageStep
      isLoading={moviesLoading || tvLoading}
      selected={type}
      onSelect={(value) => onSelect(value as EitherOrType)}
      options={[
        { value: "movie", label: t("room.builder.step1.movies"), posters: moviePosters },
        { value: "tv", label: t("room.builder.step1.tv"), posters: tvPosters },
        { value: "custom", label: t("eitherOr.setup.custom") as string || "Custom", posters: customPosters },
      ]}
    />
  );
}
