import { Dimensions, ScrollView, StyleSheet, View } from "react-native";
import { Icon, Text } from "react-native-paper";
import { useGetGamesQuery } from "../redux/lists/listsApi";
import GameCard from "./GameCard";

const CARD_WIDTH = Dimensions.get("window").width * 0.72;
const CARD_HEIGHT = 190;
const PREVIEW_LIMIT = 3;

export default function RecentGames() {
  const { data, isLoading } = useGetGamesQuery();
  const allGames = data?.games ?? [];
  const games = [...allGames].reverse().slice(0, PREVIEW_LIMIT);

  if (isLoading) {
    return (
      <View style={styles.placeholder}>
        <Icon source="loading" size={16} color="rgba(255,255,255,0.3)" />
        <Text style={styles.placeholderText}>Loading games…</Text>
      </View>
    );
  }

  if (games.length === 0) {
    return (
      <View style={styles.placeholder}>
        <Icon source="controller-classic-outline" size={22} color="rgba(255,255,255,0.15)" />
        <Text style={styles.placeholderText}>No games yet — start swiping!</Text>
      </View>
    );
  }

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      decelerationRate="fast"
      snapToInterval={CARD_WIDTH + 12}
      snapToAlignment="start"
      contentContainerStyle={styles.list}
    >
      {games.map((g) => (
        <GameCard key={g.id} game={g} width={CARD_WIDTH} height={CARD_HEIGHT} />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  list: { gap: 12, paddingVertical: 2, paddingRight: 4 },
  placeholder: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 18,
  },
  placeholderText: { fontSize: 13, color: "rgba(255,255,255,0.3)" },
});
