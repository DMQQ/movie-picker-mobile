import { router } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { Button, Icon, Text, TextInput } from "react-native-paper";
import PrimaryButton from "../../components/PrimaryButton";
import { useRecoverMutation } from "../../redux/auth/authApi";
import FadeSlide from "../../components/FadeSlide";
import useTranslation from "../../service/useTranslation";

const AUTH_TOKEN_KEY = "user_auth_token";

interface Errors { email?: string; code?: string; form?: string }

function formatCode(raw: string): string {
  const clean = raw.toUpperCase().replace(/[^A-Z0-9]/g, "");
  if (clean.length > 5) return `${clean.slice(0, 5)}-${clean.slice(5, 10)}`;
  return clean;
}

export default function RecoverScreen() {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const t = useTranslation();
  const [recover, { isLoading }] = useRecoverMutation();

  function validate() {
    const next: Errors = {};
    if (!email.trim()) next.email = t("auth.emailRequired");
    else if (!/\S+@\S+\.\S+/.test(email)) next.email = t("auth.emailInvalid");
    const rawCode = code.replace(/-/g, "");
    if (!rawCode) next.code = t("auth.codeRequired");
    else if (rawCode.length !== 10) next.code = t("auth.codeLength");
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleRecover() {
    if (!validate()) return;
    setErrors({});
    try {
      const result = await recover({ email: email.trim(), code: code.replace(/-/g, "") }).unwrap();
      await SecureStore.setItemAsync(AUTH_TOKEN_KEY, result.token);
      router.dismissAll();
    } catch (err: any) {
      setErrors({ form: err?.data?.message ?? t("auth.recoveryFailed") });
    }
  }

  return (
    <View style={styles.root}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          {Platform.OS === "android" && <View style={styles.grabber} />}

          <FadeSlide delay={0}>
            <Pressable onPress={() => router.back()} style={styles.backBtn} hitSlop={10}>
              <Icon source="arrow-left" size={18} color="rgba(255,255,255,0.6)" />
              <Text style={styles.backText}>{t("auth.back")}</Text>
            </Pressable>

            <Text style={styles.title}>{t("auth.accountRecovery")}</Text>
            <Text style={styles.subtitle}>{t("auth.recoverySubtitle")}</Text>
          </FadeSlide>

          <FadeSlide delay={120}>
            {errors.form && (
              <View style={styles.formError}>
                <Text style={styles.formErrorText}>{errors.form}</Text>
              </View>
            )}

            <View style={styles.fields}>
              <TextInput
                mode="outlined" label={t("auth.emailLabel")} value={email}
                onChangeText={(v) => { setEmail(v); setErrors((e) => ({ ...e, email: undefined, form: undefined })); }}
                autoCapitalize="none" keyboardType="email-address" autoCorrect={false}
                returnKeyType="next" outlineStyle={styles.inputOutline} error={!!errors.email}
              />
              {errors.email && <Text style={styles.fieldError}>{errors.email}</Text>}

              <TextInput
                mode="outlined" label={t("auth.recoveryCodeLabel")} value={code}
                onChangeText={(v) => {
                  setCode(formatCode(v));
                  setErrors((e) => ({ ...e, code: undefined, form: undefined }));
                }}
                autoCapitalize="characters"
                autoCorrect={false}
                returnKeyType="done"
                onSubmitEditing={handleRecover}
                outlineStyle={styles.inputOutline}
                style={styles.codeInput}
                error={!!errors.code}
                placeholder="ABKQW-37NVP"
              />
              {errors.code && <Text style={styles.fieldError}>{errors.code}</Text>}
            </View>
          </FadeSlide>

          <FadeSlide delay={240}>
            <PrimaryButton
              onPress={handleRecover}
              loading={isLoading}
              disabled={isLoading}
              style={styles.primaryBtn}
            >
              {t("auth.recoverAccount")}
            </PrimaryButton>

            <View style={styles.hint}>
              <Icon source="information-outline" size={14} color="rgba(255,255,255,0.3)" />
              <Text style={styles.hintText}>
                {t("auth.recoveryHint")}
              </Text>
            </View>
          </FadeSlide>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  flex: { flex: 1, ...Platform.select({ ios: { paddingTop: 20 } }) },
  scroll: { padding: 24, paddingTop: 16 },
  grabber: { width: 36, height: 4, borderRadius: 2, backgroundColor: "#555", alignSelf: "center", marginBottom: 28 },
  title: { fontSize: 38, fontFamily: "Bebas", color: "#fff", letterSpacing: 1 },
  subtitle: { fontSize: fontSize.md, color: "#666", marginTop: 2, marginBottom: 28, lineHeight: 20 },
  backBtn: { flexDirection: "row", alignItems: "center", gap: spacing.sm - 2, marginBottom: 20, alignSelf: "flex-start" },
  backText: { fontSize: fontSize.md, color: "rgba(255,255,255,0.6)" },
  formError: { backgroundColor: "rgba(207,102,121,0.12)", borderRadius: radius.sm + 2, paddingVertical: spacing.sm + 2, paddingHorizontal: 14, marginBottom: 16 },
  formErrorText: { color: "#CF6679", fontSize: 13 },
  fields: { gap: 4, marginBottom: 16 },
  inputOutline: { borderRadius: radius.md },
  codeInput: { fontFamily: Platform.OS === "ios" ? "Courier New" : "monospace", letterSpacing: 2 },
  fieldError: { color: "#CF6679", fontSize: fontSize.sm, paddingHorizontal: 4, marginBottom: 8 },
  primaryBtn: { borderRadius: 25, marginBottom: 20 },
  primaryBtnContent: { paddingVertical: 6 },
  hint: { flexDirection: "row", alignItems: "center", gap: 8 },
  hintText: { fontSize: fontSize.sm, color: "rgba(255,255,255,0.3)", flex: 1 },
});
