import LottieView from "lottie-react-native";
import { StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import useTranslation from "../../service/useTranslation";

interface Props {
  gameEndReason?: string;
  maxRounds?: number;
  type?: string;
  roomId?: string;
  hasMatches: boolean;
}

export default function GameSummaryHeader({
  gameEndReason,
  maxRounds,
  type,
  roomId,
  hasMatches,
}: Props) {
  const t = useTranslation();
  const isCompleted = gameEndReason === "all_users_finished";

  return (
    <View style={styles.section}>
      {hasMatches && (
        <LottieView
          source={require("../../assets/confetti.json")}
          autoPlay
          loop={false}
          style={styles.confetti}
        />
      )}
      <View style={styles.titleContainer}>
        <View style={styles.iconRow}>
          <MaterialCommunityIcons
            name={isCompleted ? "check" : "check-circle"}
            size={40}
            color={isCompleted ? "#FFD700" : "#4CAF50"}
          />
          <Text style={styles.title}>
            {isCompleted
              ? t("game-summary.game-completed")
              : t("game-summary.game-finished")}
          </Text>
        </View>
        {maxRounds != null && (
          <Text style={styles.subtitle}>
            {maxRounds} {t("game-summary.rounds")} •{" "}
            {type === "movie"
              ? t("game-summary.movies")
              : t("game-summary.tv-shows")}{" "}
            • {roomId}
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: { marginBottom: 20, position: "relative" },
  titleContainer: { alignItems: "center" },
  iconRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 8,
  },
  title: {
    fontSize: 55,
    fontFamily: "Bebas",
    color: "#FFFFFF",
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 14,
    color: "rgba(255,255,255,0.7)",
    fontWeight: "500",
    textAlign: "center",
    letterSpacing: 0.3,
  },
  confetti: { ...StyleSheet.absoluteFill, zIndex: 10 },
});
