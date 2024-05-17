import { View, useWindowDimensions } from "react-native";
import { Movie } from "../../../types";
import Animated, {
  Easing,
  Extrapolation,
  FadeInDown,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Poster from "./Poster";
import { Text } from "react-native-paper";
import { memo } from "react";
import { LinearGradient } from "expo-linear-gradient";
import TabBar from "../Home/TabBar";

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

  const isLeftVisible = useSharedValue(false);
  const isRightVisible = useSharedValue(false);

  const moveGesture = Gesture.Pan()
    .onChange(({ translationX, translationY }) => {
      position.value = {
        x: translationX,
        y: translationY,
      };

      if (position.value.x > 50) {
        isLeftVisible.value = true;
        isRightVisible.value = false;
      } else if (position.value.x < -50) {
        isLeftVisible.value = false;
        isRightVisible.value = true;
      } else {
        isLeftVisible.value = false;
        isRightVisible.value = false;
      }
    })
    .onEnd(() => {
      if (position.value.x > width * 0.4) {
        runOnJS(likeCard)();
        position.value = withSpring(
          { x: width + 100, y: 100 },
          {
            duration: 250,
          }
        );
      } else if (position.value.x < -width * 0.4) {
        runOnJS(removeCard)();
        position.value = withSpring(
          { x: -width - 100, y: 100 },
          {
            duration: 250,
          }
        );
      } else {
        position.value = withSpring({ x: 0, y: 0 });

        isLeftVisible.value = false;
        isRightVisible.value = false;
      }
    })
    .enabled(index === 0);

  const animatedStyle = useAnimatedStyle(() => {
    const rotate = interpolate(
      position.value.x,
      [-width * 0.35, width * 0.35],
      [-10, 10],
      Extrapolation.CLAMP
    );

    return {
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
          translateY: withTiming(index * 10 * -1, {
            duration: 100,
            easing: Easing.ease,
          }),
        },
        {
          scale: withTiming(1 - index * 0.05, {
            duration: 100,
            easing: Easing.ease,
          }),
        },
      ],
    }),
    [index]
  );

  if (index >= 3) return null;

  const dims = {
    width: width * 0.95 - 20,
    height: height * 0.7,
  };

  return (
    <>
      <GestureDetector gesture={gesture}>
        <Animated.View
          style={[animatedStyle, { zIndex: 1000 - index }]}
          entering={FadeInDown.duration(100)}
        >
          <Animated.View style={cardInitialAnimatedStyle}>
            <View
              style={{
                position: "absolute",
                left: width * 0.05,
                backgroundColor: "#000",
                borderRadius: 25,
              }}
            >
              <LinearGradient
                colors={["transparent", "transparent", "rgba(0,0,0,0.9)"]}
                style={[
                  {
                    flex: 1,
                    borderRadius: 19,
                    overflow: "hidden",
                    justifyContent: "flex-end",
                    position: "absolute",
                    zIndex: 10,
                    padding: 10,
                    paddingBottom: 20,
                  },
                  dims,
                ]}
              >
                <Text
                  style={{
                    color: "white",
                    fontSize: 24,
                    paddingHorizontal: 10,
                    fontWeight: "bold",
                  }}
                >
                  {card.title || card.name}
                </Text>
                {card.overview && (
                  <Text
                    style={{
                      color: "rgba(255,255,255,0.7)",
                      paddingHorizontal: 10,
                      marginTop: 5,
                      fontSize: 16,
                    }}
                    numberOfLines={3}
                  >
                    {card.overview}
                  </Text>
                )}

                <Text
                  style={{
                    color: "rgba(255,255,255,0.5)",
                    paddingHorizontal: 10,
                    marginTop: 5,
                  }}
                >
                  {card.release_date || card.first_air_date},{" "}
                  {card.vote_average.toFixed(1)}/10
                </Text>
              </LinearGradient>

              <Poster
                isSwipeable
                isLeftVisible={isLeftVisible}
                isRightVisible={isRightVisible}
                imageDimensions={dims}
                translate={position}
                card={card}
              />
            </View>
          </Animated.View>
        </Animated.View>
      </GestureDetector>

      {index === 0 && (
        <TabBar
          zIndex={length - index}
          likeCard={likeCard}
          removeCard={removeCard}
          openInfo={() => onPress?.()}
        />
      )}
    </>
  );
};

export default memo(SwipeTile);
