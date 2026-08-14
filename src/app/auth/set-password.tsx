import { router } from "expo-router";
import Icon from "../../components/Icon";
import Text from "../../components/Text";
import TextInput from "../../components/TextInput";
import { useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, View } from "react-native";
import PrimaryButton from "../../components/PrimaryButton";
import { useChangePasswordMutation } from "../../redux/auth/authApi";
import { addToast } from "../../redux/toast/toastSlice";
import { useAppDispatch } from "../../redux/store";
import FadeSlide from "../../components/FadeSlide";
import useTranslation from "../../service/useTranslation";
import { colors, fontSize, radius, spacing, typography } from "../../constants/design";

export default function SetPasswordScreen() {
  const t = useTranslation();
  const dispatch = useAppDispatch();
  const [changePassword, { isLoading }] = useChangePasswordMutation();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function handleSave() {
    setError(null);
    if (password.length < 8) {
      setError(t("auth.passwordMinLength"));
      return;
    }
    if (password !== confirm) {
      setError(t("auth.passwordMismatch"));
      return;
    }
    try {
      await changePassword({ newPassword: password }).unwrap();
      dispatch(addToast({ id: Date.now().toString(), message: t("account.passwordChanged"), type: "success", duration: 3000 }));
      router.dismissAll();
    } catch (err: any) {
      setError(err?.data?.message ?? t("common.error"));
    }
  }

  return (
    <View style={styles.root}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          {Platform.OS === "android" && <View style={styles.grabber} />}

          <FadeSlide delay={0}>
            <View style={styles.iconWrap}>
              <Icon source="lock-reset" size={40} color={colors.primary} />
            </View>
            <Text style={styles.title}>{t("auth.setPasswordTitle")}</Text>
            <Text style={styles.subtitle}>{t("auth.setPasswordSubtitle")}</Text>
          </FadeSlide>

          <FadeSlide delay={100}>
            <View style={styles.fields}>
              <TextInput
                label={t("account.newPassword")}
                value={password}
                onChangeText={(v) => { setPassword(v); setError(null); }}
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="next"
                outlineStyle={styles.inputOutline}
                error={!!error}
              />
              <TextInput
                label={t("auth.confirmPassword")}
                value={confirm}
                onChangeText={(v) => { setConfirm(v); setError(null); }}
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="done"
                onSubmitEditing={handleSave}
                outlineStyle={styles.inputOutline}
                error={!!error}
              />
              {error && <Text style={styles.error}>{error}</Text>}
            </View>
          </FadeSlide>

          <FadeSlide delay={180}>
            <PrimaryButton
              onPress={handleSave}
              loading={isLoading}
              disabled={isLoading || !password || !confirm}
              style={styles.saveBtn}
            >
              {t("auth.setPasswordSave")}
            </PrimaryButton>

            <Pressable onPress={() => router.dismissAll()} hitSlop={12} style={styles.skipBtn}>
              <Text style={styles.skipText}>{t("auth.setPasswordSkip")}</Text>
            </Pressable>
          </FadeSlide>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  flex: { flex: 1, ...Platform.select({ ios: { paddingTop: spacing.xl } }) },
  scroll: { padding: spacing.xxl, paddingTop: spacing.lg },
  grabber: { width: 36, height: 4, borderRadius: radius.xs - 2, backgroundColor: "#555", alignSelf: "center", marginBottom: spacing.xxl + 4 },
  iconWrap: { alignItems: "center", marginBottom: spacing.md },
  title: { fontSize: typography.bebasSize.auth, fontFamily: "Bebas", color: colors.text, letterSpacing: 1 },
  subtitle: { fontSize: fontSize.md, color: "#666", marginTop: spacing.xs - 2, lineHeight: 20 },
  fields: { gap: spacing.xs, marginBottom: spacing.lg },
  inputOutline: { borderRadius: radius.md },
  error: { color: colors.error, fontSize: fontSize.sm, paddingHorizontal: spacing.xs, marginTop: -(spacing.sm) },
  saveBtn: { borderRadius: radius.lg + 1 },
  skipBtn: { alignItems: "center", paddingVertical: spacing.md },
  skipText: { fontSize: fontSize.md, color: colors.placeholder },
});
