import { Dimensions, View } from "react-native";
import ScratchCard from "../../components/ScratchCard";
import { MD2DarkTheme } from "react-native-paper";
import Animated, { FadeIn, FadeInDown, FadeOut, FadeOutDown, SlideInDown, SlideOutDown } from "react-native-reanimated";

export default function Modal({ match }: any) {
  return (
    <Animated.View
      entering={FadeInDown}
      exiting={FadeOutDown}
      style={{
        ...Dimensions.get("window"),
        backgroundColor: "rgba(0, 0, 0, 0.9)",
        alignItems: "center",
        position: "absolute",
        top: 0,
        left: 0,
      }}
    >
      <View style={{ borderWidth: 2, borderColor: MD2DarkTheme.colors.primary, borderRadius: 15, marginTop: 50 }}>
        <ScratchCard
          imageUrl={`https://image.tmdb.org/t/p/w500${match.poster_path}`}
          style={{ width: Dimensions.get("screen").width - 30 - 15, height: Dimensions.get("window").height / 1.5 - 50 }}
        />
      </View>
    </Animated.View>
  );
}
