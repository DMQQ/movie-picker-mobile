import { View, StyleSheet } from "react-native";
import Icon from "./Icon";
import Text from "./Text";

import PrimaryButton from "./PrimaryButton";
import { router } from "expo-router";
import useTranslation from "../service/useTranslation";
import { colors, fontSize, fontWeight, radius, spacing, typography } from "../constants/design";

const bodyText = "rgba(255,255,255,0.65)";
const mutedText = "rgba(255,255,255,0.45)";

const BENEFITS = [
  "benefit-cloud",
  "benefit-history",
  "benefit-friends",
  "benefit-recommendations",
] as const;

export default function UnauthAccount({ expired }: { expired: boolean }) {
  const t = useTranslation();

  return (
    <View style={styles.wrap}>
      {expired && (
        <View style={styles.expiredBanner}>
          <Icon source="alert-circle-outline" size={16} color={colors.error} />
          <Text style={styles.expiredText}>
            {t("settings.unauth.session-expired")}
          </Text>
        </View>
      )}

      <View style={styles.card}>
        <Text style={styles.title}>{t("settings.unauth.title")}</Text>
        <Text style={styles.subtitle}>{t("settings.unauth.subtitle")}</Text>

        <View style={styles.list}>
          {BENEFITS.map((key) => (
            <View key={key} style={styles.listItem}>
              <View style={styles.dot} />
              <Text style={styles.listText}>
                {t(`settings.unauth.${key}` as any)}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.buttons}>
          <PrimaryButton
            onPress={() => router.push("/auth/login")}
            style={styles.btn}
          >
            {t("settings.unauth.sign-in")}
          </PrimaryButton>
          <PrimaryButton
            onPress={() => router.push("/auth/register")}
            style={[styles.btn, styles.btnSecondary]}
            textColor={colors.text}
          >
            {t("settings.unauth.create-account")}
          </PrimaryButton>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.md },

  expiredBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radius.sm,
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.md + 2,
  },
  expiredText: { flex: 1, color: colors.error, fontSize: fontSize.sm + 1 },

  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.xl,
  },

  title: {
    fontFamily: typography.bebas,
    fontSize: typography.bebasSize.auth - 10,
    color: colors.text,
    letterSpacing: typography.bebasLetterSpacing,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: fontSize.sm + 1,
    color: mutedText,
    lineHeight: 19,
    marginBottom: spacing.xl,
  },

  list: { gap: spacing.sm + 2, marginBottom: spacing.xxl },
  listItem: { flexDirection: "row", alignItems: "center", gap: spacing.sm + 2 },
  dot: {
    width: spacing.xs,
    height: spacing.xs,
    borderRadius: spacing.xs / 2,
    backgroundColor: mutedText,
  },
  listText: { fontSize: fontSize.sm + 1, color: bodyText },

  buttons: { gap: spacing.sm },
  btn: { borderRadius: radius.sm },
  btnSecondary: { backgroundColor: colors.overlay },
});
