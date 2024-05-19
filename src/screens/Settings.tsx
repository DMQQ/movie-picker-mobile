import { useEffect, useState } from "react";
import { ToastAndroid, View } from "react-native";
import { Appbar, SegmentedButtons, Text, TextInput } from "react-native-paper";

import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAppDispatch, useAppSelector } from "../redux/store";
import { ScreenProps } from "./types";
import { roomActions } from "../redux/room/roomSlice";

export default function SettingsScreen({
  navigation,
}: ScreenProps<"Settings">) {
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

  const handleSaveLanguage = () => {
    if (language === lg) return;
    AsyncStorage.setItem("language", language);

    dispatch(roomActions.setSettings({ nickname, language }));

    ToastAndroid.show("Language saved", ToastAndroid.SHORT);
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

  return (
    <>
      <Appbar style={{ backgroundColor: "#000" }}>
        <Appbar.BackAction
          onPress={() =>
            navigation.canGoBack()
              ? navigation.goBack()
              : navigation.navigate("Landing")
          }
        />
        <Appbar.Content title="Settings" />
      </Appbar>
      <View style={{ paddingHorizontal: 15, flex: 1 }}>
        <View style={{ marginTop: 20 }}>
          <Text style={{ fontSize: 18, fontWeight: "bold", padding: 2.5 }}>
            Nickname
          </Text>

          <TextInput
            value={nickname}
            onChangeText={setNickname}
            mode="outlined"
            label={"Nickname"}
          />

          <Text
            style={{ fontSize: 16, marginTop: 5, padding: 5, color: "gray" }}
          >
            Here you can change your nickname. This will be displayed to other
            users in the room.
          </Text>
        </View>

        <View style={{ marginTop: 35 }}>
          <Text style={{ fontSize: 18, fontWeight: "bold", padding: 2.5 }}>
            Language
          </Text>

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

          <Text
            style={{ fontSize: 16, marginTop: 5, padding: 5, color: "gray" }}
          >
            Changing this value will change the language target for created
            room, meaning the movies will be in choosen language but not the
            controls and other texts.
          </Text>
        </View>

        <View style={{ marginTop: 35 }}>
          <Text style={{ fontSize: 18, fontWeight: "bold", padding: 2.5 }}>
            About
          </Text>

          <Text
            style={{ fontSize: 16, marginTop: 5, padding: 5, color: "gray" }}
          >
            This is a simple app that allows you to create a room and pick
            movies with your friends. You can create a room and invite your
            friends to join you. You can also join a room by entering the room
            code. You can then add movies to the room and watch them together.
            You can also chat with your friends while watching the movie. Enjoy!
          </Text>

          <Text
            style={{
              fontSize: 16,
              marginTop: 5,
              padding: 5,
              color: "gray",
              textDecorationLine: "underline",
            }}
          >
            None of the data is stored on the server. The room is created in
            memory and is destroyed when the last user leaves the room. No
            additional data is stored on the server.
          </Text>
        </View>
      </View>
    </>
  );
}
