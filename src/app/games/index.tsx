import { Dimensions, FlatList, StyleSheet, View } from "react-native";
import { Icon, Text } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import PageHeading from "../../components/PageHeading";
import GameCard from "../../components/GameCard";
import { useGetGamesQuery } from "../../redux/lists/listsApi";

const CARD_WIDTH = Dimensions.get("window").width - 32;
const CARD_HEIGHT = 210;

export default function AllGamesScreen() {
  const { data, isLoading } = useGetGamesQuery();
  const games = [...(data?.games ?? [])].reverse();
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <PageHeading title="All Games" />

      <FlatList
        data={games}
        keyExtractor={(g) => g.id}
        renderItem={({ item }) => <GameCard game={item} width={CARD_WIDTH} height={CARD_HEIGHT} />}
        contentContainerStyle={{
          paddingTop: 120,
          paddingBottom: insets.bottom + 24,
          paddingHorizontal: 16,
          gap: 12,
        }}
        ListHeaderComponent={
          games.length > 0 ? (
            <Text style={styles.countLabel}>{games.length} sessions played</Text>
          ) : null
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            {isLoading ? (
              <Icon source="loading" size={28} color="rgba(255,255,255,0.2)" />
            ) : (
              <>
                <Icon
                  source="controller-classic-outline"
                  size={44}
                  color="rgba(255,255,255,0.07)"
                />
                <Text style={styles.emptyText}>No games yet</Text>
                <Text style={styles.emptyHint}>
                  Start a swipe session to see your history here
                </Text>
              </>
            )}
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },

  countLabel: {
    fontSize: 11,
    color: "rgba(255,255,255,0.25)",
    paddingBottom: 4,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },

  empty: { alignItems: "center", gap: 10, paddingTop: 72 },
  emptyText: { fontSize: 15, fontWeight: "600", color: "rgba(255,255,255,0.25)" },
  emptyHint: {
    fontSize: 13,
    color: "rgba(255,255,255,0.15)",
    textAlign: "center",
    paddingHorizontal: 40,
  },
});
