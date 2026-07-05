import { AsyncStorage } from "expo-sqlite/kv-store";
import * as Updates from "expo-updates";
import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { Text, TextInput } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as SecureStore from "expo-secure-store";
import PageHeading from "../../../components/PageHeading";
import { roomActions } from "../../../redux/room/roomSlice";
import { authActions } from "../../../redux/auth/authSlice";
import { useAppDispatch, useAppSelector } from "../../../redux/store";
import useTranslation from "../../../service/useTranslation";
import AuthAccount from "../../../components/AuthAccount";
import UnauthAccount from "../../../components/UnauthAccount";

const AUTH_TOKEN_KEY = "user_auth_token";

interface SectionProps {
  title: string;
  children: React.ReactNode;
}

function Section({ title, children }: SectionProps) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionContent}>{children}</View>
    </View>
  );
}

export default function SettingsScreen() {
  const nk = useAppSelector((state) => state.room.nickname);
  const [nickname, setNickname] = useState<string>(nk);
  const user = useAppSelector((state) => state.auth.user);
  const sessionExpired = useAppSelector((state) => state.auth.sessionExpired);
  const dispatch = useAppDispatch();
  const t = useTranslation();
  const insets = useSafeAreaInsets();

  async function handleSignOut() {
    await SecureStore.deleteItemAsync(AUTH_TOKEN_KEY);
    dispatch(authActions.clearAuth());
  }

  useEffect(() => {
    if (!nickname.trim()) return;
    const id = setTimeout(() => {
      AsyncStorage.setItem("nickname", nickname);
      dispatch(roomActions.setSettings({ nickname }));
    }, 500);
    return () => clearTimeout(id);
  }, [nickname]);

  useEffect(() => {
    if (!user) return;
    setNickname(user.name);
    AsyncStorage.setItem("nickname", user.name);
    dispatch(roomActions.setSettings({ nickname: user.name }));
  }, [user?.name]);

  return (
    <View style={styles.container}>
      <PageHeading title={t("settings.heading")} showBackButton={false} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 150 },
        ]}
      >
        {!user && (
          <Section title={t("settings.nickname")}>
            <TextInput
              value={nickname}
              onChangeText={setNickname}
              mode="outlined"
              label={t("settings.nickname-label")}
              style={styles.textInput}
            />
            <Text style={styles.helperText}>{t("settings.nickname-info")}</Text>
          </Section>
        )}

        <Section title="">
          {user ? (
            <AuthAccount
              user={user}
              onSignOut={handleSignOut}
            />
          ) : (
            <UnauthAccount expired={sessionExpired} />
          )}
        </Section>

        <View style={styles.aboutContent}>
          <Text style={styles.aboutText}>
            {t("settings.update")} {Updates.manifest?.id}
          </Text>
          <Text style={styles.aboutText}>
            {t("settings.version")}: {(Updates.manifest as any)?.version}
          </Text>
          <Text style={styles.aboutText}>
            {t("settings.created-at")}:{" "}
            {(Updates.manifest as any)?.createdAt?.toString().split("T")[0]}
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000", paddingBottom: 50 },
  scrollView: { flex: 1, paddingTop: 80 },
  scrollContent: { paddingHorizontal: 15, paddingTop: 20, gap: 25 },
  section: { gap: 10 },
  sectionTitle: { fontSize: 25, fontFamily: "Bebas", color: "#fff" },
  sectionContent: { gap: 10 },
  textInput: { backgroundColor: "transparent" },
  helperText: {
    fontSize: 14,
    color: "rgba(255,255,255,0.6)",
    paddingHorizontal: 5,
  },
  aboutContent: {
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 12,
    padding: 15,
    gap: 4,
  },
  aboutText: { fontSize: 14, color: "rgba(255,255,255,0.5)" },
});
