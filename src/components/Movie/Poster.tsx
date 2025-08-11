import { View, useWindowDimensions } from "react-native";
import Animated, { SharedValue, interpolate, interpolateColor, useAnimatedStyle, withTiming } from "react-native-reanimated";
import Thumbnail, { ThumbnailSizes } from "../Thumbnail";

const SwipeText = (props: {
  text: string;
  rotate: string;
  color: string;
  right: boolean;

  isVisible?: SharedValue<boolean>;
}) => {
  const animatedStyle = useAnimatedStyle(() => {
    if (!props.isVisible) return {};

    return {
      opacity: props.isVisible.value ? withTiming(1) : withTiming(0),
    };
  });

  return (
    <Animated.Text
      style={[
        {
          position: "absolute",
          top: props.text === "LIKE" ? 30 : 45,
          zIndex: 10,
          fontWeight: "bold",
          fontSize: 30,

          right: props.right ? 20 : undefined,

          left: props.right ? undefined : 20,

          transform: [{ rotate: props.rotate }],

          borderWidth: 2.5,
          borderColor: props.color,
          paddingHorizontal: 10,

          color: props.color,

          borderRadius: 10,
        },
        animatedStyle,
      ]}
    >
      {props.text}
    </Animated.Text>
  );
};

export default function Poster(props: {
  card: {
    poster_path: string;
    placeholder_poster_path?: string;
  };
  translate?: SharedValue<{
    x: number;
    y: number;
  }>;

  isLeftVisible?: SharedValue<boolean>;

  isRightVisible?: SharedValue<boolean>;

  imageDimensions?: {
    height: number;
    width: number;
  };

  isSwipeable?: boolean;
}) {
  const { height, width } = useWindowDimensions();

  const overlayAnimatedStyle = useAnimatedStyle(() => {
    if (!props.translate) return {};

    return {
      opacity: interpolate(props.translate.value.x, [-width / 2, 0, width / 2], [1, 0, 1]),
      backgroundColor: interpolateColor(
        props.translate.value.x,
        [-width, 0, width],
        ["rgba(255,0,0,0.4)", "rgba(0,0,0,0)", "rgba(0,255,0,0.4)"]
      ),
    };
  });

  const imageDimensions = props?.imageDimensions || {
    height: height * 0.675,
    width: width * 0.95 - 20,
  };

  return (
    <View style={{ position: "relative" }}>
      {props.isSwipeable && (
        <>
          <SwipeText isVisible={props.isRightVisible} text="DISLIKE" color="red" rotate="30deg" right />

          {/* Placed on left   */}
          <SwipeText isVisible={props.isLeftVisible} text="LIKE" color="#24C722" rotate="-30deg" right={false} />
        </>
      )}

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

      <Thumbnail
        path={props.card.poster_path}
        placeholder={props.card.placeholder_poster_path}
        size={ThumbnailSizes.poster.xxlarge}
        container={{ borderRadius: 19, ...imageDimensions }}
        style={{ borderRadius: 19, ...imageDimensions }}
      />
    </View>
  );
}
