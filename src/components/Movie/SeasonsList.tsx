import { FlatList, Image, View } from "react-native";
import { Surface, Text } from "react-native-paper";
import useTranslation from "../../service/useTranslation";

const Seasons = ({ seasons }: { seasons: any[] }) => {
  const t = useTranslation();
  if (seasons?.length === 0 || seasons === undefined) return null;
  return (
    <View style={{ marginTop: 15 }}>
      <Text style={{ fontSize: 35, marginBottom: 10, fontFamily: "Bebas" }}>
        {t("movie.details.season")} {seasons.length}
      </Text>
      <FlatList
        showsHorizontalScrollIndicator={false}
        horizontal
        data={seasons}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <Surface
            style={{
              borderRadius: 12.5,
              marginRight: 15,
              flexDirection: "row",
              gap: 10,
              backgroundColor: "#000",
            }}
          >
            {item.poster_path?.length > 0 && (
              <Image
                style={{
                  width: 50,
                  height: 80,
                  borderRadius: 10,
                }}
                resizeMode="contain"
                source={{
                  uri: "https://image.tmdb.org/t/p/w500" + item.poster_path,
                }}
              />
            )}

            <View style={{ flex: 1, justifyContent: "center", alignItems: "flex-start", padding: 10 }}>
              <Text style={{ fontSize: 20, fontFamily: "Bebas" }}>{item.name}</Text>
              <Text style={{ color: "#9E9E9E", marginTop: 5 }}>
                {t("movie.details.episode")} ({item.episode_count})
              </Text>
            </View>
          </Surface>
        )}
      />
    </View>
  );
};
export default Seasons;
