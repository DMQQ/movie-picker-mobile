import * as AppleAuthentication from "expo-apple-authentication";
import { Platform, Pressable, StyleSheet, View } from "react-native";
import { Icon, Text } from "react-native-paper";
import GoogleSignInButton from "./GoogleSignInButton";

interface Props {
  onEmailPress: () => void;
  onApplePress: () => void;
  onGooglePress: () => void;
  isGoogleLoading: boolean;
  disabled: boolean;
  appleButtonType: AppleAuthentication.AppleAuthenticationButtonType;
  googleLabel?: string;
}

export default function AuthProviderButtons({
  onEmailPress,
  onApplePress,
  onGooglePress,
  isGoogleLoading,
  disabled,
  appleButtonType,
  googleLabel,
}: Props) {
  return (
    <View style={styles.options}>
      <Pressable
        onPress={onEmailPress}
        disabled={disabled}
        style={({ pressed }) => [styles.emailBtn, pressed && styles.emailBtnPressed]}
      >
        <Icon source="email-outline" size={20} color="rgba(255,255,255,0.85)" />
        <Text style={styles.emailBtnText}>Continue with Email</Text>
      </Pressable>

      {Platform.OS === "ios" && (
        <AppleAuthentication.AppleAuthenticationButton
          buttonType={appleButtonType}
          buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.WHITE}
          cornerRadius={25}
          style={styles.appleBtn}
          onPress={onApplePress}
        />
      )}

      <GoogleSignInButton
        onPress={onGooglePress}
        loading={isGoogleLoading}
        disabled={disabled}
        label={googleLabel}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  options: { gap: 12, marginBottom: 28 },
  emailBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    height: 50,
    borderRadius: 25,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },
  emailBtnPressed: { backgroundColor: "rgba(255,255,255,0.13)" },
  emailBtnText: {
    fontSize: 15,
    fontWeight: "500",
    color: "rgba(255,255,255,0.85)",
    letterSpacing: 0.2,
  },
  appleBtn: { height: 50 },
});
