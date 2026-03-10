import { FontAwesome } from "@expo/vector-icons";
import { useState } from "react";
import { Keyboard, Pressable, View } from "react-native";
import { MD2DarkTheme, Text, TextInput } from "react-native-paper";
import { createGroupFromArray } from "../redux/favourites/favourites";
import { useAppDispatch } from "../redux/store";
import useTranslation from "../service/useTranslation";
import { router } from "expo-router";
import UserInputModal from "./UserInputModal";

interface CreateCollectionFromLikedProps {
  data: any[];

  beforeCreate?: () => void;
}

export default function CreateCollectionFromLiked({ data, beforeCreate }: CreateCollectionFromLikedProps) {
  const [isModalVisible, setModalVisible] = useState(false);
  const [text, setText] = useState("");
  const dispatch = useAppDispatch();
  const t = useTranslation();

  const handleCreate = () => {
    if (text && data.length > 0) {
      beforeCreate?.();
      dispatch(
        createGroupFromArray({
          movies: data,
          name: text.trim(),
        }),
      );
      setModalVisible(false);
      setText("");
      router.navigate({
        pathname: "/(tabs)/favourites",
        params: {
          scrollsToBottom: true,
        },
      });
    }
  };

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

      <UserInputModal
        visible={isModalVisible}
        onDismiss={() => setModalVisible(false)}
        dismissable
        title={t("create-collection.title") as string}
        actions={[
          {
            label: t("create-collection.create") as string,
            onPress: handleCreate,
            mode: "contained",
            disabled: !text.trim(),
          },
          {
            label: t("create-collection.cancel") as string,
            onPress: () => setModalVisible(false),
            mode: "text",
          },
        ]}
      >
        <TextInput
          onSubmitEditing={() => Keyboard.dismiss()}
          value={text}
          onChangeText={setText}
          label={t("create-collection.input-label")}
          mode="outlined"
          style={{ backgroundColor: "transparent" }}
        />
      </UserInputModal>
    </>
  );
}
