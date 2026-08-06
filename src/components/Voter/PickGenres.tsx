import { useMemo } from "react";
import { FlatList, View } from "react-native";
import { useGetGenresQuery } from "../../redux/movie/movieApi";
import GenreChip from "../GenreChip";

export default function PickGenres({
  genres,
  setGenres,
}: {
  genres: number[];
  setGenres: any;
}) {
  const { data: movies } = useGetGenresQuery({ type: "movie" });
  const { data: tv } = useGetGenresQuery({ type: "tv" });

  const combined = useMemo(() => {
    if (!movies?.length && !tv?.length) return [];

    const genresMap = new Map();

    movies?.forEach((genre) => {
      genresMap.set(genre.id, { ...genre, types: ["movie"] });
    });

    tv?.forEach((genre) => {
      if (genresMap.has(genre.id)) {
        const existing = genresMap.get(genre.id);
        genresMap.set(genre.id, {
          ...existing,
          types: [...existing.types, "tv"],
        });
      } else {
        genresMap.set(genre.id, { ...genre, types: ["tv"] });
      }
    });

    return Array.from(genresMap.values()).sort((a, b) =>
      a.name.localeCompare(b.name),
    );
  }, [movies?.length, tv?.length]);

  if (!combined.length) return null;

  return (
    <View style={{ marginVertical: 15 }}>
      <FlatList
        showsHorizontalScrollIndicator={false}
        horizontal
        data={combined}
        keyExtractor={(i) => i.id.toString()}
        renderItem={({ item }) => (
          <GenreChip
            genre={item.name}
            selected={genres.includes(item.id)}
            onPress={() => {
              setGenres((p: number[]) =>
                p.includes(item.id)
                  ? p.filter((i) => i !== item.id)
                  : [...p, item.id],
              );
            }}
          />
        )}
        contentContainerStyle={{ gap: 12 }}
      />
    </View>
  );
}
