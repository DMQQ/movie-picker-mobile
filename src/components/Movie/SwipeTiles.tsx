import { useWindowDimensions } from "react-native";
import { Movie } from "../../../types";
import Animated, {
  Extrapolation,
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

const SwipeTile = ({
  card,
  index,
  likeCard,
  removeCard,
  length,
}: {
  card: Movie;
  index: number;
  likeCard: () => void;
  removeCard: () => void;
  length: number;
}) => {
  const { width, height } = useWindowDimensions();
  const position = useSharedValue({ x: 0, y: 0 });

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
      }
    });

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
    };
  }, []);

  return (
    <GestureDetector gesture={moveGesture}>
      <Animated.View style={[animatedStyle]}>
        <Card
          style={{
            position: "absolute",
            left: width * 0.05,
            top: height * 0.15,
            transform: [
              { translateY: index * 30 },
              {
                scale: 1 - index * 0.05,
              },
            ],
          }}
        >
          <Poster translate={position} card={card} />

          <Content {...card} />
        </Card>
      </Animated.View>
    </GestureDetector>
  );
};

export default SwipeTile;
