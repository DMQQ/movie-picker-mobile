import * as AppleAuthentication from "expo-apple-authentication";
import { Link, router } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { Button, Text, TextInput } from "react-native-paper";
import {
  GoogleOneTapSignIn,
  isCancelledResponse,
  isNoSavedCredentialFoundResponse,
  isSuccessResponse,
} from "react-native-nitro-google-signin";
import { useRegisterMutation, useGoogleAuthMutation, useAppleAuthMutation } from "../../redux/auth/authApi";

const AUTH_TOKEN_KEY = "user_auth_token";

interface Errors {
  name?: string;
  email?: string;
  password?: string;
  form?: string;
}

export default function RegisterScreen() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [register, { isLoading }] = useRegisterMutation();
  const [googleAuth, { isLoading: isGoogleLoading }] = useGoogleAuthMutation();
  const [appleAuth, { isLoading: isAppleLoading }] = useAppleAuthMutation();

  function validate(): boolean {
    const next: Errors = {};
    if (!name.trim()) next.name = "Name is required";
    else if (name.trim().length < 2) next.name = "Name must be at least 2 characters";
    if (!email.trim()) next.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(email)) next.email = "Enter a valid email";
    if (!password.trim()) next.password = "Password is required";
    else if (password.length < 8) next.password = "Password must be at least 8 characters";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleRegister() {
    if (!validate()) return;
    setErrors({});
    try {
      const result = await register({ name: name.trim(), email: email.trim(), password }).unwrap();
      await SecureStore.setItemAsync(AUTH_TOKEN_KEY, result.token);
      router.dismiss();
    } catch (err: any) {
      const message = err?.data?.message ?? "Registration failed. Please try again.";
      setErrors({ form: message });
    }
  }

  async function handleAppleSignIn() {
    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });
      console.log("[Apple] credential:", JSON.stringify(credential));
      const { identityToken, fullName } = credential;
      if (!identityToken) throw new Error("No identity token");
      const result = await appleAuth({
        identityToken,
        fullName: fullName ? { givenName: fullName.givenName, familyName: fullName.familyName } : null,
      }).unwrap();
      console.log("[Apple] auth result:", JSON.stringify(result));
      await SecureStore.setItemAsync(AUTH_TOKEN_KEY, result.token);
      router.dismiss();
    } catch (err: any) {
      if (err.code === "ERR_REQUEST_CANCELED") return;
      console.log("[Apple] error:", JSON.stringify(err));
      const message = err?.data?.message ?? "Apple Sign In failed. Please try again.";
      setErrors({ form: message });
    }
  }

  async function handleGoogleSignIn() {
    try {
      await GoogleOneTapSignIn.checkPlayServices();
      console.log("[Google] checkPlayServices OK");
      let response = await GoogleOneTapSignIn.signIn();
      console.log("[Google] signIn response:", JSON.stringify(response));
      if (isNoSavedCredentialFoundResponse(response)) {
        response = await GoogleOneTapSignIn.createAccount();
        console.log("[Google] createAccount response:", JSON.stringify(response));
      }
      if (isNoSavedCredentialFoundResponse(response)) {
        response = await GoogleOneTapSignIn.presentExplicitSignIn();
        console.log("[Google] presentExplicitSignIn response:", JSON.stringify(response));
      }
      if (!isSuccessResponse(response)) {
        const responseType = (response as any)?.type;
        console.log("[Google] not a success response, type:", responseType);
        setErrors({ form: `Google Sign In failed (${responseType ?? "unknown"}). Please try again.` });
        return;
      }
      const { idToken } = response.data;
      console.log("[Google] idToken present:", !!idToken);
      if (!idToken) throw new Error("No ID token");
      const result = await googleAuth({ idToken }).unwrap();
      console.log("[Google] auth result:", JSON.stringify(result));
      await SecureStore.setItemAsync(AUTH_TOKEN_KEY, result.token);
      router.dismiss();
    } catch (err: any) {
      if (isCancelledResponse(err)) return;
      console.log("[Google] error:", JSON.stringify(err));
      const message = err?.data?.message ?? "Google Sign In failed. Please try again.";
      setErrors({ form: message });
    }
  }

  return (
    <View style={{ flex: 1 }}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          {Platform.OS === "android" && <View style={styles.grabber} />}

          <Text style={styles.title}>Create account</Text>
          <Text style={styles.subtitle}>Start discovering movies together</Text>

          {errors.form && (
            <View style={styles.formError}>
              <Text style={styles.formErrorText}>{errors.form}</Text>
            </View>
          )}

          <View style={styles.fields}>
            <TextInput
              mode="outlined"
              label="Name"
              value={name}
              onChangeText={(v) => { setName(v); setErrors((e) => ({ ...e, name: undefined, form: undefined })); }}
              autoCapitalize="words"
              returnKeyType="next"
              outlineStyle={styles.inputOutline}
              error={!!errors.name}
            />
            {errors.name && <Text style={styles.fieldError}>{errors.name}</Text>}

            <TextInput
              mode="outlined"
              label="Email"
              value={email}
              onChangeText={(v) => { setEmail(v); setErrors((e) => ({ ...e, email: undefined, form: undefined })); }}
              autoCapitalize="none"
              keyboardType="email-address"
              autoCorrect={false}
              returnKeyType="next"
              outlineStyle={styles.inputOutline}
              error={!!errors.email}
            />
            {errors.email && <Text style={styles.fieldError}>{errors.email}</Text>}

            <TextInput
              mode="outlined"
              label="Password"
              value={password}
              onChangeText={(v) => { setPassword(v); setErrors((e) => ({ ...e, password: undefined, form: undefined })); }}
              secureTextEntry
              returnKeyType="done"
              onSubmitEditing={handleRegister}
              outlineStyle={styles.inputOutline}
              error={!!errors.password}
            />
            {errors.password && <Text style={styles.fieldError}>{errors.password}</Text>}
          </View>

          <Button
            mode="contained"
            onPress={handleRegister}
            loading={isLoading}
            disabled={isLoading || isGoogleLoading || isAppleLoading}
            style={styles.primaryBtn}
            contentStyle={styles.primaryBtnContent}
          >
            Create account
          </Button>

          <View style={styles.dividerRow}>
            <View style={styles.line} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.line} />
          </View>

          {Platform.OS === "ios" && (
            <AppleAuthentication.AppleAuthenticationButton
              buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_UP}
              buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.WHITE}
              cornerRadius={25}
              style={styles.appleBtn}
              onPress={handleAppleSignIn}
            />
          )}

          <Button
            mode="outlined"
            onPress={handleGoogleSignIn}
            icon="google"
            loading={isGoogleLoading}
            disabled={isLoading || isGoogleLoading || isAppleLoading}
            style={styles.socialBtn}
            contentStyle={styles.socialBtnContent}
          >
            Continue with Google
          </Button>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <Link href="/auth/login" asChild>
              <Text style={styles.footerLink}>Sign in</Text>
            </Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  scroll: { padding: 24, paddingTop: 16 },
  grabber: { width: 36, height: 4, borderRadius: 2, backgroundColor: "#555", alignSelf: "center", marginBottom: 28 },
  title: { fontSize: 38, fontFamily: "Bebas", color: "#fff", letterSpacing: 1 },
  subtitle: { fontSize: 14, color: "#666", marginTop: 2, marginBottom: 20 },
  formError: {
    backgroundColor: "rgba(207,102,121,0.12)",
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginBottom: 16,
  },
  formErrorText: { color: "#CF6679", fontSize: 13 },
  fields: { gap: 4, marginBottom: 16 },
  inputOutline: { borderRadius: 12 },
  fieldError: { color: "#CF6679", fontSize: 12, paddingHorizontal: 4, marginBottom: 8 },
  primaryBtn: { borderRadius: 25, marginBottom: 28 },
  primaryBtnContent: { paddingVertical: 6 },
  dividerRow: { flexDirection: "row", alignItems: "center", marginBottom: 16 },
  line: { flex: 1, height: 1, backgroundColor: "#222" },
  dividerText: { color: "#444", marginHorizontal: 12, fontSize: 12 },
  appleBtn: { height: 48, borderRadius: 25, marginBottom: 10 },
  socialBtn: { borderRadius: 25, marginBottom: 36 },
  socialBtnContent: { paddingVertical: 4 },
  footer: { flexDirection: "row", justifyContent: "center" },
  footerText: { color: "#666", fontSize: 14 },
  footerLink: { color: "#BB86FC", fontSize: 14, fontWeight: "600" },
});
