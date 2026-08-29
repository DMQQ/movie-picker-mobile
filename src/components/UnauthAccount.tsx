import * as AppleAuthentication from "expo-apple-authentication";
import { View, StyleSheet, Platform, Pressable } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import Text from "./Text";
import Icon from "./Icon";
import GoogleSignInButton from "./GoogleSignInButton";
import { router } from "expo-router";
import { useState } from "react";
import { useAuthProviders } from "../hooks/useAuthProviders";
import useTranslation from "../service/useTranslation";
import { colors, fontSize, fontWeight, radius, spacing, typography } from "../constants/design";

const bodyText = "rgba(255,255,255,0.65)";
const mutedText = "rgba(255,255,255,0.45)";

const BENEFITS = [
  { key: "benefit-cloud", icon: "cloud-sync-outline" as const, locked: false },
  { key: "benefit-history", icon: "history" as const, locked: false },
  { key: "benefit-friends", icon: "account-group-outline" as const, locked: false },
  { key: "benefit-recommendations", icon: "lightbulb-outline" as const, locked: false },
  { key: "benefit-ratings", icon: "star-outline" as const, locked: false },
  { key: "benefit-scoring", icon: "tune-variant" as const, locked: true },
] as const;

export default function UnauthAccount({ expired }: { expired: boolean }) {
  const t = useTranslation();
  const [authError, setAuthError] = useState<string | null>(null);
  const { handleAppleSignIn, handleGoogleSignIn, isGoogleLoading, isAppleLoading } =
    useAuthProviders((msg) => setAuthError(msg), "login", () => {});

  const anyLoading = isGoogleLoading || isAppleLoading;

  return (
    <View style={styles.wrap}>
      {expired && (
        <View style={styles.expiredBanner}>
          <MaterialCommunityIcons name="alert-circle-outline" size={16} color={colors.error} />
          <Text style={styles.expiredText}>
            {t("settings.unauth.session-expired")}
          </Text>
        </View>
      )}

      <View style={styles.card}>
        <Text style={styles.title}>{t("settings.unauth.title")}</Text>
        <Text style={styles.subtitle}>{t("settings.unauth.subtitle")}</Text>

        <View style={styles.list}>
          {BENEFITS.map(({ key, icon, locked }) => (
            <View key={key} style={styles.listItem}>
              <MaterialCommunityIcons name={icon} size={18} color={colors.primary} />
              <Text style={styles.listText}>{t(`settings.unauth.${key}` as any)}</Text>
              {locked && (
                <MaterialCommunityIcons name="lock-outline" size={13} color={colors.placeholder} />
              )}
            </View>
          ))}
        </View>

        {authError && (
          <View style={styles.errorBanner}>
            <Text style={styles.errorText}>{authError}</Text>
          </View>
        )}

        <GoogleSignInButton
          onPress={() => { setAuthError(null); handleGoogleSignIn(); }}
          loading={isGoogleLoading}
          disabled={anyLoading}
          label={t("auth.signInWithGoogle") as string}
        />

        {Platform.OS === "ios" && (
          <AppleAuthentication.AppleAuthenticationButton
            buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
            buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.WHITE}
            cornerRadius={radius.lg + 1}
            style={styles.appleBtn}
            onPress={() => { setAuthError(null); handleAppleSignIn(); }}
          />
        )}

        <Pressable
          onPress={() => router.push("/auth/login")}
          disabled={anyLoading}
          style={({ pressed }) => [styles.emailBtn, pressed && styles.emailBtnPressed]}
        >
          <Icon source="email-outline" size={20} color="rgba(255,255,255,0.85)" />
          <Text style={styles.emailBtnText}>{t("auth.continueWithEmail")}</Text>
        </Pressable>

        <Text style={styles.trust}>{t("settings.unauth.trust")}</Text>
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
    borderTopWidth: 3,
    borderTopColor: colors.primary,
    padding: spacing.xl,
    gap: spacing.md,
  },

  title: {
    fontFamily: typography.bebas,
    fontSize: typography.bebasSize.auth - 10,
    color: colors.text,
    letterSpacing: typography.bebasLetterSpacing,
  },
  subtitle: {
    fontSize: fontSize.sm + 1,
    color: mutedText,
    lineHeight: 19,
  },

  list: { gap: spacing.md, marginBottom: spacing.sm },
  listItem: { flexDirection: "row", alignItems: "center", gap: spacing.sm + 2 },
  listText: { flex: 1, fontSize: fontSize.sm + 1, color: bodyText, lineHeight: 20 },

  errorBanner: {
    backgroundColor: "rgba(207,102,121,0.12)",
    borderRadius: radius.sm + 2,
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.md + 2,
  },
  errorText: { color: colors.error, fontSize: fontSize.md - 1 },

  appleBtn: { height: 50 },

  emailBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm + 2,
    height: 50,
    borderRadius: radius.lg + 1,
    backgroundColor: colors.overlay,
    borderWidth: 1,
    borderColor: colors.border,
  },
  emailBtnPressed: { backgroundColor: "rgba(255,255,255,0.13)" },
  emailBtnText: {
    fontSize: fontSize.md + 1,
    fontWeight: fontWeight.medium,
    color: "rgba(255,255,255,0.85)",
    letterSpacing: 0.2,
  },

  trust: {
    fontSize: fontSize.xs + 1,
    color: mutedText,
    textAlign: "center",
  },
});
