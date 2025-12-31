import { AntDesign } from "@expo/vector-icons";
import { Dimensions, FlatList, ImageBackground, Platform, View } from "react-native";
import { MD2DarkTheme, Text, TextInput } from "react-native-paper";
import PageHeading from "../../components/PageHeading";
import SafeIOSContainer from "../../components/SafeIOSContainer";
import { createGroup, loadFavorites } from "../../redux/favourites/favourites";
import { useAppDispatch, useAppSelector } from "../../redux/store";
import useTranslation from "../../service/useTranslation";
import { Link } from "expo-router";
import { useEffect, useRef, useState } from "react";
import Thumbnail from "../../components/Thumbnail";
import UserInputModal from "../../components/UserInputModal";

export default function Favourites() {
  const groups = useAppSelector((state) => state.favourite.groups);
  const dispatch = useAppDispatch();
  const t = useTranslation();

  useEffect(() => {
    dispatch(loadFavorites());
  }, []);

  const [isModalVisible, setModalVisible] = useState(false);
  const [text, setText] = useState("");

  const listRef = useRef<FlatList>(null);

  const handleCreateGroup = () => {
    if (text) {
      dispatch(createGroup(text.trim()));
      setModalVisible(false);
      setText("");
      setTimeout(() => {
        listRef.current?.scrollToEnd({ animated: true });
      }, 200);
    }
  };

  return (
    <SafeIOSContainer>
      <PageHeading
        title={t("favourites.title")}
        showBackButton={false}
        showRightIconButton
        rightIconName="plus"
        onRightIconPress={() => setModalVisible(true)}
        useSafeArea
        extraScreenPaddingTop={Platform.OS === "android" ? 20 : 0}
      />
      <View style={{ paddingHorizontal: 15, flex: 1, marginTop: Platform.OS === "android" ? 30 : 0, paddingBottom: 45 }}>
        <FlatList
          ref={listRef}
          showsVerticalScrollIndicator={false}
          data={groups}
          keyExtractor={(k, index) => k.id + "-" + index}
          contentContainerStyle={{ paddingTop: 80 }}
          renderItem={({ item, index }) => (
            <Link
              disabled={item?.movies?.length === 0}
              style={{ marginBottom: 15 }}
              href={{
                pathname: "/group/[id]",
                params: {
                  id: item.id,
                  group: JSON.stringify(item),
                },
              }}
            >
              <Link.Trigger>
                <View style={{ borderRadius: 10, overflow: "hidden", position: "relative" }}>
                  <ImageBackground
                    blurRadius={20}
                    style={{
                      width: Dimensions.get("window").width - 30,
                      height: Dimensions.get("window").width / 2 - 30,
                      borderRadius: 15,
                      justifyContent: "center",
                      alignItems: "center",
                      backgroundColor: MD2DarkTheme.colors.surface,
                      paddingBottom: 25,
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
                  <View style={{ flexDirection: "row", alignItems: "center", position: "absolute", bottom: 10, left: 15, gap: 5 }}>
                    <Text style={{ color: "#fff", fontSize: 25, fontFamily: "Bebas" }}>{item.name}</Text>
                    <Text style={{ fontSize: 15 }}>({item.movies.length})</Text>
                  </View>
                </View>
              </Link.Trigger>
            </Link>
          )}
        />
      </View>

      <UserInputModal
        visible={isModalVisible}
        onDismiss={() => {
          setModalVisible(false);
          setText("");
        }}
        title={t("favourites.create.title")}
        dismissable
        actionsLayout="horizontal"
        actions={[
          {
            label: t("favourites.create.cancel"),
            onPress: () => {
              setModalVisible(false);
              setText("");
            },
            mode: "outlined",
          },
          {
            label: t("favourites.create.create"),
            onPress: handleCreateGroup,
            mode: "contained",
          },
        ]}
      >
        <TextInput
          onSubmitEditing={handleCreateGroup}
          value={text}
          onChangeText={setText}
          label={t("favourites.create.name")}
          mode="outlined"
        />
      </UserInputModal>
    </SafeIOSContainer>
  );
}
