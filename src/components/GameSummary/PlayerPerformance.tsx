import { StyleSheet, View } from "react-native";
import { Avatar, Text } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { getUserAvatarColor } from "../../utils/avatar";
import useTranslation from "../../service/useTranslation";
import { IGameSummary } from "./types";

export default function PlayerPerformance({
  users,
}: {
  users: IGameSummary["users"];
}) {
  const t = useTranslation();
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t("game-summary.player-performance")}</Text>
      <View style={styles.grid}>
        {users.map((user, index) => (
          <View key={index} style={styles.chip}>
            <View style={styles.avatarWrap}>
              <Avatar.Text
                size={28}
                label={user.username?.[0].toUpperCase() || "U"}
                color="white"
                style={{
                  borderWidth: 1.5,
                  borderColor: "rgba(255,255,255,0.4)",
                  backgroundColor: getUserAvatarColor(user.username),
                }}
              />
              <View
                style={[
                  styles.indicator,
                  user.finished ? styles.finished : styles.inProgress,
                ]}
              >
                {user.finished ? (
                  <MaterialCommunityIcons name="check" size={9} color="white" />
                ) : (
                  <MaterialCommunityIcons
                    name="loading"
                    size={8}
                    color="white"
                  />
                )}
              </View>
            </View>
            <Text style={styles.name}>{user.username}</Text>
            <View style={styles.metrics}>
              <MaterialCommunityIcons
                name="thumb-up"
                size={12}
                color="#FF6B6B"
              />
              <Text style={styles.count}>
                {user.swipedMovies?.liked?.length ?? 0}
              </Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 30 },
  title: {
    fontSize: 32,
    fontFamily: "Bebas",
    marginBottom: 16,
    color: "#FFFFFF",
    letterSpacing: 1,
    textShadowColor: "rgba(0,0,0,0.3)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    justifyContent: "flex-start",
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 25,
    paddingVertical: 8,
    paddingHorizontal: 8,
    paddingRight: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
    gap: 8,
    marginBottom: 8,
  },
  avatarWrap: { position: "relative" },
  indicator: {
    position: "absolute",
    bottom: -1,
    right: -1,
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 1.5,
    borderColor: "white",
    alignItems: "center",
    justifyContent: "center",
  },
  finished: { backgroundColor: "#4CAF50" },
  inProgress: { backgroundColor: "#FF9800" },
  name: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
    letterSpacing: 0.2,
  },
  metrics: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  count: { fontSize: 12, fontWeight: "600", color: "#FFFFFF" },
});
