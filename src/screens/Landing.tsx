import { Dimensions, Image, View } from "react-native";
import { Button, Text } from "react-native-paper";
import useFetch from "../service/useFetch";
import Animated from "react-native-reanimated";

const { width, height } = Dimensions.get("screen");

export default function Landing({ navigation }: any) {
  const { data } = useFetch("/landing");

  const tileWidth = width * 0.7; // Width of each tile
  const margin = 30; // Margin between each tile
  const totalTileWidth = tileWidth + margin;

  // Calculate the snap offsets
  const snapOffsets = [...Array(data?.length || 0).keys()].map(
    (i) => i * totalTileWidth
  );

  return (
    <View style={{ flex: 1 }}>
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 24, fontWeight: "bold", padding: 15 }}>
          Welcome!
        </Text>

        <Animated.FlatList
          data={data || []}
          horizontal
          pagingEnabled
          keyExtractor={(item) => item.id.toString()}
          style={{
            flex: 1,
          }}
          contentContainerStyle={{
            justifyContent: "center",
            alignItems: "center",
          }}
          snapToOffsets={snapOffsets}
          renderItem={({ item }) => (
            <Image
              key={item.id}
              style={{
                width: width * 0.7,
                height: height * 0.65,
                borderRadius: 20,
                margin: 15,
              }}
              source={{
                uri: "https://image.tmdb.org/t/p/w500" + item.poster_path,
              }}
            />
          )}
        />
      </View>

      <View style={{ justifyContent: "flex-end", padding: 15 }}>
        <Button
          mode="contained-tonal"
          onPress={() => navigation.navigate("QRScanner")}
          style={{ marginTop: 15, borderRadius: 100, marginBottom: 15 }}
          contentStyle={{ padding: 7.5 }}
        >
          Join Room
        </Button>

        <Button
          mode="contained"
          onPress={() => navigation.navigate("QRCode")}
          style={{ borderRadius: 100 }}
          contentStyle={{ padding: 7.5 }}
        >
          Create Room
        </Button>
      </View>
    </View>
  );
}
