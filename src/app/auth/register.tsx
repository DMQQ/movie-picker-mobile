import * as AppleAuthentication from "expo-apple-authentication";
import Icon from "../../components/Icon";
import Text from "../../components/Text";
import TextInput from "../../components/TextInput";
import { colors, fontWeight, fontSize, radius, spacing, typography} from "../../constants/design";
import { Link, router } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { useState } from "react";
import AsyncStorage from "expo-sqlite/kv-store";
import { Image, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, View } from "react-native";

import PrimaryButton from "../../components/PrimaryButton";
import { useRegisterMutation } from "../../redux/auth/authApi";
import { useAuthProviders } from "../../hooks/useAuthProviders";
import AuthProviderButtons from "../../components/AuthProviderButtons";
import FadeSlide from "../../components/FadeSlide";
import useTranslation from "../../service/useTranslation";

const AUTH_TOKEN_KEY = "user_auth_token";

interface Errors { name?: string; email?: string; password?: string; form?: string }

export default function RegisterScreen() {
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [register, { isLoading }] = useRegisterMutation();

  const t = useTranslation();
  const { handleAppleSignIn, handleGoogleSignIn, isGoogleLoading, isAppleLoading } =
    useAuthProviders((msg) => setErrors({ form: msg }));

  const anyLoading = isLoading || isGoogleLoading || isAppleLoading;

  function validate() {
    const next: Errors = {};
    if (!name.trim()) next.name = t("auth.nameRequired");
    else if (name.trim().length < 2) next.name = t("auth.nameMinLength");
    if (!email.trim()) next.email = t("auth.emailRequired");
    else if (!/\S+@\S+\.\S+/.test(email)) next.email = t("auth.emailInvalid");
    if (!password.trim()) next.password = t("auth.passwordRequired");
    else if (password.length < 8) next.password = t("auth.passwordMinLength");
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleRegister() {
    if (!validate()) return;
    setErrors({});
    try {
      const anonymousId = await AsyncStorage.getItem("userId");
      const result = await register({ name: name.trim(), email: email.trim(), password, ...(anonymousId ? { anonymousId } : {}) }).unwrap();
      await SecureStore.setItemAsync(AUTH_TOKEN_KEY, result.token);
      router.replace({
        pathname: "/auth/recovery-codes",
        params: { codes: JSON.stringify(result.recoveryCodes) },
      });
    } catch (err: any) {
      setErrors({ form: err?.data?.message ?? t("auth.registrationFailed") });
    }
  }

  return (
    <View style={styles.root}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          {Platform.OS === "android" && <View style={styles.grabber} />}

          <FadeSlide delay={0}>
            <View style={styles.header}>
              <Image source={require("../../../assets/images/icon-light.png")} style={styles.logo} />
              <Text style={styles.title}>{t("auth.createAccount")}</Text>
            </View>
          </FadeSlide>

          <FadeSlide key={showEmailForm ? "email" : "providers"} delay={160}>
            {showEmailForm ? (
              <>
                <Text style={styles.subtitle}>{t("auth.signUpWithEmail")}</Text>

                <Pressable onPress={() => { setShowEmailForm(false); setErrors({}); }} style={styles.backBtn} hitSlop={10}>
                  <Icon source="arrow-left" size={18} color="rgba(255,255,255,0.6)" />
                  <Text style={styles.backText}>{t("auth.back")}</Text>
                </Pressable>

                {errors.form && (
                  <View style={styles.formError}>
                    <Text style={styles.formErrorText}>{errors.form}</Text>
                  </View>
                )}

                <View style={styles.fields}>
                  <TextInput label={t("auth.nameLabel")} value={name}
                    onChangeText={(v) => { setName(v); setErrors((e) => ({ ...e, name: undefined, form: undefined })); }}
                    autoCapitalize="words" returnKeyType="next"
                    outlineStyle={styles.inputOutline} error={!!errors.name}
                  />
                  {errors.name && <Text style={styles.fieldError}>{errors.name}</Text>}

                  <TextInput label={t("auth.emailLabel")} value={email}
                    onChangeText={(v) => { setEmail(v); setErrors((e) => ({ ...e, email: undefined, form: undefined })); }}
                    autoCapitalize="none" keyboardType="email-address" autoCorrect={false}
                    returnKeyType="next" outlineStyle={styles.inputOutline} error={!!errors.email}
                  />
                  {errors.email && <Text style={styles.fieldError}>{errors.email}</Text>}

                  <TextInput label={t("auth.passwordLabel")} value={password}
                    onChangeText={(v) => { setPassword(v); setErrors((e) => ({ ...e, password: undefined, form: undefined })); }}
                    secureTextEntry={!showPassword} returnKeyType="done" onSubmitEditing={handleRegister}
                    outlineStyle={styles.inputOutline} error={!!errors.password}
                    right={<TextInput.Icon icon={showPassword ? "eye-off" : "eye"} onPress={() => setShowPassword((v) => !v)} />}
                  />
                  {errors.password && <Text style={styles.fieldError}>{errors.password}</Text>}
                </View>

                <PrimaryButton
                  onPress={handleRegister}
                  loading={isLoading}
                  disabled={anyLoading}
                  style={styles.primaryBtn}
                >
                  {t("auth.signUp")}
                </PrimaryButton>
              </>
            ) : (
              <>
                <Text style={styles.subtitle}>{t("auth.signUpSubtitle")}</Text>

                {errors.form && (
                  <View style={styles.formError}>
                    <Text style={styles.formErrorText}>{errors.form}</Text>
                  </View>
                )}

                <AuthProviderButtons
                  onEmailPress={() => setShowEmailForm(true)}
                  onApplePress={handleAppleSignIn}
                  onGooglePress={handleGoogleSignIn}
                  isGoogleLoading={isGoogleLoading}
                  disabled={anyLoading}
                  appleButtonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_UP}
                  googleLabel={t("auth.signUpWithGoogle")}
                />
              </>
            )}
          </FadeSlide>

          <FadeSlide delay={320}>
            <View style={styles.footer}>
              <Text style={styles.footerText}>{t("auth.haveAccount")} </Text>
              <Link href="/auth/login" asChild>
                <Text style={styles.footerLink}>{t("auth.signInLink")}</Text>
              </Link>
            </View>
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
  header: { flexDirection: "row", alignItems: "center", gap: spacing.md, marginBottom: spacing.xs },
  logo: { width: 44, height: 44 },
  title: { fontSize: typography.bebasSize.auth, fontFamily: "Bebas", color: colors.text, letterSpacing: 1 },
  subtitle: { fontSize: fontSize.md, color: "#666", marginTop: spacing.xs - 2, marginBottom: spacing.xxl + 4 },
  backBtn: { flexDirection: "row", alignItems: "center", gap: spacing.sm - 2, marginBottom: spacing.lg, alignSelf: "flex-start" },
  backText: { fontSize: fontSize.md, color: "rgba(255,255,255,0.6)" },
  formError: { backgroundColor: "rgba(207,102,121,0.12)", borderRadius: radius.sm + 2, paddingVertical: spacing.sm + 2, paddingHorizontal: spacing.md + 2, marginBottom: spacing.lg },
  formErrorText: { color: colors.error, fontSize: fontSize.md - 1 },
  fields: { gap: spacing.xs, marginBottom: spacing.lg },
  inputOutline: { borderRadius: radius.md },
  fieldError: { color: colors.error, fontSize: fontSize.sm, paddingHorizontal: spacing.xs, marginBottom: spacing.sm },
  primaryBtn: { borderRadius: radius.lg + 1, marginBottom: spacing.xxl + 4 },
  primaryBtnContent: { paddingVertical: spacing.xs + 2 },
  footer: { flexDirection: "row", justifyContent: "center", marginTop: spacing.sm },
  footerText: { color: "#666", fontSize: fontSize.md },
  footerLink: { color: colors.primary, fontSize: fontSize.md, fontWeight: fontWeight.semibold },
});
