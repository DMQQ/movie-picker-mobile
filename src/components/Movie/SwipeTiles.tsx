import { useWindowDimensions } from "react-native";
import { Movie } from "../../../types";
import Animated, {
  Extrapolation,
  FadeIn,
  FadeInDown,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Card from "./Card";
import Poster from "./Poster";
import Content from "./Content";
import { TouchableRipple, useTheme } from "react-native-paper";
import { memo } from "react";

const SwipeTile = ({
  card,
  index,
  likeCard,
  removeCard,
  length,
  onPress,
}: {
  card: Movie;
  index: number;
  likeCard: () => void;
  removeCard: () => void;
  length: number;
  onPress?: () => void;
}) => {
  const { width, height } = useWindowDimensions();
  const position = useSharedValue({ x: 0, y: 0 });
  const theme = useTheme();

  const moveGesture = Gesture.Pan()
    .onChange(({ translationX, translationY }) => {
      position.value = {
        x: translationX,
        y: translationY,
      };
    })
    .onEnd(() => {
      position.value = withSpring({ x: 0, y: 0 });

      if (position.value.x > width * 0.35) {
        position.value = withSpring(
          { x: width + 100, y: 100 },
          {
            duration: 250,
          }
        );

        runOnJS(likeCard)();
      } else if (position.value.x < -width * 0.35) {
        position.value = withSpring(
          { x: -width - 100, y: 100 },
          {
            duration: 250,
          }
        );

        runOnJS(removeCard)();
      } else if (position.value.y < -height * 0.35) {
        if (onPress) runOnJS(onPress)();
      }
    })
    .enabled(index === 0);

  const animatedStyle = useAnimatedStyle(() => {
    const rotate = interpolate(
      position.value.x,
      [-width * 0.3, width * 0.3],
      [-10, 10],
      Extrapolation.CLAMP
    );

    return {
      zIndex: length - index,
      transform: [
        { translateX: position.value.x },
        { translateY: position.value.y },
        { rotate: `${rotate}deg` },
      ],
      top: withSpring(height * 0.1, { duration: 250 }),
    };
  }, []);

  const gesture = moveGesture;

  // const cardInitialAnimatedStyle = useAnimatedStyle(
  //   () => ({
  //     transform: [
  //       { translateY: index * 15 },
  //       {
  //         scale: 1 - index * 0.035,
  //       },
  //     ],
  //   }),
  //   [index]
  // );

  if (index > 0) return null;

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View
        style={[animatedStyle]}
        entering={FadeInDown.duration(100)}
      >
        <Animated.View
        // style={cardInitialAnimatedStyle}
        >
          <Card
            style={{
              position: "absolute",
              left: width * 0.05,
            }}
          >
            <TouchableRipple onPress={onPress}>
              <Poster translate={position} card={card} />
            </TouchableRipple>

            <Content theme={theme} {...card} />
          </Card>
        </Animated.View>
      </Animated.View>
    </GestureDetector>
  );
};

export default memo(SwipeTile);
