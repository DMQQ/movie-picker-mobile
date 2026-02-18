import { StyleSheet } from "react-native";
import { Chip } from "react-native-paper";

interface GenresViewProps {
  genres: string[] | undefined | null | { id: number; name: string }[];
}

export default function GenresView({ genres }: GenresViewProps) {
  return (
    <>
      {genres?.map((genre, index) => (
        <Chip key={typeof genre === "string" ? genre : genre?.id || index} style={styles.genreChip} textStyle={styles.genreText} compact>
          {typeof genre === "string" ? genre : genre?.name}
        </Chip>
      ))}
    </>
  );
}

const styles = StyleSheet.create({
  genreChip: {
    backgroundColor: "rgba(255,255,255,0.2)",
    height: 26,
  },
  genreText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "600",
    marginVertical: 0,
    marginHorizontal: 2,
  },
});
