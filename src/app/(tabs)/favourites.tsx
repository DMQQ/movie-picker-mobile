import { AntDesign, MaterialCommunityIcons } from "@expo/vector-icons";
import { Dimensions, FlatList, ImageBackground, Platform, Pressable, StyleSheet, View } from "react-native";
import { MD2DarkTheme, Text, TextInput } from "react-native-paper";
import PageHeading from "../../components/PageHeading";
import SafeIOSContainer from "../../components/SafeIOSContainer";
import { createGroup, loadFavorites } from "../../redux/favourites/favourites";
import { useAppDispatch, useAppSelector } from "../../redux/store";
import useTranslation from "../../service/useTranslation";
import { Link, router, useLocalSearchParams } from "expo-router";
import { useEffect, useRef, useState } from "react";
import Thumbnail from "../../components/Thumbnail";
import UserInputModal from "../../components/UserInputModal";
import { useBlockedMovies } from "../../hooks/useBlockedMovies";
import { useSuperLikedMovies } from "../../hooks/useSuperLikedMovies";

export default function Favourites() {
  const params = useLocalSearchParams();
  const groups = useAppSelector((state) => state.favourite.groups);
  const dispatch = useAppDispatch();
  const t = useTranslation();
  const { blockedMovies } = useBlockedMovies();
  const { superLikedMovies } = useSuperLikedMovies();

  useEffect(() => {
    if (params.scrollsToBottom) {
      setTimeout(() => {
        listRef.current?.scrollToEnd({ animated: true });
      }, 200);
    }
  }, [params.scrollsToBottom]);

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
    <SafeIOSContainer style={{ paddingBottom: 0 }}>
      <PageHeading
        title={t("favourites.title")}
        showBackButton={false}
        showRightIconButton
        rightIconName="plus"
        onRightIconPress={() => setModalVisible(true)}
        useSafeArea
        extraScreenPaddingTop={Platform.OS === "android" ? 0 : 0}
      />
      <View style={{ paddingHorizontal: 15, flex: 1, marginTop: Platform.OS === "android" ? 30 : 0, paddingBottom: 15 }}>
        <FlatList
          ref={listRef}
          showsVerticalScrollIndicator={false}
          data={groups}
          keyExtractor={(k, index) => k.id + "-" + index}
          contentContainerStyle={{ paddingTop: 80, paddingBottom: 60 }}
          ListFooterComponent={
            <View style={specialCardStyles.container}>
              <Pressable onPress={() => router.push("/group/super-liked")} style={specialCardStyles.card}>
                <View style={{ borderRadius: 10, overflow: "hidden", position: "relative" }}>
                  <ImageBackground
                    blurRadius={20}
                    style={specialCardStyles.background}
                    source={superLikedMovies[0] ? { uri: "https://image.tmdb.org/t/p/w500" + superLikedMovies[0].poster_path } : undefined}
                  >
                    <View style={[specialCardStyles.overlay, { backgroundColor: "rgba(255, 215, 0, 0.12)" }]} />
                    {superLikedMovies.length === 0 ? (
                      <View style={specialCardStyles.emptyInner}>
                        <MaterialCommunityIcons name="star" size={50} color="#FFD700" style={{ opacity: 0.5 }} />
                      </View>
                    ) : (
                      <View style={specialCardStyles.thumbnailGrid}>
                        {superLikedMovies.slice(0, 4).map((m) => (
                          <Thumbnail
                            key={m.movie_id}
                            path={m.poster_path || ""}
                            size={200}
                            container={specialCardStyles.thumbnail}
                          />
                        ))}
                      </View>
                    )}
                  </ImageBackground>
                  <View style={specialCardStyles.label}>
                    <Text style={[specialCardStyles.labelText, { color: "#FFD700" }]}>{t("super-liked.title")}</Text>
                    <Text style={specialCardStyles.countText}>({superLikedMovies.length})</Text>
                  </View>
                </View>
              </Pressable>

              <Pressable onPress={() => router.push("/group/blocked")} style={specialCardStyles.card}>
                <View style={{ borderRadius: 10, overflow: "hidden", position: "relative" }}>
                  <ImageBackground
                    blurRadius={20}
                    style={specialCardStyles.background}
                    source={blockedMovies[0] ? { uri: "https://image.tmdb.org/t/p/w500" + blockedMovies[0].poster_path } : undefined}
                  >
                    <View style={[specialCardStyles.overlay, { backgroundColor: "rgba(255, 68, 88, 0.12)" }]} />
                    {blockedMovies.length === 0 ? (
                      <View style={specialCardStyles.emptyInner}>
                        <MaterialCommunityIcons name="cancel" size={50} color="#FF4458" style={{ opacity: 0.5 }} />
                      </View>
                    ) : (
                      <View style={specialCardStyles.thumbnailGrid}>
                        {blockedMovies.slice(0, 4).map((m) => (
                          <Thumbnail
                            key={m.movie_id}
                            path={m.poster_path || ""}
                            size={200}
                            container={specialCardStyles.thumbnail}
                          />
                        ))}
                      </View>
                    )}
                  </ImageBackground>
                  <View style={specialCardStyles.label}>
                    <Text style={[specialCardStyles.labelText, { color: "#FF4458" }]}>{t("blocked.title")}</Text>
                    <Text style={specialCardStyles.countText}>({blockedMovies.length})</Text>
                  </View>
                </View>
              </Pressable>
            </View>
          }
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

const { width: WINDOW_WIDTH } = Dimensions.get("window");

const specialCardStyles = StyleSheet.create({
  container: {
    gap: 15,
    marginTop: 15,
  },
  card: {
    marginBottom: 0,
  },
  background: {
    width: WINDOW_WIDTH - 30,
    height: WINDOW_WIDTH / 2 - 30,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: MD2DarkTheme.colors.surface,
    paddingBottom: 25,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
  emptyInner: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 10,
  },
  thumbnailGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  thumbnail: {
    width: (WINDOW_WIDTH / 2 - 25) * 0.45,
    height: (WINDOW_WIDTH / 2 - 25) * 0.65,
    borderRadius: 5,
  },
  label: {
    flexDirection: "row",
    alignItems: "center",
    position: "absolute",
    bottom: 10,
    left: 15,
    gap: 5,
  },
  labelText: {
    fontSize: 25,
    fontFamily: "Bebas",
  },
  countText: {
    fontSize: 15,
  },
});
