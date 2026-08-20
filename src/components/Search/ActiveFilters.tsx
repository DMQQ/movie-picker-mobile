import { Text, View, StyleSheet } from "react-native";
import Chip from "../Chip";
import { colors, fontSize, fontWeight } from "../../constants/design";
import { useAppDispatch, useAppSelector } from "../../redux/store";
import { useGetAllProvidersQuery } from "../../redux/movie/movieApi";
import { setMediaType, setDecade, toggleGenre, toggleProvider } from "../../redux/mediaFilters/mediaFiltersSlice";
import useTranslation from "../../service/useTranslation";

export default function ActiveFilters() {
  const t = useTranslation();
  const dispatch = useAppDispatch();
  const { mediaType, selectedDecade, selectedGenres, selectedProviders } =
    useAppSelector((s) => s.mediaFilters);
  const { data: providersData } = useGetAllProvidersQuery({});

  const chips: {
    key: string;
    label: string;
    icon?: string;
    image?: { uri: string };
    onDeselect: () => void;
  }[] = [];

  if (mediaType !== "both") {
    chips.push({
      key: `type-${mediaType}`,
      label: t(
        mediaType === "movie" ? "voter.types.movie" : "voter.types.series",
      ) as string,
      icon: mediaType === "movie" ? "movie-open" : "television",
      onDeselect: () => dispatch(setMediaType("both")),
    });
  }

  if (selectedDecade !== "all") {
    chips.push({
      key: `decade-${selectedDecade}`,
      label: t(`filters.${selectedDecade}` as any) as string,
      icon: "calendar-range",
      onDeselect: () => dispatch(setDecade("all")),
    });
  }
  selectedGenres.forEach((g) =>
    chips.push({
      key: `genre-${g.id}`,
      label: g.name,
      icon: "tag",
      onDeselect: () => dispatch(toggleGenre(g)),
    }),
  );
  selectedProviders.forEach((id) => {
    const provider = providersData?.find((p) => p.provider_id === id);
    chips.push({
      key: `provider-${id}`,
      label: provider?.provider_name ?? String(id),
      image: provider?.logo_path
        ? { uri: `https://image.tmdb.org/t/p/w92${provider.logo_path}` }
        : undefined,
      onDeselect: () => dispatch(toggleProvider(id)),
    });
  });

  if (chips.length === 0) {
    return (
      <View style={styles.hintContainer}>
        <Text style={styles.hint}>{t("filters.none") as string}</Text>
      </View>
    );
  }

  return (
    <>
      {chips.map((chip) => (
        <Chip
          key={chip.key}
          icon={chip.icon}
          iconColor={colors.text}
          image={chip.image}
          removable
          contained
          onPress={chip.onDeselect}
        >
          {chip.label}
        </Chip>
      ))}
    </>
  );
}

const styles = StyleSheet.create({
  hintContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  hint: {
    color: colors.placeholder,
    fontSize: fontSize.md,
    fontWeight: fontWeight.normal,
    textAlign: "center",
  },
});
