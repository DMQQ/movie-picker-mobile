import { FlatList, StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";
import { Movie } from "../../../types";
import CreateCollectionFromLiked from "../CreateCollectionFromLiked";
import MatchedItem from "./MatchedItem";
import useTranslation from "../../service/useTranslation";
import { IGameSummary } from "./types";

interface Props {
  likes: Partial<Movie>[];
  summary: IGameSummary;
}

export default function YourPicksList({ likes, summary }: Props) {
  const t = useTranslation();

  if (!likes || likes.length === 0) return null;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{t("game-summary.your-picks")}</Text>
        <CreateCollectionFromLiked data={likes} />
      </View>
      <FlatList
        data={likes}
        renderItem={({ item }) => (
          <MatchedItem
            {...item}
            summary={summary}
            badge={(summary.matchedMovies || []).findIndex((m) => m.id === item.id) >= 0}
          />
        )}
        numColumns={3}
        keyExtractor={(item) => item.id!.toString()}
        columnWrapperStyle={styles.row}
        showsVerticalScrollIndicator={false}
        scrollEnabled={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginTop: 30 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 15 },
  title: { fontSize: 35, fontFamily: "Bebas" },
  row: { gap: spacing.sm + 2, marginBottom: 15 },
});
