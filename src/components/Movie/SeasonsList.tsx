import { FlatList, Image, View } from "react-native";
import { Surface, Text } from "react-native-paper";

const Seasons = ({ seasons }: { seasons: any[] }) => {
  if (seasons?.length === 0 || seasons === undefined) return null;
  return (
    <View style={{ marginTop: 10 }}>
      <Text style={{ fontSize: 20, marginTop: 10 }}>
        Seasons {seasons.length}
      </Text>
      <FlatList
        horizontal
        data={seasons}
        style={{ marginTop: 10, height: 60 + 20 }}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <Surface
            style={{
              padding: 7.5,
              borderRadius: 12.5,
              marginRight: 15,
              flexDirection: "row",
              gap: 10,
              height: 60 + 7.5 * 2,
            }}
          >
            {item.poster_path?.length > 0 && (
              <Image
                style={{
                  width: 60,
                  height: 60,
                  borderRadius: 10,
                }}
                resizeMode="cover"
                source={{
                  uri: "https://image.tmdb.org/t/p/w500" + item.poster_path,
                }}
              />
            )}

            <View>
              <Text style={{ fontSize: 15, textTransform: "uppercase" }}>
                {item.name}
              </Text>
              <Text style={{ color: "#9E9E9E", marginTop: 5 }}>
                Episodes ({item.episode_count})
              </Text>
            </View>
          </Surface>
        )}
      />
    </View>
  );
};
export default Seasons;
