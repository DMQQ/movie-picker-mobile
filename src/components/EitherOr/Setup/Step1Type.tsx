import TypeCollageStep from "../../Setup/TypeCollageStep";
import { useGetMovieCategoriesWithThumbnailsQuery, useGetTVCategoriesWithThumbnailsQuery } from "../../../redux/movie/movieApi";
import { useAppSelector } from "../../../redux/store";
import useTranslation from "../../../service/useTranslation";

export type EitherOrType = "movie" | "tv" | "custom";

interface Props {
  type: EitherOrType;
  onSelect: (type: EitherOrType) => void;
  visibleTypes?: EitherOrType[];
}

export default function Step1Type({ type, onSelect, visibleTypes }: Props) {
  const t = useTranslation();
  const { data: movieCategories, isLoading: moviesLoading } = useGetMovieCategoriesWithThumbnailsQuery();
  const { data: tvCategories, isLoading: tvLoading } = useGetTVCategoriesWithThumbnailsQuery();

  const moviePosters = (movieCategories ?? []).map((c) => c.featured_poster).filter(Boolean);
  const tvPosters = (tvCategories ?? []).map((c) => c.featured_poster).filter(Boolean);
  const customPosters = [...moviePosters.slice(2, 5), ...tvPosters.slice(2, 5)].slice(0, 5);

  const allOptions = [
    { value: "movie" as EitherOrType, label: t("room.builder.step1.movies"), posters: moviePosters },
    { value: "tv" as EitherOrType, label: t("room.builder.step1.tv"), posters: tvPosters },
    { value: "custom" as EitherOrType, label: t("eitherOr.setup.custom") as string || "Custom", posters: customPosters },
  ];

  const options = visibleTypes ? allOptions.filter((o) => visibleTypes.includes(o.value)) : allOptions;

  return (
    <TypeCollageStep
      isLoading={moviesLoading || tvLoading}
      selected={type}
      onSelect={(value) => onSelect(value as EitherOrType)}
      options={options}
    />
  );
}
