import { AntDesign } from "@expo/vector-icons";
import { Dimensions, FlatList, ImageBackground, Keyboard, View } from "react-native";
import { Button, Dialog, FAB, MD2DarkTheme, Text, TextInput, TouchableRipple } from "react-native-paper";
import PageHeading from "../components/PageHeading";
import SafeIOSContainer from "../components/SafeIOSContainer";
import { createGroup } from "../redux/favourites/favourites";
import { useAppDispatch, useAppSelector } from "../redux/store";
import useTranslation from "../service/useTranslation";
import { ScreenProps } from "./types";

import { useState } from "react";
import Thumbnail from "../components/Thumbnail";

export default function Favourites({ navigation }: ScreenProps<"Favourites">) {
  const { groups } = useAppSelector((state) => state.favourite);
  const dispatch = useAppDispatch();
  const t = useTranslation();

  const [isModalVisible, setModalVisible] = useState(false);
  const [text, setText] = useState("");

  return (
    <SafeIOSContainer style={{ marginTop: 0 }}>
      <PageHeading title={t("favourites.title")} />
      <View style={{ paddingHorizontal: 15, flex: 1 }}>
        <FlatList
          showsVerticalScrollIndicator={false}
          data={groups}
          keyExtractor={(k, index) => k.id + "-" + index}
          renderItem={({ item }) => (
            <TouchableRipple
              rippleColor={"#000"}
              disabled={item?.movies?.length === 0}
              onPress={() => navigation.navigate("Group", { group: item })}
              style={{ marginBottom: 15 }}
            >
              <>
                <View style={{ borderRadius: 10, overflow: "hidden" }}>
                  <ImageBackground
                    blurRadius={10}
                    style={{
                      width: Dimensions.get("window").width - 30,
                      height: Dimensions.get("window").width / 2 - 30,
                      borderRadius: 15,
                      justifyContent: "center",
                      alignItems: "center",
                      backgroundColor: MD2DarkTheme.colors.surface,
                    }}
                    source={{
                      uri: "https://image.tmdb.org/t/p/w500" + item?.movies[0]?.imageUrl,
                    }}
                  >
                    {item?.movies?.length === 0 && (
                      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 10 }}>
                        <AntDesign name="plus" size={50} color="white" style={{ opacity: 0.5 }} />
                        <Text style={{ fontSize: 11, textAlign: "center" }}>{t("favourites.empty")}</Text>
                      </View>
                    )}
                    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
                      {item.movies.slice(0, 4).map((m) => (
                        <Thumbnail
                          key={m.id}
                          path={m.imageUrl}
                          size={200}
                          container={{
                            width: (Dimensions.get("window").width / 2 - 25) * 0.45,
                            height: (Dimensions.get("window").width / 2 - 25) * 0.65,
                            borderRadius: 5,
                          }}
                        />
                      ))}
                    </View>
                  </ImageBackground>
                </View>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Text style={{ color: "#fff", fontSize: 25, fontFamily: "Bebas", padding: 10 }}>{item.name}</Text>
                  <Text style={{ fontSize: 15 }}>({item.movies.length})</Text>
                </View>
              </>
            </TouchableRipple>
          )}
        />
      </View>

      <FAB
        style={{ position: "absolute", margin: 16, right: 5, bottom: 5, backgroundColor: MD2DarkTheme.colors.primary }}
        icon="plus"
        onPress={() => {
          setModalVisible(true);
        }}
      />

      <Dialog
        dismissableBackButton
        visible={isModalVisible}
        onDismiss={() => setModalVisible(false)}
        style={{ backgroundColor: MD2DarkTheme.colors.surface }}
      >
        <Dialog.Title>{t("favourites.create.title")}</Dialog.Title>
        <Dialog.Content>
          <TextInput
            onSubmitEditing={() => Keyboard.dismiss()}
            value={text}
            onChangeText={setText}
            label={t("favourites.create.name")}
            mode="outlined"
          />
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={() => setModalVisible(false)}> {t("favourites.create.cancel")}</Button>
          <Button
            onPress={() => {
              if (text) {
                dispatch(createGroup(text.trim()));
                setModalVisible(false);
                setText("");
              }
            }}
          >
            {t("favourites.create.create")}
          </Button>
        </Dialog.Actions>
      </Dialog>
    </SafeIOSContainer>
  );
}
