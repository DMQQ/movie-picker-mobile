import { AsyncStorage } from "expo-sqlite/kv-store";
import Icon from "../../../components/Icon";
import Text from "../../../components/Text";
import TextInput from "../../../components/TextInput";
import * as Updates from "expo-updates";
import { router } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Linking,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Switch,
  View,
} from "react-native";

import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as SecureStore from "expo-secure-store";
import * as Notifications from "expo-notifications";
import Animated, { FadeInDown } from "react-native-reanimated";
import PageHeading from "../../../components/PageHeading";
import { roomActions } from "../../../redux/room/roomSlice";
import { authActions } from "../../../redux/auth/authSlice";
import { setUserId } from "../../../redux/app/appSlice";
import { useDeleteMeMutation, useUpdateMeMutation, useUpdateDeviceMutation, useMeQuery } from "../../../redux/auth/authApi";
import { useAppDispatch, useAppSelector } from "../../../redux/store";
import useTranslation from "../../../service/useTranslation";
import AuthAccount from "../../../components/AuthAccount";
import UnauthAccount from "../../../components/UnauthAccount";
import ScoringPreferencesButton from "../../../components/ScoringPreferencesButton";
import { colors, fontSize, fontWeight, radius, spacing } from "../../../constants/design";
import { TourAttachStep } from "../../../components/Tour/TourAttachStep";
import { TourProvider } from "../../../components/Tour/TourProvider";
import { type TourRef, type TourStep } from "../../../components/Tour/TourContext";
import TutorialTooltip from "../../../components/TutorialTooltip";
import { useTutorialSeen } from "../../../hooks/useTutorial";

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
  const isFullAccount = !!user && user.provider !== "anonymous";
  const sessionExpired = useAppSelector((state) => state.auth.sessionExpired);
  const dispatch = useAppDispatch();
  const t = useTranslation();
  const insets = useSafeAreaInsets();
  const [deleteMe] = useDeleteMeMutation();
  const [updateMe] = useUpdateMeMutation();
  const [updateDevice] = useUpdateDeviceMutation();
  const [notificationsEnabled, setNotificationsEnabled] = useState<boolean | null>(null);
  const [systemPermission, setSystemPermission] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const { refetch: refetchMe } = useMeQuery(undefined, { skip: !isFullAccount });

  useEffect(() => {
    (async () => {
      const [stored, { status }] = await Promise.all([
        AsyncStorage.getItemAsync("notificationsEnabled"),
        Notifications.getPermissionsAsync(),
      ]);
      setSystemPermission(status);
      if (stored !== null) {
        setNotificationsEnabled(stored !== "false");
      } else {
        setNotificationsEnabled(status === "granted");
      }
    })();
  }, []);

  async function handleToggleNotifications(value: boolean) {
    if (value) {
      const { status } = await Notifications.requestPermissionsAsync();
      setSystemPermission(status);
      if (status !== "granted") {
        setNotificationsEnabled(false);
        Alert.alert(
          t("account.notifications.disabledTitle"),
          t("account.notifications.disabledMessage"),
          [
            { text: t("common.cancel"), style: "cancel" },
            { text: t("account.notifications.openSettings"), onPress: () => Linking.openSettings() },
          ],
        );
        return;
      }
      await AsyncStorage.setItem("notificationsEnabled", "true");
      setNotificationsEnabled(true);
      try {
        const token = (await Notifications.getExpoPushTokenAsync()).data;
        await updateDevice({
          platform: Platform.OS,
          pushNotificationToken: token,
          notificationsEnabled: true,
        }).unwrap();
      } catch {}
    } else {
      await AsyncStorage.setItem("notificationsEnabled", "false");
      setNotificationsEnabled(false);
      try {
        await updateDevice({ pushNotificationToken: null, platform: Platform.OS, notificationsEnabled: false }).unwrap();
      } catch {}
    }
  }

  async function handleSignOut() {
    try {
      await updateDevice({ pushNotificationToken: null, platform: Platform.OS, notificationsEnabled: false }).unwrap();
    } catch {}
    await SecureStore.deleteItemAsync(AUTH_TOKEN_KEY);
    await SecureStore.deleteItemAsync("user_refresh_token");
    dispatch(authActions.clearAuth());
  }

  function handleDeleteAccount() {
    Alert.alert(
      t("account.deleteAccount"),
      t("account.deleteDialog.message"),
      [
        { text: t("common.cancel"), style: "cancel" },
        {
          text: t("account.deleteDialog.confirm"),
          style: "destructive",
          onPress: async () => {
            try {
              await deleteMe().unwrap();
              await SecureStore.deleteItemAsync(AUTH_TOKEN_KEY);
              await SecureStore.deleteItemAsync("user_refresh_token");
              dispatch(authActions.clearAuth());
            } catch {
              Alert.alert(t("common.error"), t("account.deleteDialog.error"));
            }
          },
        },
      ],
    );
  }

  const tourRef = useRef<TourRef>(null);
  const { seen, markSeen } = useTutorialSeen("tutorial_account_seen");
  const scrollRef = useRef<ScrollView>(null);

  const scrollTo = useCallback(
    (y: number) =>
      new Promise<void>((resolve) => {
        scrollRef.current?.scrollTo({ y, animated: true });
        setTimeout(resolve, 380);
      }),
    [],
  );

  const steps = useMemo<TourStep[]>(
    () => [
      {
        render: (props) => (
          <TutorialTooltip
            {...props}
            title={t("tutorial.account.profile.title") as string}
            description={t("tutorial.account.profile.description") as string}
          />
        ),
        spotRadius: 16,
        placement: "bottom",
      },
      {
        render: (props) => (
          <TutorialTooltip
            {...props}
            title={t("tutorial.account.preferences.title") as string}
            description={t("tutorial.account.preferences.description") as string}
          />
        ),
        spotRadius: 16,
        placement: "bottom",
        before: () => scrollTo(360),
      },
      {
        render: (props) => (
          <TutorialTooltip
            {...props}
            title={t("tutorial.account.notifications.title") as string}
            description={t("tutorial.account.notifications.description") as string}
          />
        ),
        spotRadius: 16,
        placement: "bottom",
        before: () => scrollTo(460),
      },
    ],
    [t, scrollTo],
  );

  useEffect(() => {
    if (seen === false) {
      // Wait for the profile block entering animation to settle before measuring
      const timer = setTimeout(() => tourRef.current?.start(), 700);
      return () => clearTimeout(timer);
    }
  }, [seen]);

  useEffect(() => {
    if (!nickname.trim()) return;
    const id = setTimeout(() => {
      AsyncStorage.setItem("nickname", nickname);
      dispatch(roomActions.setSettings({ nickname }));
      if (user?.provider === "anonymous") {
        updateMe({ name: nickname }).catch(() => {});
      }
    }, 500);
    return () => clearTimeout(id);
  }, [nickname]);

  useEffect(() => {
    if (!user) return;
    setNickname(user.name);
    AsyncStorage.setItem("nickname", user.name);
    dispatch(roomActions.setSettings({ nickname: user.name }));
  }, [user?.name]);

  async function onRefresh() {
    setRefreshing(true);
    try {
      if (isFullAccount) await refetchMe();
      const { status } = await Notifications.getPermissionsAsync();
      setSystemPermission(status);
      const stored = await AsyncStorage.getItemAsync("notificationsEnabled");
      if (stored !== null) {
        setNotificationsEnabled(stored !== "false");
      } else {
        setNotificationsEnabled(status === "granted");
      }
    } catch {}
    setRefreshing(false);
  }

  const appVersion = (Updates.manifest as any)?.version ?? "—";
  const updateId = Updates.manifest?.id?.split("-")[0] ?? "—";
  const createdAt =
    (Updates.manifest as any)?.createdAt?.toString().split("T")[0] ?? "—";

  return (
    <TourProvider ref={tourRef} steps={steps} onStop={markSeen}>
      <View style={styles.container}>
        <PageHeading
          title={t("settings.heading")}
          showBackButton={false}
          showRightIconButton={false}
          showGradientBackground
        />

        <ScrollView
        ref={scrollRef}
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 150 },
        ]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.placeholder}
            colors={[colors.primary]}
          />
        }
      >
        {!isFullAccount && (
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

        <TourAttachStep index={0} fill>
          <Animated.View entering={FadeInDown.delay(isFullAccount ? 60 : 140)}>
            {isFullAccount ? (
              <AuthAccount user={user} />
            ) : (
              <UnauthAccount expired={sessionExpired} />
            )}
          </Animated.View>
        </TourAttachStep>

        {isFullAccount && (
          <Animated.View
            entering={FadeInDown.delay(140)}
            style={styles.section}
          >
            <SectionLabel icon="alert-circle-outline" title={t("account.sections.account")} />
            <View style={styles.card}>
              <Pressable style={styles.actionRow} onPress={handleSignOut}>
                <View style={styles.actionRowInner}>
                  <Icon source="logout" size={16} color={colors.placeholder} />
                  <Text style={styles.actionRowText}>{t("account.signOut")}</Text>
                </View>
                <Icon source="chevron-right" size={16} color={colors.placeholder} />
              </Pressable>
              <View style={styles.infoRowDivider} />
              <Pressable style={styles.actionRow} onPress={handleDeleteAccount}>
                <View style={styles.actionRowInner}>
                  <Icon source="delete-outline" size={16} color={colors.error} />
                  <Text style={styles.actionRowTextDanger}>{t("account.deleteAccount")}</Text>
                </View>
                <Icon source="chevron-right" size={16} color={colors.placeholder} />
              </Pressable>
            </View>
          </Animated.View>
        )}

        <Animated.View entering={FadeInDown.delay(180)} style={styles.section}>

              <SectionLabel icon="tune-variant" title={t("account.sections.preferences")} />
              <View style={[styles.card,{gap: 10}]}>
                <TourAttachStep index={1} fill>
                <ScoringPreferencesButton />
              </TourAttachStep>
                <View style={styles.infoRowDivider} />
              <TourAttachStep index={2} fill>
              <Pressable
                style={styles.notifCard}
                disabled={notificationsEnabled === null}
                onPress={() => handleToggleNotifications(!notificationsEnabled)}
              >
                <View style={styles.notifLeft}>
                  <Icon source="bell-outline" size={16} color={colors.placeholder} />
                  <Text style={styles.notifLabel}>{t("account.pushNotifications")}</Text>
                </View>
                <Switch
                  value={notificationsEnabled ?? false}
                  disabled={notificationsEnabled === null}
                  onValueChange={handleToggleNotifications}
                  trackColor={{ false: colors.border, true: colors.primary }}
                  thumbColor={colors.text}
                />
              </Pressable>
              </TourAttachStep>
              {systemPermission === "denied" ? (
                <Text style={styles.notifHint}>
                  {t("account.notifications.systemDisabled")}{" "}
                  <Text style={styles.notifHintLink} onPress={() => Linking.openSettings()}>
                    {t("account.notifications.openSettings")}
                  </Text>
                </Text>
              ) : null}
          </View>
          </Animated.View>


        <Animated.View entering={FadeInDown.delay(220)} style={styles.section}>
          <SectionLabel icon="information-outline" title={t("account.sections.app")} />
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
              onPress={() => {
                const tutorialKeys = [
                  "tutorial_home_seen",
                  "tutorial_swipe_seen",
                  "tutorial_discover_seen",
                  "tutorial_favourites_seen",
                  "tutorial_search_seen",
                  "tutorial_account_seen",
                ];
                tutorialKeys.forEach((key) => AsyncStorage.removeItem(key));
              }}
            >
              Reset tutorial
            </Text>
            <Text
              style={styles.devButton}
              onPress={async () => {
                await AsyncStorage.removeItem("userId");
                await SecureStore.deleteItemAsync("user_auth_token");
                await SecureStore.deleteItemAsync("user_refresh_token");
                dispatch(setUserId(""));
                dispatch(authActions.clearAuth());
                Alert.alert("Done", "userId + tokens cleared — reload app to regenerate");
              }}
            >
              Reset anonymous userId
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
    </TourProvider>
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

  notifCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.md + 2,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  notifLeft: { flexDirection: "row", alignItems: "center", gap: spacing.sm + 2 },
  notifLabel: { fontSize: fontSize.md, color: colors.text },
  notifHint: {
    fontSize: fontSize.sm,
    color: colors.placeholder,
    lineHeight: fontSize.sm + 6,
    paddingHorizontal: spacing.md + 2,
  },
  notifHintLink: {
    color: colors.primary,
    fontWeight: fontWeight.semibold,
  },

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
