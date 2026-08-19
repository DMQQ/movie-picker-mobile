import { StyleSheet, View } from "react-native";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import Text from "../Text";
import useTranslation from "../../service/useTranslation";
import { colors, fontSize, radius, spacing, typography, withAlpha } from "../../constants/design";

interface Props {
  reason: "speed" | "champion-keeps";
}

export default function TieOverlay({ reason }: Props) {
  const t = useTranslation();

  return (
    <Animated.View
      entering={FadeIn.duration(200)}
      exiting={FadeOut.duration(150)}
      style={styles.overlay}
      pointerEvents="none"
    >
      <View style={styles.card}>
        <View style={styles.iconWrap}>
          <MaterialCommunityIcons name="scale-balance" size={28} color={colors.primary} />
        </View>
        <Text style={styles.title}>{t("eitherOr.game.tie")}</Text>
        <Text style={styles.description}>
          {reason === "champion-keeps" ? t("eitherOr.game.tieChampionKeeps") : t("eitherOr.game.tieSpeedWin")}
        </Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    alignItems: "center",
    justifyContent: "center",
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.xxl,
    alignItems: "center",
    gap: spacing.sm,
    maxWidth: "80%",
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: radius.pill,
    backgroundColor: withAlpha(colors.primary, 0.15),
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.xs,
  },
  title: {
    fontFamily: "Bebas",
    fontSize: typography.bebasSize.section,
    color: colors.text,
  },
  description: {
    fontSize: fontSize.md,
    color: colors.placeholder,
    textAlign: "center",
  },
});
