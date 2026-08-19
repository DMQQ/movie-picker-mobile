import { StyleSheet, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useTheme } from "../../hooks/useTheme";
import Text from "../Text";
import useTranslation from "../../service/useTranslation";
import { colors, fontSize, radius, spacing } from "../../constants/design";

export default function TutorialTips() {
  const theme = useTheme();
  const t = useTranslation();

  const tips = [
    { icon: "camera" as const, text: t("room.tutorial.native-camera") },
    { icon: "qrcode-scan" as const, text: t("room.tutorial.in-app-scanner") },
    { icon: "account-multiple-plus" as const, text: t("room.tutorial.join-during-game") },
  ];

  return (
    <View style={styles.tutorialContainer}>
      {tips.map((tip, index) => (
        <View key={index} style={styles.tipRow}>
          <View style={[styles.tipIconContainer, { backgroundColor: theme.colors.primary + "20" }]}>
            <MaterialCommunityIcons name={tip.icon} size={20} color={theme.colors.primary} />
          </View>
          <Text style={styles.tipText}>{tip.text}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  tutorialContainer: {
    marginTop: spacing.screen,
    paddingHorizontal: spacing.sm + 2,
    gap: spacing.sm + 2,
  },
  tipRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    width: "80%",
  },
  tipIconContainer: {
    width: 36,
    height: 36,
    borderRadius: radius.card + 2,
    justifyContent: "center",
    alignItems: "center",
  },
  tipText: {
    flex: 1,
    fontSize: fontSize.md,
    color: colors.text,
    opacity: 0.85,
  },
});
