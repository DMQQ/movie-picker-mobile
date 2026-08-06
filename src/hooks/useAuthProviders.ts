import * as AppleAuthentication from "expo-apple-authentication";
import { useNavigation } from "expo-router";
import * as SecureStore from "expo-secure-store";
import {
  GoogleOneTapSignIn,
  isCancelledResponse,
  isNoSavedCredentialFoundResponse,
  isSuccessResponse,
} from "react-native-nitro-google-signin";
import { useGoogleAuthMutation, useAppleAuthMutation } from "../redux/auth/authApi";
import useTranslation from "../service/useTranslation";

const AUTH_TOKEN_KEY = "user_auth_token";

export function useAuthProviders(onError: (msg: string) => void) {
  const t = useTranslation();
  const navigation = useNavigation();
  const [googleAuth, { isLoading: isGoogleLoading }] = useGoogleAuthMutation();
  const [appleAuth, { isLoading: isAppleLoading }] = useAppleAuthMutation();

  function dismissAuthSheet() {
    // auth Stack is nested inside root Stack; goBack on root pops the formSheet
    navigation.getParent()?.goBack();
  }

  async function handleAppleSignIn() {
    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });
      const { identityToken, fullName } = credential;
      if (!identityToken) throw new Error("No identity token");
      const result = await appleAuth({
        identityToken,
        fullName: fullName
          ? { givenName: fullName.givenName, familyName: fullName.familyName }
          : null,
      }).unwrap();
      await SecureStore.setItemAsync(AUTH_TOKEN_KEY, result.token);
      dismissAuthSheet();
    } catch (err: any) {
      if (err.code === "ERR_REQUEST_CANCELED") return;
      onError(err?.data?.message ?? t("auth.appleSignInFailed"));
    }
  }

  async function handleGoogleSignIn() {
    try {
      await GoogleOneTapSignIn.checkPlayServices();
      let response = await GoogleOneTapSignIn.signIn();

      // User dismissed One Tap bottom sheet — not an error
      if (isCancelledResponse(response)) return;

      let sawPicker = false;

      if (isNoSavedCredentialFoundResponse(response)) {
        response = await GoogleOneTapSignIn.createAccount();
        // createAccount only shows UI if it didn't return noSavedCredential
        sawPicker = !isNoSavedCredentialFoundResponse(response);
      }

      // User saw the account picker and dismissed it — legit cancel
      if (isCancelledResponse(response) && sawPicker) return;

      // No accounts found by createAccount, or it cancelled without showing UI → try explicit
      if (isNoSavedCredentialFoundResponse(response) || isCancelledResponse(response)) {
        response = await GoogleOneTapSignIn.presentExplicitSignIn();
        if (isCancelledResponse(response)) {
          if (!sawPicker) {
            onError(t("auth.googleNoAccounts"));
          }
          return;
        }
      }

      if (!isSuccessResponse(response)) {
        onError(t("auth.googleSignInFailed"));
        return;
      }

      const { idToken } = response.data;
      if (!idToken) throw new Error("No ID token");

      const result = await googleAuth({ idToken }).unwrap();
      await SecureStore.setItemAsync(AUTH_TOKEN_KEY, result.token);
      dismissAuthSheet();
    } catch (err: any) {
      if (isCancelledResponse(err)) return;
      onError(err?.data?.message ?? t("auth.googleSignInFailed"));
    }
  }

  return { handleAppleSignIn, handleGoogleSignIn, isGoogleLoading, isAppleLoading };
}
