import { FlatList, StyleSheet, View } from "react-native";
import Text from "../Text";

import Button from "../Button";
import CreateCollectionFromLiked from "../CreateCollectionFromLiked";
import MatchedItem from "./MatchedItem";
import useTranslation from "../../service/useTranslation";
import { IGameSummary } from "./types";
import { colors, fontSize, spacing, typography} from "../../constants/design";

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
  container: { marginBottom: spacing.xxl + 6 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: spacing.screen },
  title: { fontSize: typography.bebasSize.section, fontFamily: "Bebas" },
  row: { gap: spacing.sm + 2, marginBottom: spacing.screen },
  empty: { flex: 1, justifyContent: "center", alignItems: "center", marginTop: spacing.xxl + 6 },
  emptyTitle: { color: colors.text, fontSize: typography.bebasSize.empty, fontFamily: "Bebas" },
  emptyDesc: { color: colors.text, fontSize: fontSize.lg, textAlign: "center", marginVertical: spacing.screen, maxWidth: 300 },
});
