import GenreChip from "./GenreChip";

interface GenresViewProps {
  genres: (string | { id: number; name: string })[] | undefined | null;
  light?: boolean;
}

export default function GenresView({ genres, light }: GenresViewProps) {
  return (
    <>
      {genres?.map((genre, index) => {
        const key = typeof genre === "string" ? genre : genre?.id || index;
        const name = typeof genre === "string" ? genre : genre?.name;
        return <GenreChip key={key} genre={name} light={light} />;
      })}
    </>
  );
}
