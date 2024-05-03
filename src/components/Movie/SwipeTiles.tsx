import { useWindowDimensions } from "react-native";
import { Movie } from "../../../types";
import Animated, {
  Extrapolation,
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
import { Text, useTheme } from "react-native-paper";
import { memo } from "react";
import { LinearGradient } from "expo-linear-gradient";

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

  const cardInitialAnimatedStyle = useAnimatedStyle(
    () => ({
      transform: [
        {
          translateY: withSpring(index * 7.5 * -1),
        },
        {
          scale: withSpring(1 - index * 0.05),
        },
      ],
    }),
    [index]
  );

  if (index > 3) return null;

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View
        style={[animatedStyle]}
        entering={FadeInDown.duration(100)}
      >
        <Animated.View style={cardInitialAnimatedStyle}>
          <Card
            onPress={onPress}
            style={{
              position: "absolute",
              left: width * 0.05,
            }}
          >
            <LinearGradient
              colors={["transparent", "transparent", "rgba(0,0,0,0.7)"]}
              style={{
                flex: 1,
                borderRadius: 19,
                overflow: "hidden",
                width: width * 0.95 - 20,
                height: height * 0.675,
                justifyContent: "flex-end",
                position: "absolute",
                zIndex: 10,
                padding: 10,
                paddingBottom: 20,
              }}
            >
              <Text
                style={{
                  color: "white",
                  fontSize: 20,
                  paddingHorizontal: 10,
                  fontWeight: "bold",
                }}
              >
                {card.title || card.name}
              </Text>
              <Text
                style={{
                  color: "white",
                  paddingHorizontal: 10,
                  fontWeight: "bold",
                  marginTop: 5,
                }}
              >
                {card.release_date || card.first_air_date},{" "}
                {card.vote_average.toFixed(1)}/10
              </Text>
            </LinearGradient>

            <Poster translate={position} card={card} />
          </Card>
        </Animated.View>
      </Animated.View>
    </GestureDetector>
  );
};

export default memo(SwipeTile);
