import { Linking, Pressable, View, ScrollView, Dimensions } from "react-native";
import { useGetTrailersQuery } from "../../redux/movie/movieApi";
import { Text, Chip, Surface, Icon } from "react-native-paper";
import FrostedGlass from "../FrostedGlass";
import AntDesign from "react-native-vector-icons/AntDesign";
import { hexToRgba } from "../../utils/hexToRgb";
import Animated, { FadeInDown } from "react-native-reanimated";

export default function Trailers({ id, type }: { id: number; type: string }) {
  const { data: trailers } = useGetTrailersQuery({ id: id, type: type });

  console.log("Trailers", trailers?.length);

  if (!trailers?.length) return null;

  return (
    <Animated.View
      entering={FadeInDown}
      style={{
        position: "absolute",
        top: -50,
        width: Dimensions.get("window").width - 30,
      }}
    >
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingRight: 16 }}>
        {trailers
          .filter((v) => !(v.site === "Youtube" && v.official))
          .map((trailer, index) => (
            <Animated.View entering={FadeInDown.delay(100 * (index + 1))} key={trailer.key}>
              <FrostedGlass
                style={{
                  borderRadius: 12,
                  backgroundColor: hexToRgba("#FF000", 0.2),
                }}
                container={{ marginRight: 15 }}
              >
                <Pressable
                  onPress={() => {
                    Linking.openURL(`https://www.youtube.com/watch?v=${trailer.key}`);
                  }}
                  style={{
                    padding: 7.5,
                    paddingHorizontal: 15,
                    justifyContent: "center",
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 10,
                  }}
                >
                  <AntDesign name="youtube" size={24} color="#FF0000" />
                  <Text
                    variant="bodyMedium"
                    style={{
                      color: "white",
                      fontWeight: "bold",
                    }}
                    numberOfLines={2}
                  >
                    {trailer.name || "Trailer"}
                  </Text>
                </Pressable>
              </FrostedGlass>
            </Animated.View>
          ))}
      </ScrollView>
    </Animated.View>
  );
}
