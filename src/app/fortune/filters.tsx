import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useGetCategoriesQuery } from "../../redux/movie/movieApi";
import { Dimensions, FlatList, View, ImageBackground } from "react-native";
import { IconButton, MD2DarkTheme, Text, TouchableRipple } from "react-native-paper";
import { router } from "expo-router";

const SectionSelector = ({ navigation }: any) => {
  const { data, error } = useGetCategoriesQuery({});

  const insets = useSafeAreaInsets();

  return (
    <View style={{ flex: 1, paddingTop: insets.top, backgroundColor: "#000" }}>
      <View style={{ backgroundColor: "#000", justifyContent: "space-between", zIndex: 999 }}>
        <IconButton icon="chevron-left" onPress={() => router.back()} size={28} />
      </View>
      <FlatList
        numColumns={2}
        data={data}
        contentContainerStyle={{ gap: 10, padding: 10, paddingBottom: 50 }}
        style={{ flex: 1 }}
        renderItem={({ item }) => (
          <TouchableRipple
            onPress={() => {
              router.back();

              router.setParams({ category: item.name });
            }}
            style={{
              marginRight: 10,
              width: Dimensions.get("window").width / 2 - 15,
              backgroundColor: MD2DarkTheme.colors.surface,
              height: 100,
            }}
          >
            <ImageBackground
              blurRadius={10}
              source={{
                uri: "https://image.tmdb.org/t/p/w200" + item.results[0].poster_path,
              }}
              style={{
                width: "100%",
                height: "100%",
                justifyContent: "center",
                alignItems: "center",
              }}
              borderRadius={10}
            >
              <Text
                style={{
                  fontSize: 25,
                  fontFamily: "Bebas",
                  color: "#fff",
                  textShadowColor: "rgba(0, 0, 0, 0.75)",
                  textShadowOffset: { width: 0, height: 1 },
                  textShadowRadius: 5,
                  textAlign: "center",
                  padding: 5,
                }}
              >
                {item.name}
              </Text>
            </ImageBackground>
          </TouchableRipple>
        )}
        keyExtractor={(item) => item.name}
      />
    </View>
  );
};

export default SectionSelector;
