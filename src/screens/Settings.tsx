import AsyncStorage from "@react-native-async-storage/async-storage";
import { BlurView } from "expo-blur";
import * as Updates from "expo-updates";
import { useEffect, useState } from "react";
import { ToastAndroid, View } from "react-native";
import { SegmentedButtons, Text, TextInput } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import ChooseRegion from "../components/ChooseRegion";
import PageHeading from "../components/PageHeading";
import TransparentModalScreen from "../components/TransparentModalBackGesture";
import { roomActions } from "../redux/room/roomSlice";
import { useAppDispatch, useAppSelector } from "../redux/store";
import useTranslation from "../service/useTranslation";
import { ScreenProps } from "./types";

export default function SettingsScreen({ navigation }: ScreenProps<"Settings">) {
  const lg = useAppSelector((state) => state.room.language);
  const nk = useAppSelector((state) => state.room.nickname);
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
    await AsyncStorage.setItem("language", language);

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
  const insets = useSafeAreaInsets();

  return (
    <TransparentModalScreen>
      <BlurView style={{ flex: 1, paddingTop: insets.top }} intensity={50} tint="dark">
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.1)" }}>
          <PageHeading title={t("settings.heading")} />
          <View style={{ paddingHorizontal: 15, flex: 1 }}>
            <View style={{ marginTop: 20 }}>
              <Text style={{ fontSize: 25, fontFamily: "Bebas" }}>Nickname</Text>

              <TextInput
                value={nickname}
                onChangeText={setNickname}
                mode="outlined"
                label={"Nickname"}
                style={{ backgroundColor: "transparent", marginTop: 5 }}
              />

              <Text style={{ fontSize: 16, marginTop: 5, padding: 5, color: "#fff" }}>{t("settings.nickname-info")}</Text>
            </View>

            <View style={{ marginTop: 35 }}>
              <Text style={{ fontSize: 25, fontFamily: "Bebas" }}>Application language</Text>

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

            <ChooseRegion onBack={() => navigation.navigate("RegionSelector")} />
          </View>
        </View>
      </BlurView>
    </TransparentModalScreen>
  );
}
