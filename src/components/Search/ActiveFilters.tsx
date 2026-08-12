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

  const chips: {
    key: string;
    label: string;
    icon?: string;
    image?: { uri: string };
  }[] = [];

  if (mediaType !== "both") {
    chips.push({
      key: `type-${mediaType}`,
      label: t(
        mediaType === "movie" ? "voter.types.movie" : "voter.types.series",
      ) as string,
      icon: mediaType === "movie" ? "movie-open" : "television",
    });
  }

  if (selectedDecade !== "all") {
    chips.push({
      key: `decade-${selectedDecade}`,
      label: t(`filters.${selectedDecade}` as any) as string,
      icon: "calendar-range",
    });
  }
  selectedGenres.forEach((g) =>
    chips.push({ key: `genre-${g.id}`, label: g.name, icon: "tag" }),
  );
  selectedProviders.forEach((id) => {
    const provider = providersData?.find((p) => p.provider_id === id);
    chips.push({
      key: `provider-${id}`,
      label: provider?.provider_name ?? String(id),
      image: provider?.logo_path
        ? { uri: `https://image.tmdb.org/t/p/w92${provider.logo_path}` }
        : undefined,
    });
  });

  if (chips.length === 0) return null;

  return (
    <>
      {chips.map((chip) => (
        <Chip
          key={chip.key}
          icon={chip.icon}
          iconColor={colors.text}
          image={chip.image}
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
