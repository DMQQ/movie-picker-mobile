import * as AppleAuthentication from "expo-apple-authentication";
import { router } from "expo-router";
import * as SecureStore from "expo-secure-store";
import {
  GoogleOneTapSignIn,
  isCancelledResponse,
  isNoSavedCredentialFoundResponse,
  isSuccessResponse,
} from "react-native-nitro-google-signin";
import { useGoogleAuthMutation, useAppleAuthMutation } from "../redux/auth/authApi";

const AUTH_TOKEN_KEY = "user_auth_token";

export function useAuthProviders(onError: (msg: string) => void) {
  const [googleAuth, { isLoading: isGoogleLoading }] = useGoogleAuthMutation();
  const [appleAuth, { isLoading: isAppleLoading }] = useAppleAuthMutation();

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
      router.dismissAll();
    } catch (err: any) {
      if (err.code === "ERR_REQUEST_CANCELED") return;
      onError(err?.data?.message ?? "Apple Sign In failed. Please try again.");
    }
  }

  async function handleGoogleSignIn() {
    try {
      await GoogleOneTapSignIn.checkPlayServices();
      let response = await GoogleOneTapSignIn.signIn();
      if (isNoSavedCredentialFoundResponse(response)) {
        response = await GoogleOneTapSignIn.createAccount();
      }
      if (isNoSavedCredentialFoundResponse(response)) {
        response = await GoogleOneTapSignIn.presentExplicitSignIn();
      }
      if (!isSuccessResponse(response)) {
        onError("Google Sign In failed. Please try again.");
        return;
      }
      const { idToken } = response.data;
      if (!idToken) throw new Error("No ID token");
      const result = await googleAuth({ idToken }).unwrap();
      await SecureStore.setItemAsync(AUTH_TOKEN_KEY, result.token);
      router.dismissAll();
    } catch (err: any) {
      if (isCancelledResponse(err)) return;
      onError(err?.data?.message ?? "Google Sign In failed. Please try again.");
    }
  }

  return { handleAppleSignIn, handleGoogleSignIn, isGoogleLoading, isAppleLoading };
}
