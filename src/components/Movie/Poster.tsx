import { Image, View, useWindowDimensions } from "react-native";
import Animated, {
  useAnimatedStyle,
  SharedValue,
  interpolate,
  interpolateColor,
  SharedTransition,
} from "react-native-reanimated";
import { sharedElementTransition } from "../../service/utils/SharedElementTransition";

export default function Poster(props: {
  card: {
    poster_path: string;
  };
  translate?: SharedValue<{
    x: number;
    y: number;
  }>;

  imageDimensions?: {
    height: number;
    width: number;
  };
}) {
  const { height, width } = useWindowDimensions();

  const overlayAnimatedStyle = useAnimatedStyle(() => {
    if (!props.translate) return {};

    return {
      opacity: interpolate(
        props.translate.value.x,
        [-width / 2, 0, width / 2],
        [1, 0, 1]
      ),
      backgroundColor: interpolateColor(
        props.translate.value.x,
        [-width, 0, width],
        ["red", "rgba(0,0,0,0)", "green"]
      ),
    };
  });

  const imageDimensions = props?.imageDimensions || {
    height: height * 0.675,
    width: width * 0.95 - 20,
  };

  return (
    <View style={{ position: "relative" }}>
      <Animated.View
        style={[
          {
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            borderRadius: 19,
            zIndex: 1,
            opacity: 0,
            ...imageDimensions,
          },
          overlayAnimatedStyle,
        ]}
      />
      <Animated.Image
        // sharedTransitionStyle={sharedElementTransition}
        // sharedTransitionTag={"movie-poster-image-" + props.card.poster_path}
        style={{
          ...imageDimensions,
          borderRadius: 19,
        }}
        //resizeMode="cover"
        resizeMode="cover"
        resizeMethod="resize"
        source={{
          uri: "https://image.tmdb.org/t/p/w500" + props.card.poster_path,
        }}
      />
    </View>
  );
}
