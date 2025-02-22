import { View, Alert, FlatList, Dimensions } from "react-native";
import { useAppDispatch, useAppSelector } from "../redux/store";
import SafeIOSContainer from "../components/SafeIOSContainer";
import { FAB, IconButton, MD2DarkTheme, Text, TouchableRipple } from "react-native-paper";
import { ScreenProps } from "./types";
import useTranslation from "../service/useTranslation";
import { createGroup } from "../redux/favourites/favourites";
import { AntDesign } from "@expo/vector-icons";
import PageHeading from "../components/PageHeading";

import { Image, ImageBackground } from "expo-image";

export default function Favourites({ navigation }: ScreenProps<"Favourites">) {
  const { groups } = useAppSelector((state) => state.favourite);
  const dispatch = useAppDispatch();
  const t = useTranslation();

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
                    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 5 }}>
                      {item.movies.slice(0, 4).map((m) => (
                        <Image
                          key={m.id}
                          contentFit="cover"
                          source={{ uri: "https://image.tmdb.org/t/p/w200" + m.imageUrl }}
                          style={{
                            width: (Dimensions.get("window").width / 2 - 20) * 0.45,
                            height: (Dimensions.get("window").width / 2 - 20) * 0.65,
                            borderRadius: 10,
                          }}
                        />
                      ))}
                    </View>
                  </ImageBackground>
                </View>
                <Text style={{ color: "#fff", fontSize: 25, fontFamily: "Bebas", padding: 10 }}>
                  {item.name} <Text style={{ fontSize: 15 }}>({item.movies.length})</Text>
                </Text>
              </>
            </TouchableRipple>
          )}
        />
      </View>

      <FAB
        style={{ position: "absolute", margin: 16, right: 5, bottom: 5, backgroundColor: MD2DarkTheme.colors.primary }}
        icon="plus"
        onPress={() =>
          Alert.prompt("Create group", "", [
            {
              onPress: (text) => {
                if (text) dispatch(createGroup(text));
              },
            },
          ])
        }
      />
    </SafeIOSContainer>
  );
}
