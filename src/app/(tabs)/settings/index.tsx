import { AsyncStorage } from "expo-sqlite/kv-store";
import * as Updates from "expo-updates";
import { useEffect, useState } from "react";
import { Platform, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { Button, Icon, SegmentedButtons, Text, TextInput } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import ChooseRegion from "../../../components/ChooseRegion";
import PageHeading from "../../../components/PageHeading";
import { roomActions } from "../../../redux/room/roomSlice";
import { useAppDispatch, useAppSelector } from "../../../redux/store";
import useTranslation from "../../../service/useTranslation";
import { router } from "expo-router";
import { reloadAppAsync } from "expo";
import { useBlockedMovies } from "../../../hooks/useBlockedMovies";
import { useSuperLikedMovies } from "../../../hooks/useSuperLikedMovies";

interface SectionProps {
  title: string;
  children: React.ReactNode;
}

const Section = ({ title, children }: SectionProps) => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>{title}</Text>
    <View style={styles.sectionContent}>{children}</View>
  </View>
);

interface MenuItemProps {
  icon: string;
  iconColor: string;
  label: string;
  badge?: number;
  badgeColor?: string;
  onPress: () => void;
}

const MenuItem = ({ icon, iconColor, label, badge, badgeColor = "#FF4458", onPress }: MenuItemProps) => (
  <Pressable style={styles.menuItem} onPress={onPress}>
    <View style={styles.menuItemLeft}>
      <Icon source={icon} size={24} color={iconColor} />
      <Text style={styles.menuItemText}>{label}</Text>
    </View>
    <View style={styles.menuItemRight}>
      {badge !== undefined && badge > 0 && <Text style={[styles.menuItemBadge, { backgroundColor: badgeColor }]}>{badge}</Text>}
      <Icon source="chevron-right" size={24} color="rgba(255,255,255,0.5)" />
    </View>
  </Pressable>
);

export default function SettingsScreen() {
  const lg = useAppSelector((state) => state.room.language);
  const nk = useAppSelector((state) => state.room.nickname);
  const [nickname, setNickname] = useState<string>(nk);
  const [language, setLanguage] = useState<string>(lg);

  const dispatch = useAppDispatch();
  const t = useTranslation();
  const insets = useSafeAreaInsets();
  const { blockedMovies } = useBlockedMovies();
  const { superLikedMovies } = useSuperLikedMovies();

  const handleSaveNickname = () => {
    if (nickname.trim().length !== 0) {
      AsyncStorage.setItem("nickname", nickname);
      dispatch(roomActions.setSettings({ nickname, language }));
    }
  };

  const handleSaveLanguage = async () => {
    await AsyncStorage.setItem("language", language);
    dispatch(roomActions.setSettings({ nickname, language }));
  };

  const handleReload = async () => {
    if (Platform.OS === "ios") {
      await Updates.reloadAsync({
        reloadScreenOptions: {
          backgroundColor: "#000",
          fade: true,
          image: require("../../../../assets/images/icon-light.png"),
        },
      });
    } else {
      await reloadAppAsync("manual reload from settings");
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(handleSaveNickname, 500);
    return () => clearTimeout(timeoutId);
  }, [nickname, language]);

  useEffect(() => {
    const timeoutId = setTimeout(handleSaveLanguage, 500);
    return () => clearTimeout(timeoutId);
  }, [language, lg, nickname]);

  return (
    <View style={styles.container}>
      <PageHeading title={t("settings.heading")} showBackButton={false} />

      <ScrollView style={styles.scrollView} contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 150 }]}>
        {/* Profile Section */}
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

        {/* Localization Section */}
        <Section title={t("settings.application-language")}>
          <SegmentedButtons
            buttons={[
              { label: "English", value: "en" },
              { label: "Polish", value: "pl" },
            ]}
            onValueChange={setLanguage}
            value={language}
          />

          <ChooseRegion
            onBack={() => router.push("/settings/region-selector")}
            onRegionSelect={(region) => {
              const headers: Record<string, string> = {
                "x-user-region": region.code,
                "x-user-watch-provider": region.code,
                "x-user-watch-region": region.code,
                "x-user-timezone": region.timezone,
              };
              dispatch(roomActions.setSettings({ nickname, language, regionalization: headers }));
              AsyncStorage.setItem("regionalization", JSON.stringify(headers));
            }}
          />
        </Section>

        <Button
          mode="contained"
          onPress={handleReload}
          contentStyle={{
            padding: 7.5,
          }}
          style={{ borderRadius: 100 }}
        >
          <Text style={styles.applyButtonText}>{t("settings.apply")}</Text>
        </Button>

        {/* Library Section */}
        <Section title={t("settings.library") || "Library"}>
          <MenuItem
            icon="cancel"
            iconColor="#FF4458"
            label={t("blocked.title")}
            badge={blockedMovies.length}
            badgeColor="#FF4458"
            onPress={() => router.push("/settings/blocked-movies")}
          />
          <MenuItem
            icon="star"
            iconColor="#FFD700"
            label={t("super-liked.title")}
            badge={superLikedMovies.length}
            badgeColor="#FFD700"
            onPress={() => router.push("/settings/super-liked")}
          />
        </Section>

        <View style={styles.aboutContent}>
          <Text style={styles.aboutText}>
            {t("settings.update")} {Updates.manifest?.id}
          </Text>
          <Text style={styles.aboutText}>
            {t("settings.version")}: {(Updates.manifest as any)?.version}
          </Text>
          <Text style={styles.aboutText}>
            {t("settings.created-at")}: {(Updates.manifest as any)?.createdAt?.toString().split("T")[0]}
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    paddingBottom: 50,
  },
  scrollView: {
    flex: 1,
    paddingTop: 80,
  },
  scrollContent: {
    paddingHorizontal: 15,
    paddingTop: 20,
    gap: 25,
  },
  section: {
    gap: 10,
  },
  sectionTitle: {
    fontSize: 25,
    fontFamily: "Bebas",
    color: "#fff",
  },
  sectionContent: {
    gap: 10,
  },
  textInput: {
    backgroundColor: "transparent",
  },
  helperText: {
    fontSize: 14,
    color: "rgba(255,255,255,0.6)",
    paddingHorizontal: 5,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 12,
    padding: 15,
  },
  menuItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  menuItemRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  menuItemText: {
    fontSize: 16,
    color: "#fff",
  },
  menuItemBadge: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    overflow: "hidden",
  },
  aboutContent: {
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 12,
    padding: 15,
    gap: 4,
  },
  aboutText: {
    fontSize: 14,
    color: "rgba(255,255,255,0.5)",
  },
  applyButton: {
    backgroundColor: "#6750a4",
    borderRadius: 100,
    paddingVertical: 15,
    alignItems: "center",
  },
  applyButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
