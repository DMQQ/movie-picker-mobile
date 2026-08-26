import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Pressable, StyleSheet, View } from "react-native";
import { router } from "expo-router";
import Text from "./Text";
import { colors, fontSize, fontWeight, radius, spacing, typography } from "../constants/design";
import { useAppSelector } from "../redux/store";
import useTranslation from "../service/useTranslation";

export default function SignUpNudgeBanner() {
  const t = useTranslation();
  const user = useAppSelector((s) => s.auth.user);
  const isFullAccount = !!user && user.provider !== "anonymous";
  if (isFullAccount) return null;

  return (
    <Pressable
      onPress={() => router.push("/auth/register")}
      style={({ pressed }) => [styles.container, pressed && styles.containerPressed]}
    >
      <View style={styles.iconWrap}>
        <MaterialCommunityIcons name="cloud-sync-outline" size={28} color="#fff" />
      </View>
      <View style={styles.content}>
        <Text style={styles.title}>{t("sign-up-nudge.title")}</Text>
        <Text style={styles.subtitle}>{t("sign-up-nudge.subtitle")}</Text>
      </View>
      <View style={styles.btnPrimary}>
        <Text style={styles.btnPrimaryText}>{t("sign-up-nudge.register")}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    backgroundColor: "rgba(85,120,232,0.07)",
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: "rgba(85,120,232,0.2)",
    paddingVertical: spacing.md + 2,
    paddingHorizontal: spacing.md + 2,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  iconWrap: {
    width: 46,
    height: 46,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  content: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontFamily: typography.bebas,
    fontSize: 17,
    letterSpacing: typography.bebasLetterSpacing,
    color: colors.text,
    lineHeight: 20,
  },
  subtitle: {
    fontSize: fontSize.xs + 1,
    color: colors.placeholder,
    lineHeight: 15,
  },
  btnPrimary: {
    paddingHorizontal: spacing.md - 2,
    paddingVertical: spacing.xs + 1,
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
  },
  containerPressed: {
    opacity: 0.75,
  },
  btnPressed: {
    opacity: 0.7,
  },
  btnPrimaryText: {
    fontSize: fontSize.xs + 1,
    fontWeight: fontWeight.semibold,
    color: colors.text,
  },
});
