import * as AppleAuthentication from "expo-apple-authentication";
import { useNavigation } from "expo-router";
import {
  GoogleOneTapSignIn,
  isCancelledResponse,
  isNoSavedCredentialFoundResponse,
  isSuccessResponse,
} from "react-native-nitro-google-signin";
import { Platform } from "react-native";
import { posthog } from "../constants/posthog";
import { useGoogleAuthMutation, useAppleAuthMutation } from "../redux/auth/authApi";
import useTranslation from "../service/useTranslation";

export function useAuthProviders(onError: (msg: string) => void, screen: "register" | "login" = "login", onSuccess?: () => void) {
  const t = useTranslation();
  const navigation = useNavigation();
  const [googleAuth, { isLoading: isGoogleLoading }] = useGoogleAuthMutation();
  const [appleAuth, { isLoading: isAppleLoading }] = useAppleAuthMutation();

  function dismissAuthSheet() {
    if (onSuccess) { onSuccess(); return; }
    // auth Stack is nested inside root Stack; goBack on root pops the formSheet
    navigation.getParent()?.goBack();
  }

  async function handleAppleSignIn() {
    posthog?.capture("auth_provider_tapped", { provider: "apple", screen });
    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });
      const { identityToken, fullName } = credential;
      if (!identityToken) throw new Error("No identity token");
      await appleAuth({
        identityToken,
        fullName: fullName
          ? { givenName: fullName.givenName, familyName: fullName.familyName }
          : null,
      }).unwrap();
      posthog?.capture(screen === "register" ? "sign_up_completed" : "sign_in", { provider: "apple" });
      dismissAuthSheet();
    } catch (err: any) {
      if (err.code === "ERR_REQUEST_CANCELED") {
        posthog?.capture("auth_abandoned", { provider: "apple", screen });
        return;
      }
      posthog?.captureException(err, { provider: "apple" });
      onError(err?.data?.message ?? t("auth.appleSignInFailed"));
    }
  }

  async function handleGoogleSignIn() {
    posthog?.capture("auth_provider_tapped", { provider: "google", screen });
    try {
      if (Platform.OS === "android") await GoogleOneTapSignIn.checkPlayServices();
      let response = await GoogleOneTapSignIn.signIn();

      // User dismissed One Tap bottom sheet — not an error
      if (isCancelledResponse(response)) {
        posthog?.capture("auth_abandoned", { provider: "google", screen });
        return;
      }

      let sawPicker = false;

      if (isNoSavedCredentialFoundResponse(response)) {
        response = await GoogleOneTapSignIn.createAccount();
        sawPicker = !isNoSavedCredentialFoundResponse(response);
      }

      // User saw the account picker and dismissed it — legit cancel
      if (isCancelledResponse(response) && sawPicker) {
        posthog?.capture("auth_abandoned", { provider: "google", screen });
        return;
      }

      // No accounts found by createAccount, or it cancelled without showing UI → try explicit
      if (isNoSavedCredentialFoundResponse(response) || isCancelledResponse(response)) {
        response = await GoogleOneTapSignIn.presentExplicitSignIn();
        if (isCancelledResponse(response)) {
          posthog?.capture("auth_abandoned", { provider: "google", screen });
          if (!sawPicker) onError(t("auth.googleNoAccounts"));
          return;
        }
      }

      if (!isSuccessResponse(response)) {
        onError(t("auth.googleSignInFailed"));
        return;
      }

      const { idToken } = response.data;
      if (!idToken) throw new Error("No ID token");

      await googleAuth({ idToken }).unwrap();
      posthog?.capture(screen === "register" ? "sign_up_completed" : "sign_in", { provider: "google" });
      dismissAuthSheet();
    } catch (err: any) {
      await GoogleOneTapSignIn.signOut().catch(() => {});
      posthog?.captureException(err, {
        provider: "google",
        message: err?.message,
        data: err?.data,
        status: err?.status,
      });
      onError(err?.data?.message ?? t("auth.googleSignInFailed"));
    }
  }

  return { handleAppleSignIn, handleGoogleSignIn, isGoogleLoading, isAppleLoading };
}
