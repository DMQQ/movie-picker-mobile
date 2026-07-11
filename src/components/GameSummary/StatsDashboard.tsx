import { StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";
import { MaterialIcons } from "@expo/vector-icons";
import useTranslation from "../../service/useTranslation";
import { IGameSummary } from "./types";

interface Props {
  summary: IGameSummary;
  userId: string | null;
}

export default function StatsDashboard({ summary, userId }: Props) {
  const t = useTranslation();
  const totalSwiped = summary.users.find((u) => u.userId === userId)?.swipedMovies?.totalSwiped;

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.row}>
          <View style={styles.block}>
            <View style={styles.header}>
              <MaterialIcons name="people" size={18} color="#64B5F6" />
              <Text style={styles.label}>{t("game-summary.players")}</Text>
            </View>
            <Text style={[styles.value, { color: "#64B5F6" }]}>{summary.totalUsers}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.block}>
            <View style={styles.header}>
              <MaterialIcons name="favorite" size={18} color="#FF6B6B" />
              <Text style={styles.label}>{t("game-summary.matches")}</Text>
            </View>
            <Text style={[styles.value, { color: "#FF6B6B" }]}>{summary.totalMatches}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.block}>
            <View style={styles.header}>
              <MaterialIcons name="touch-app" size={18} color="#81C784" />
              <Text style={styles.label}>{t("game-summary.total-picks")}</Text>
            </View>
            <Text style={[styles.value, { color: "#81C784" }]}>{totalSwiped || "-"}</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 24 },
  card: { backgroundColor: "rgba(255,255,255,0.08)", borderRadius: 25, padding: 15, borderWidth: 1, borderColor: "rgba(255,255,255,0.12)" },
  row: { flexDirection: "row", alignItems: "center" },
  block: { flex: 1, alignItems: "center" },
  header: { flexDirection: "row", alignItems: "center", gap: 3, marginBottom: 8 },
  label: { fontSize: 10, flexWrap: "nowrap", fontWeight: "600", color: "rgba(255,255,255,0.8)", textTransform: "uppercase", letterSpacing: 0.5 },
  value: { fontSize: 35, fontWeight: "bold", fontFamily: "Bebas", textShadowColor: "rgba(0,0,0,0.3)", textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 2 },
  divider: { width: 1, height: 40, backgroundColor: "rgba(255,255,255,0.2)", marginHorizontal: 15 },
});
