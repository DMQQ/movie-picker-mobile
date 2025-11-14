import { FontAwesome } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useState } from "react";
import { Keyboard, Pressable, View } from "react-native";
import { Button, Dialog, MD2DarkTheme, Portal, Text, TextInput } from "react-native-paper";
import { createGroupFromArray } from "../redux/favourites/favourites";
import { useAppDispatch } from "../redux/store";
import useTranslation from "../service/useTranslation";
import { router } from "expo-router";

interface CreateCollectionFromLikedProps {
  data: any[];
}

export default function CreateCollectionFromLiked({ data }: CreateCollectionFromLikedProps) {
  const [isModalVisible, setModalVisible] = useState(false);
  const [text, setText] = useState("");
  const dispatch = useAppDispatch();
  const t = useTranslation();

  return (
    <>
      <Pressable onPress={() => setModalVisible((p) => !p)}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            paddingHorizontal: 15,
            paddingVertical: 10,
            borderRadius: 100,
            borderWidth: 1,
            gap: 5,
            borderColor: MD2DarkTheme.colors.primary,
          }}
        >
          <FontAwesome name="bookmark-o" color={MD2DarkTheme.colors.primary} size={16} />
          <Text
            style={{
              color: MD2DarkTheme.colors.primary,
              fontWeight: "bold",

              fontSize: 14,
            }}
          >
            {t("overview.save-list")}
          </Text>
        </View>
      </Pressable>

      <Portal>
        <Dialog
          dismissableBackButton
          visible={isModalVisible}
          onDismiss={() => setModalVisible(false)}
          style={{ backgroundColor: MD2DarkTheme.colors.surface }}
        >
          <Dialog.Title>{t("create-collection.title")}</Dialog.Title>
          <Dialog.Content>
            <TextInput
              onSubmitEditing={() => Keyboard.dismiss()}
              value={text}
              onChangeText={setText}
              label={t("create-collection.input-label")}
              mode="outlined"
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setModalVisible(false)}>{t("create-collection.cancel")}</Button>
            <Button
              onPress={() => {
                if (text && data.length > 0) {
                  dispatch(
                    createGroupFromArray({
                      movies: data,
                      name: text.trim(),
                    })
                  );
                  setModalVisible(false);
                  setText("");
                  router.navigate("/favourites");
                }
              }}
            >
              {t("create-collection.create")}
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </>
  );
}
