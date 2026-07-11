import { FlatList, StyleSheet, View } from "react-native";
import { Button, Text } from "react-native-paper";
import CreateCollectionFromLiked from "../CreateCollectionFromLiked";
import MatchedItem from "./MatchedItem";
import useTranslation from "../../service/useTranslation";
import { IGameSummary } from "./types";

interface Props {
  summary: IGameSummary;
  onTryAgain: () => void;
}

export default function MatchedMoviesSection({ summary, onTryAgain }: Props) {
  const t = useTranslation();
  const matches = summary.matchedMovies;

  if (!matches || matches.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyTitle}>{t("game-summary.no-matches")}</Text>
        <Text style={styles.emptyDesc}>{t("game-summary.no-matches-desc")}</Text>
        <Button onPress={onTryAgain}>{t("game-summary.try-again")}</Button>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{t("game-summary.matched-movies")}</Text>
        <CreateCollectionFromLiked data={matches} />
      </View>
      <FlatList
        data={matches}
        renderItem={({ item }) => <MatchedItem {...item} summary={summary} />}
        numColumns={3}
        keyExtractor={(item) => item.id.toString()}
        columnWrapperStyle={styles.row}
        showsVerticalScrollIndicator={false}
        scrollEnabled={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 30 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 15 },
  title: { fontSize: 35, fontFamily: "Bebas" },
  row: { gap: 10, marginBottom: 15 },
  empty: { flex: 1, justifyContent: "center", alignItems: "center", marginTop: 30 },
  emptyTitle: { color: "#fff", fontSize: 45, fontFamily: "Bebas" },
  emptyDesc: { color: "#fff", fontSize: 16, textAlign: "center", marginVertical: 15, maxWidth: 300 },
});
