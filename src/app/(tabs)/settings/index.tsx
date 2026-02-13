import { AsyncStorage } from "expo-sqlite/kv-store";
import * as Updates from "expo-updates";
import { useEffect, useState } from "react";
import { Platform, Pressable, StyleSheet, View } from "react-native";
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

export default function SettingsScreen() {
  const lg = useAppSelector((state) => state.room.language);
  const nk = useAppSelector((state) => state.room.nickname);
  const [nickname, setNickname] = useState<string>(nk);
  const [language, setLanguage] = useState<string>(lg);

  const dispatch = useAppDispatch();

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

  useEffect(() => {
    let nickTimeoutId = setTimeout(handleSaveNickname, 500);

    return () => {
      clearTimeout(nickTimeoutId);
    };
  }, [nickname, language]);

  useEffect(() => {
    let languageTimeoutId = setTimeout(handleSaveLanguage, 500);

    return () => {
      clearTimeout(languageTimeoutId);
    };
  }, [language, lg, nickname]);

  const t = useTranslation();
  const insets = useSafeAreaInsets();
  const { blockedMovies } = useBlockedMovies();
  const { superLikedMovies } = useSuperLikedMovies();

  return (
    <View style={{ flex: 1, backgroundColor: "#000" }}>
      <PageHeading title={t("settings.heading")} extraScreenPaddingTop={Platform.OS === "android" ? 0 : 0} showBackButton={false} />

      <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.1)", paddingTop: 100 }}>
        <View style={{ paddingHorizontal: 15, flex: 1 }}>
          <View style={{ marginTop: 20 }}>
            <Text style={{ fontSize: 25, fontFamily: "Bebas" }}>{t("settings.nickname")}</Text>

            <TextInput
              value={nickname}
              onChangeText={setNickname}
              mode="outlined"
              label={t("settings.nickname-label")}
              style={{ backgroundColor: "transparent", marginTop: 5 }}
            />

            <Text style={{ fontSize: 16, marginTop: 5, padding: 5, color: "#fff" }}>{t("settings.nickname-info")}</Text>
          </View>

          <View style={{ marginTop: 35 }}>
            <Text style={{ fontSize: 25, fontFamily: "Bebas" }}>{t("settings.application-language")}</Text>

            <SegmentedButtons
              buttons={[
                {
                  label: "English",
                  value: "en",
                },
                {
                  label: "Polish",
                  value: "pl",
                },
              ]}
              onValueChange={(value) => setLanguage(value)}
              value={language}
              style={{ marginTop: 10 }}
            />
          </View>

          <ChooseRegion
            onBack={() => router.push("/settings/region-selector")}
            onRegionSelect={(region) => {
              const headers = {} as Record<string, string>;
              headers["x-user-region"] = region.code;
              headers["x-user-watch-provider"] = region.code;
              headers["x-user-watch-region"] = region.code;
              headers["x-user-timezone"] = region.timezone;

              dispatch(roomActions.setSettings({ nickname, language, regionalization: headers }));
              AsyncStorage.setItem("regionalization", JSON.stringify(headers));
            }}
          />

          <View style={settingsStyles.menuSection}>
            <Pressable
              style={settingsStyles.menuItem}
              onPress={() => router.push("/settings/blocked-movies")}
            >
              <View style={settingsStyles.menuItemLeft}>
                <Icon source="cancel" size={24} color="#FF4458" />
                <Text style={settingsStyles.menuItemText}>{t("blocked.title")}</Text>
              </View>
              <View style={settingsStyles.menuItemRight}>
                {blockedMovies.length > 0 && (
                  <Text style={settingsStyles.menuItemBadge}>{blockedMovies.length}</Text>
                )}
                <Icon source="chevron-right" size={24} color="rgba(255,255,255,0.5)" />
              </View>
            </Pressable>

            <Pressable
              style={settingsStyles.menuItem}
              onPress={() => router.push("/settings/super-liked")}
            >
              <View style={settingsStyles.menuItemLeft}>
                <Icon source="star" size={24} color="#FFD700" />
                <Text style={settingsStyles.menuItemText}>{t("super-liked.title")}</Text>
              </View>
              <View style={settingsStyles.menuItemRight}>
                {superLikedMovies.length > 0 && (
                  <Text style={[settingsStyles.menuItemBadge, { backgroundColor: "#FFD700" }]}>
                    {superLikedMovies.length}
                  </Text>
                )}
                <Icon source="chevron-right" size={24} color="rgba(255,255,255,0.5)" />
              </View>
            </Pressable>
          </View>

          <Text style={{ color: "gray" }}>
            {t("settings.update")} {Updates.manifest?.id} {"\n"}
            {t("settings.version")}: {(Updates.manifest as any)?.version}
            {"\n"}
            {t("settings.created-at")}: ({(Updates.manifest as any)?.createdAt?.toString().split("T")[0]})
          </Text>
        </View>
        <View style={{ padding: 15, paddingBottom: insets.bottom + (Platform.OS === "ios" ? 75 : 0), backgroundColor: "rgba(0,0,0,0.1)" }}>
          <Button
            style={{
              borderRadius: 100,
            }}
            contentStyle={{ padding: 7.5 }}
            mode="contained"
            onPress={async () =>
              Platform.OS === "ios"
                ? await Updates.reloadAsync({
                    reloadScreenOptions: {
                      backgroundColor: "#000",
                      fade: true,
                      image: require("../../../../assets/images/icon-light.png"),
                    },
                  })
                : await reloadAppAsync("manual reload from settings")
            }
          >
            {t("settings.apply")}
          </Button>
        </View>
      </View>
    </View>
  );
}

const settingsStyles = StyleSheet.create({
  menuSection: {
    marginTop: 25,
    gap: 10,
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
    backgroundColor: "#FF4458",
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    overflow: "hidden",
  },
});
