import * as AppleAuthentication from "expo-apple-authentication";
import { Link, router } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { useState } from "react";
import AsyncStorage from "expo-sqlite/kv-store";
import { Image, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { Button, Icon, Text, TextInput } from "react-native-paper";
import PrimaryButton from "../../components/PrimaryButton";
import { useLoginMutation } from "../../redux/auth/authApi";
import { useAuthProviders } from "../../hooks/useAuthProviders";
import AuthProviderButtons from "../../components/AuthProviderButtons";
import FadeSlide from "../../components/FadeSlide";

const AUTH_TOKEN_KEY = "user_auth_token";

interface Errors { email?: string; password?: string; form?: string }

export default function LoginScreen() {
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [login, { isLoading }] = useLoginMutation();

  const { handleAppleSignIn, handleGoogleSignIn, isGoogleLoading, isAppleLoading } =
    useAuthProviders((msg) => setErrors({ form: msg }));

  const anyLoading = isLoading || isGoogleLoading || isAppleLoading;

  function validate() {
    const next: Errors = {};
    if (!email.trim()) next.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(email)) next.email = "Enter a valid email";
    if (!password.trim()) next.password = "Password is required";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleLogin() {
    if (!validate()) return;
    setErrors({});
    try {
      const anonymousId = await AsyncStorage.getItem("userId");
      const result = await login({ email: email.trim(), password, ...(anonymousId ? { anonymousId } : {}) }).unwrap();
      await SecureStore.setItemAsync(AUTH_TOKEN_KEY, result.token);
      router.dismiss();
    } catch (err: any) {
      setErrors({ form: err?.data?.message ?? "Login failed. Please try again." });
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
              <Text style={styles.title}>Welcome back</Text>
            </View>
          </FadeSlide>

          <FadeSlide key={showEmailForm ? "email" : "providers"} delay={160}>
            {showEmailForm ? (
              <>
                <Text style={styles.subtitle}>Sign in with your email</Text>

                <Pressable onPress={() => { setShowEmailForm(false); setErrors({}); }} style={styles.backBtn} hitSlop={10}>
                  <Icon source="arrow-left" size={18} color="rgba(255,255,255,0.6)" />
                  <Text style={styles.backText}>Back</Text>
                </Pressable>

                {errors.form && (
                  <View style={styles.formError}>
                    <Text style={styles.formErrorText}>{errors.form}</Text>
                  </View>
                )}

                <View style={styles.fields}>
                  <TextInput
                    mode="outlined" label="Email" value={email}
                    onChangeText={(v) => { setEmail(v); setErrors((e) => ({ ...e, email: undefined, form: undefined })); }}
                    autoCapitalize="none" keyboardType="email-address" autoCorrect={false}
                    returnKeyType="next" outlineStyle={styles.inputOutline} error={!!errors.email}
                  />
                  {errors.email && <Text style={styles.fieldError}>{errors.email}</Text>}

                  <TextInput
                    mode="outlined" label="Password" value={password}
                    onChangeText={(v) => { setPassword(v); setErrors((e) => ({ ...e, password: undefined, form: undefined })); }}
                    secureTextEntry returnKeyType="done" onSubmitEditing={handleLogin}
                    outlineStyle={styles.inputOutline} error={!!errors.password}
                  />
                  {errors.password && <Text style={styles.fieldError}>{errors.password}</Text>}
                </View>

                <PrimaryButton
                  onPress={handleLogin}
                  loading={isLoading}
                  disabled={anyLoading}
                  style={styles.primaryBtn}
                >
                  Sign in
                </PrimaryButton>
              </>
            ) : (
              <>
                <Text style={styles.subtitle}>Sign in to your account</Text>

                {errors.form && (
                  <View style={styles.formError}>
                    <Text style={styles.formErrorText}>{errors.form}</Text>
                  </View>
                )}

                <AuthProviderButtons
                  onEmailPress={() => setShowEmailForm(true)}
                  onApplePress={() => { setErrors({}); handleAppleSignIn(); }}
                  onGooglePress={() => { setErrors({}); handleGoogleSignIn(); }}
                  isGoogleLoading={isGoogleLoading}
                  disabled={anyLoading}
                  appleButtonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
                />
              </>
            )}
          </FadeSlide>

          <FadeSlide delay={320}>
            <View style={styles.footer}>
              <Text style={styles.footerText}>Don't have an account? </Text>
              <Link href="/auth/register" asChild>
                <Text style={styles.footerLink}>Sign up</Text>
              </Link>
            </View>

            <View style={styles.footer}>
              <Text style={styles.footerText}>Lost access? </Text>
              <Link href="/auth/recover" asChild>
                <Text style={styles.footerLink}>Use a recovery code</Text>
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
  flex: { flex: 1, ...Platform.select({ ios: { paddingTop: 20 } }) },
  scroll: { padding: 24, paddingTop: 16 },
  grabber: { width: 36, height: 4, borderRadius: 2, backgroundColor: "#555", alignSelf: "center", marginBottom: 28 },
  header: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 4 },
  logo: { width: 44, height: 44 },
  title: { fontSize: 38, fontFamily: "Bebas", color: "#fff", letterSpacing: 1 },
  subtitle: { fontSize: 14, color: "#666", marginTop: 2, marginBottom: 28 },
  backBtn: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 16, alignSelf: "flex-start" },
  backText: { fontSize: 14, color: "rgba(255,255,255,0.6)" },
  formError: { backgroundColor: "rgba(207,102,121,0.12)", borderRadius: 10, paddingVertical: 10, paddingHorizontal: 14, marginBottom: 16 },
  formErrorText: { color: "#CF6679", fontSize: 13 },
  fields: { gap: 4, marginBottom: 16 },
  inputOutline: { borderRadius: 12 },
  fieldError: { color: "#CF6679", fontSize: 12, paddingHorizontal: 4, marginBottom: 8 },
  primaryBtn: { borderRadius: 25, marginBottom: 28 },
  primaryBtnContent: { paddingVertical: 6 },
  footer: { flexDirection: "row", justifyContent: "center", marginTop: 8 },
  footerText: { color: "#666", fontSize: 14 },
  footerLink: { color: "#BB86FC", fontSize: 14, fontWeight: "600" },
});
