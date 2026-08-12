import { router } from "expo-router";
import Chip from "../Chip";
import { colors } from "../../constants/design";
import { useAppSelector } from "../../redux/store";
import { useGetAllProvidersQuery } from "../../redux/movie/movieApi";
import useTranslation from "../../service/useTranslation";

export default function ActiveFilters() {
  const t = useTranslation();
  const { mediaType, selectedDecade, selectedGenres, selectedProviders } =
    useAppSelector((s) => s.mediaFilters);
  const { data: providersData } = useGetAllProvidersQuery({});

  const chips: { key: string; label: string }[] = [];

  if (mediaType !== "both") {
    chips.push({
      key: `type-${mediaType}`,
      label: t(
        mediaType === "movie" ? "voter.types.movie" : "voter.types.series",
      ) as string,
    });
  }

  if (selectedDecade !== "all") {
    chips.push({
      key: `decade-${selectedDecade}`,
      label: t(`filters.${selectedDecade}` as any) as string,
    });
  }
  selectedGenres.forEach((g) =>
    chips.push({ key: `genre-${g.id}`, label: g.name }),
  );
  selectedProviders.forEach((id) =>
    chips.push({
      key: `provider-${id}`,
      label:
        providersData?.find((p) => p.provider_id === id)?.provider_name ??
        String(id),
    }),
  );

  if (chips.length === 0) return null;

  return (
    <>
      {chips.map((chip) => (
        <Chip
          key={chip.key}
          style={{ backgroundColor: colors.primary, borderColor: colors.primary }}
          onPress={() =>
            router.push({
              pathname: "/filters",
              params: { presentation: "formSheet" },
            })
          }
        >
          {chip.label}
        </Chip>
      ))}
    </>
  );
}
