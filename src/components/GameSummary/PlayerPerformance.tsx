import { StyleSheet, View } from "react-native";
import UserAvatar from "../UserAvatar";
import Text from "../Text";
import { colors, fontWeight, fontSize, radius, spacing} from "../../constants/design";

import { MaterialCommunityIcons } from "@expo/vector-icons";
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
              <UserAvatar
                name={user.username || "U"}
                size={28}
                borderWidth={1.5}
                borderColor="rgba(255,255,255,0.4)"
              />
              <View
                style={[
                  styles.indicator,
                  user.finished ? styles.finished : styles.inProgress,
                ]}
              >
                {user.finished ? (
                  <MaterialCommunityIcons name="check" size={9} color={colors.text} />
                ) : (
                  <MaterialCommunityIcons
                    name="loading"
                    size={8}
                    color={colors.text}
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
  container: {},
  title: {
    fontSize: 32,
    fontFamily: "Bebas",
    marginBottom: spacing.lg,
    color: colors.text,
    letterSpacing: 1,
    textShadowColor: "rgba(0,0,0,0.3)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    justifyContent: "flex-start",
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.overlay,
    borderRadius: radius.lg + 1,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    paddingRight: spacing.md,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  avatarWrap: { position: "relative" },
  indicator: {
    position: "absolute",
    bottom: -1,
    right: -1,
    width: 14,
    height: 14,
    borderRadius: radius.xs + 3,
    borderWidth: 1.5,
    borderColor: colors.text,
    alignItems: "center",
    justifyContent: "center",
  },
  finished: { backgroundColor: "#4CAF50" },
  inProgress: { backgroundColor: "#FF9800" },
  name: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.text,
    letterSpacing: 0.2,
  },
  metrics: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    backgroundColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs + 2,
  },
  count: { fontSize: fontSize.sm, fontWeight: fontWeight.semibold, color: colors.text },
});
