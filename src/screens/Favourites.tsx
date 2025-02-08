import { View, Alert, FlatList, Dimensions, Image, ImageBackground } from "react-native";
import { useAppDispatch, useAppSelector } from "../redux/store";
import SafeIOSContainer from "../components/SafeIOSContainer";
import { FAB, IconButton, MD2DarkTheme, Text, TouchableRipple } from "react-native-paper";
import { ScreenProps } from "./types";
import useTranslation from "../service/useTranslation";
import { createGroup } from "../redux/favourites/favourites";
import { AntDesign } from "@expo/vector-icons";

export default function Favourites({ navigation }: ScreenProps<"Favourites">) {
  const { groups } = useAppSelector((state) => state.favourite);
  const dispatch = useAppDispatch();
  const t = useTranslation();

  return (
    <SafeIOSContainer style={{ marginTop: 0 }}>
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <IconButton icon="chevron-left" onPress={() => navigation.goBack()} size={35} />

        <Text style={{ fontFamily: "Bebas", fontSize: 40, textAlign: "center", width: "70%" }}>{t("favourites.title")}</Text>
      </View>
      <View style={{ padding: 15 }}>
        <FlatList
          data={groups}
          keyExtractor={(k) => k.id}
          renderItem={({ item }) => (
            <TouchableRipple
              rippleColor={"#000"}
              disabled={item?.movies?.length === 0}
              onPress={() => navigation.navigate("Group", { group: item })}
            >
              <>
                <ImageBackground
                  borderRadius={10}
                  blurRadius={10}
                  style={{
                    width: Dimensions.get("window").width - 30,
                    height: Dimensions.get("window").width / 2 - 30,
                    borderRadius: 15,
                    justifyContent: "center",
                    alignItems: "center",
                    margin: 5,
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
                        resizeMode="contain"
                        source={{ uri: "https://image.tmdb.org/t/p/w500" + m.imageUrl }}
                        style={{
                          width: (Dimensions.get("window").width / 2 - 20) * 0.45,
                          height: (Dimensions.get("window").width / 2 - 20) * 0.65,
                          borderRadius: 10,
                        }}
                      />
                    ))}
                  </View>
                </ImageBackground>
                <Text style={{ color: "#fff", fontSize: 25, fontFamily: "Bebas", padding: 10 }}>
                  {item.name} <Text style={{ fontSize: 15 }}>({item.movies.length})</Text>
                </Text>
              </>
            </TouchableRipple>
          )}
        />
      </View>

      <FAB
        style={{ position: "absolute", margin: 16, right: 0, bottom: 25, backgroundColor: MD2DarkTheme.colors.primary }}
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
