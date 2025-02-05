import { useEffect, useState } from "react";
import { ToastAndroid, View } from "react-native";
import { Appbar, SegmentedButtons, Text, TextInput } from "react-native-paper";

import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAppDispatch, useAppSelector } from "../redux/store";
import { ScreenProps } from "./types";
import { roomActions } from "../redux/room/roomSlice";
import SafeIOSContainer from "../components/SafeIOSContainer";
import * as Updates from "expo-updates";
import useTranslation from "../service/useTranslation";

export default function SettingsScreen({ navigation }: ScreenProps<"Settings">) {
  const { language: lg, nickname: nk } = useAppSelector((state) => state.room);
  const [nickname, setNickname] = useState<string>(nk);
  const [language, setLanguage] = useState<string>(lg);

  const dispatch = useAppDispatch();

  const handleSaveNickname = () => {
    if (nickname.trim().length !== 0) {
      AsyncStorage.setItem("nickname", nickname);

      dispatch(roomActions.setSettings({ nickname, language }));

      ToastAndroid.show("Nickname saved", ToastAndroid.SHORT);
    }
  };

  const handleSaveLanguage = async () => {
    if (language === lg) return;
    AsyncStorage.setItem("language", language);

    dispatch(roomActions.setSettings({ nickname, language }));

    await Updates.reloadAsync();
  };

  useEffect(() => {
    let nickTimeoutId = setTimeout(handleSaveNickname, 1500);

    return () => {
      clearTimeout(nickTimeoutId);
    };
  }, [nickname]);

  useEffect(() => {
    let languageTimeoutId = setTimeout(handleSaveLanguage, 1500);

    return () => {
      clearTimeout(languageTimeoutId);
    };
  }, [language]);

  const t = useTranslation();

  return (
    <SafeIOSContainer>
      <Appbar style={{ backgroundColor: "#000" }}>
        <Appbar.BackAction onPress={() => (navigation.canGoBack() ? navigation.goBack() : navigation.navigate("Landing"))} />
        <Appbar.Content title={t("settings.heading")} />
      </Appbar>
      <View style={{ paddingHorizontal: 15, flex: 1 }}>
        <View style={{ marginTop: 20 }}>
          <Text style={{ fontSize: 18, fontWeight: "bold", padding: 2.5 }}>Nickname</Text>

          <TextInput value={nickname} onChangeText={setNickname} mode="outlined" label={"Nickname"} />

          <Text style={{ fontSize: 16, marginTop: 5, padding: 5, color: "gray" }}>{t("settings.nickname-info")}</Text>
        </View>

        <View style={{ marginTop: 35 }}>
          <Text style={{ fontSize: 18, fontWeight: "bold", padding: 2.5 }}>Language</Text>

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

          <Text style={{ fontSize: 16, marginTop: 5, padding: 5, color: "gray" }}>{t("settings.language-info")}</Text>
        </View>

        <View style={{ marginTop: 35 }}>
          <Text style={{ fontSize: 18, fontWeight: "bold", padding: 2.5 }}>About</Text>

          <Text style={{ fontSize: 16, marginTop: 5, padding: 5, color: "gray" }}>{t("settings.about")}</Text>

          <Text
            style={{
              fontSize: 16,
              marginTop: 5,
              padding: 5,
              color: "gray",
              textDecorationLine: "underline",
            }}
          >
            {t("settings.security")}
          </Text>
        </View>
      </View>
    </SafeIOSContainer>
  );
}
