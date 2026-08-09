import { AsyncStorage } from "expo-sqlite/kv-store";
import Icon from "../../../components/Icon";
import Text from "../../../components/Text";
import TextInput from "../../../components/TextInput";
import * as Updates from "expo-updates";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";

import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as SecureStore from "expo-secure-store";
import Animated, { FadeInDown } from "react-native-reanimated";
import PageHeading from "../../../components/PageHeading";
import { roomActions } from "../../../redux/room/roomSlice";
import { authActions } from "../../../redux/auth/authSlice";
import { useDeleteMeMutation } from "../../../redux/auth/authApi";
import { useAppDispatch, useAppSelector } from "../../../redux/store";
import useTranslation from "../../../service/useTranslation";
import AuthAccount from "../../../components/AuthAccount";
import UnauthAccount from "../../../components/UnauthAccount";
import { colors, fontSize, fontWeight, radius, spacing } from "../../../constants/design";

const AUTH_TOKEN_KEY = "user_auth_token";
function SectionLabel({
  icon,
  title,
  badge,
  badgeDev,
}: {
  icon: string;
  title: string;
  badge?: string;
  badgeDev?: boolean;
}) {
  return (
    <View style={styles.sectionLabel}>
      <Icon source={icon} size={14} color={colors.placeholder} />
      <Text style={styles.sectionLabelText}>{title}</Text>
      {badge && (
        <View style={[styles.labelBadge, badgeDev && styles.labelBadgeDev]}>
          <Text
            style={[
              styles.labelBadgeText,
              badgeDev && styles.labelBadgeTextDev,
            ]}
          >
            {badge}
          </Text>
        </View>
      )}
    </View>
  );
}

function InfoRow({
  label,
  value,
  last,
}: {
  label: string;
  value: string;
  last?: boolean;
}) {
  return (
    <>
      <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue} numberOfLines={1}>
          {value}
        </Text>
      </View>
      {!last && <View style={styles.infoRowDivider} />}
    </>
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
  const [deleteMe] = useDeleteMeMutation();

  async function handleSignOut() {
    await SecureStore.deleteItemAsync(AUTH_TOKEN_KEY);
    dispatch(authActions.clearAuth());
  }

  function handleDeleteAccount() {
    Alert.alert(
      "Delete account",
      "This will permanently delete your account and all associated data. This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteMe().unwrap();
              await SecureStore.deleteItemAsync(AUTH_TOKEN_KEY);
              dispatch(authActions.clearAuth());
            } catch {
              Alert.alert(
                "Error",
                "Failed to delete account. Please try again.",
              );
            }
          },
        },
      ],
    );
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

  const appVersion = (Updates.manifest as any)?.version ?? "—";
  const updateId = Updates.manifest?.id?.split("-")[0] ?? "—";
  const createdAt =
    (Updates.manifest as any)?.createdAt?.toString().split("T")[0] ?? "—";

  return (
    <View style={styles.container}>
      <PageHeading
        title={t("settings.heading")}
        showBackButton={false}
        showRightIconButton={false}
        gradientHeight={60}
        showGradientBackground
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 150 },
        ]}
      >
        {!user && (
          <Animated.View entering={FadeInDown.delay(60)} style={styles.section}>
            <SectionLabel
              icon="pencil-outline"
              title={t("settings.nickname").toUpperCase()}
            />
            <View style={styles.card}>
              <TextInput
                value={nickname}
                onChangeText={setNickname}
                label={t("settings.nickname-label")}
                style={styles.textInput}
              />
              <Text style={styles.helperText}>
                {t("settings.nickname-info")}
              </Text>
            </View>
          </Animated.View>
        )}

        <Animated.View entering={FadeInDown.delay(user ? 60 : 140)}>
          {user ? (
            <AuthAccount user={user} />
          ) : (
            <UnauthAccount expired={sessionExpired} />
          )}
        </Animated.View>

        {user && (
          <Animated.View
            entering={FadeInDown.delay(140)}
            style={styles.section}
          >
            <SectionLabel icon="alert-circle-outline" title="ACCOUNT" />
            <View style={styles.card}>
              <Pressable style={styles.actionRow} onPress={handleSignOut}>
                <View style={styles.actionRowInner}>
                  <Icon source="logout" size={16} color={colors.placeholder} />
                  <Text style={styles.actionRowText}>Sign out</Text>
                </View>
                <Icon source="chevron-right" size={16} color={colors.placeholder} />
              </Pressable>
              <View style={styles.infoRowDivider} />
              <Pressable style={styles.actionRow} onPress={handleDeleteAccount}>
                <View style={styles.actionRowInner}>
                  <Icon source="delete-outline" size={16} color={colors.error} />
                  <Text style={styles.actionRowTextDanger}>Delete account</Text>
                </View>
                <Icon source="chevron-right" size={16} color={colors.placeholder} />
              </Pressable>
            </View>
          </Animated.View>
        )}

        <Animated.View entering={FadeInDown.delay(220)} style={styles.section}>
          <SectionLabel icon="information-outline" title="APP" />
          <View style={styles.card}>
            <InfoRow label={t("settings.version")} value={appVersion} />
            <InfoRow label={t("settings.update")} value={updateId} />
            <InfoRow label={t("settings.created-at")} value={createdAt} last />
          </View>
        </Animated.View>

        {__DEV__ && (
          <Animated.View
            entering={FadeInDown.delay(300)}
            style={styles.section}
          >
            <SectionLabel
              icon="bug-outline"
              title="DEV TOOLS"
              badge="DEV"
              badgeDev
            />
            <Text
              style={styles.devButton}
              onPress={async () => {
                await AsyncStorage.removeItem("tutorial_home_seen");
                await AsyncStorage.removeItem("tutorial_swipe_seen");
              }}
            >
              Reset tutorial
            </Text>
            <Text
              style={[styles.devButton, styles.devButtonPrimary]}
              onPress={() => router.push("/design-preview")}
            >
              Design preview
            </Text>
          </Animated.View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.appBackground,
    ...Platform.select({ ios: { paddingBottom: spacing.xxl * 2 + 2 } }),
  },
  scrollView: { flex: 1, paddingTop: spacing.xl * 4 },
  scrollContent: { paddingHorizontal: spacing.screen, gap: spacing.xxl, paddingTop: spacing.screen },

  section: { gap: spacing.sm + 2 },

  sectionLabel: { flexDirection: "row", alignItems: "center", gap: spacing.xs + 3 },
  sectionLabelText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
    color: colors.placeholder,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  labelBadge: {
    backgroundColor: colors.overlay,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.xs + 3,
    paddingVertical: spacing.xs - 3,
  },
  labelBadgeDev: { backgroundColor: "rgba(255,68,88,0.15)" },
  labelBadgeText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    color: colors.placeholder,
    letterSpacing: 0.5,
  },
  labelBadgeTextDev: { color: colors.error },

  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md + 2,
    padding: spacing.md + 2,
    gap: spacing.sm + 2,
  },

  textInput: { backgroundColor: "transparent" },
  helperText: {
    fontSize: fontSize.md,
    color: colors.placeholder,
    paddingHorizontal: spacing.xs + 1,
  },

  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  infoLabel: { fontSize: fontSize.sm + 1, color: colors.textSecondary },
  infoValue: { fontSize: fontSize.sm + 1, fontWeight: fontWeight.semibold, color: colors.text },
  infoRowDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
  },

  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: spacing.xs,
  },
  actionRowInner: { flexDirection: "row", alignItems: "center", gap: spacing.sm + 2 },
  actionRowText: { fontSize: fontSize.md, color: colors.text },
  actionRowTextDanger: { fontSize: fontSize.md, color: colors.error },

  devButton: {
    color: colors.error,
    fontSize: fontSize.lg - 1,
    fontWeight: fontWeight.semibold,
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.md + 2,
    backgroundColor: "transparent",
    borderRadius: radius.sm + 2,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.error,
    opacity: 0.7,
  },
  devButtonPrimary: {
    borderColor: colors.primary,
    color: colors.primary,
    opacity: 1,
  },
});
