import { useNavigation } from "@react-navigation/native";
import { useState } from "react";
import { Keyboard, Pressable } from "react-native";
import { Button, Dialog, MD2DarkTheme, Portal, TextInput } from "react-native-paper";
import { createGroupFromArray } from "../redux/favourites/favourites";
import { useAppDispatch } from "../redux/store";
import useTranslation from "../service/useTranslation";

interface CreateCollectionFromLikedProps {
  data: any[];

  children: React.ReactNode;
}

export default function CreateCollectionFromLiked({ data, children }: CreateCollectionFromLikedProps) {
  const [isModalVisible, setModalVisible] = useState(false);
  const [text, setText] = useState("");
  const navigation = useNavigation<any>();
  const dispatch = useAppDispatch();
  const t = useTranslation();

  return (
    <>
      <Pressable onPress={() => setModalVisible((p) => !p)}>{children}</Pressable>

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
                  navigation.navigate("Favourites");
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
