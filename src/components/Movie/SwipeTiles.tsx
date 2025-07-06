import { Dimensions, StyleSheet, View, useWindowDimensions, Platform } from "react-native";
import { Movie } from "../../../types";
import Animated, { Extrapolation, interpolate, runOnJS, useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Poster from "./Poster";
import { Text } from "react-native-paper";
import { memo } from "react";
import { LinearGradient } from "expo-linear-gradient";
import TabBar from "../Home/TabBar";
import * as Haptics from "expo-haptics";
import { getConstrainedDimensions } from "../../utils/getConstrainedDimensions";

const { width } = getConstrainedDimensions("screen");

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    left: width * 0.05,
    backgroundColor: "#000",
    borderRadius: 25,
    overflow: "hidden",
  },
  gradientContainer: {
    flex: 1,
    borderRadius: 19,
    overflow: "hidden",
    justifyContent: "flex-end",
    position: "absolute",
    zIndex: 10,
    padding: 10,
    paddingBottom: 20,
  },
  title: {
    color: "white",
    fontSize: 24,
    paddingHorizontal: 10,
    fontWeight: "bold",
  },
  overview: {
    color: "rgba(255,255,255,0.8)",
    paddingHorizontal: 10,
    marginTop: 5,
    fontSize: 16,
  },
  release_date: {
    color: "rgba(255,255,255,0.6)",
    paddingHorizontal: 10,
    marginTop: 5,
  },
});

const SwipeTile = ({
  card,
  index,
  length,
  onPress,
  ...actions
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

  const likeCard = () => {
    setTimeout(() => {
      actions.likeCard();
    }, 500);
  };

  const removeCard = () => {
    setTimeout(() => {
      actions.removeCard();
    }, 500);
  };

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
      if (position.value.x > width * 0.25) {
        runOnJS(likeCard)();
        position.value = withSpring({ x: width + 100, y: 100 });
      } else if (position.value.x < -width * 0.25) {
        runOnJS(removeCard)();
        position.value = withSpring({ x: -width - 100, y: 100 });
      } else {
        position.value = withSpring({ x: 0, y: 0 });
        isLeftVisible.value = false;
        isRightVisible.value = false;
      }
    })
    .enabled(index === 0 && Platform.OS !== "web");

  const webTouchHandlers =
    Platform.OS === "web" && index === 0
      ? {
          onTouchStart: (e: any) => {
            const startX = e.touches[0].clientX;
            const startY = e.touches[0].clientY;

            const handleTouchMove = (moveEvent: TouchEvent) => {
              if (moveEvent.cancelable) {
                moveEvent.preventDefault();
              }

              if (moveEvent.touches.length > 0) {
                const deltaX = moveEvent.touches[0].clientX - startX;
                const deltaY = moveEvent.touches[0].clientY - startY;

                position.value = { x: deltaX, y: deltaY };

                if (deltaX > 50) {
                  isLeftVisible.value = true;
                  isRightVisible.value = false;
                } else if (deltaX < -50) {
                  isLeftVisible.value = false;
                  isRightVisible.value = true;
                } else {
                  isLeftVisible.value = false;
                  isRightVisible.value = false;
                }
              }
            };

            const handleTouchEnd = () => {
              const currentX = position.value.x;

              if (currentX > width * 0.25) {
                likeCard();
                position.value = withSpring({ x: width + 100, y: 100 });
              } else if (currentX < -width * 0.25) {
                removeCard();
                position.value = withSpring({ x: -width - 100, y: 100 });
              } else {
                position.value = withSpring({ x: 0, y: 0 });
                isLeftVisible.value = false;
                isRightVisible.value = false;
              }

              document.removeEventListener("touchmove", handleTouchMove);
              document.removeEventListener("touchend", handleTouchEnd);
            };

            document.addEventListener("touchmove", handleTouchMove);
            document.addEventListener("touchend", handleTouchEnd);
          },
        }
      : {};

  const animatedStyle = useAnimatedStyle(() => {
    const rotate = interpolate(position.value.x, [-width * 0.35, width * 0.35], [-10, 10], Extrapolation.CLAMP);

    return {
      transform: [{ translateX: position.value.x }, { translateY: position.value.y }, { rotate: `${rotate}deg` }],
      top: withSpring(height * 0.05),
    };
  }, []);

  const moveOnPress = (fn: () => any, dir: "left" | "right") => {
    return () => {
      if (dir === "left") {
        position.value = withSpring({ x: -width - 100, y: 100 });
      } else {
        position.value = withSpring({ x: width + 100, y: 100 });
      }
      fn();

      if (Platform.OS !== "web") {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    };
  };

  if (index >= 3) return null;

  const dims = {
    width: width * 0.95 - 20,
    height: height * 0.7,
  };

  const AnimatedCard = (
    <Animated.View style={[animatedStyle, { zIndex: 1000 - index }]} {...webTouchHandlers}>
      <View style={styles.container}>
        <LinearGradient colors={["transparent", "transparent", "rgba(0,0,0,0.9)"]} style={[styles.gradientContainer, dims]}>
          <Text style={styles.title}>{card.title || card.name}</Text>
          {card.overview && (
            <Text style={styles.overview} numberOfLines={3}>
              {card.overview}
            </Text>
          )}
          <Text style={styles.release_date}>
            {card.release_date || card.first_air_date}, {card.vote_average.toFixed(1)}/10
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
  );

  return (
    <>
      {Platform.OS === "web" ? AnimatedCard : <GestureDetector gesture={moveGesture}>{AnimatedCard}</GestureDetector>}

      {index === 0 && (
        <TabBar
          zIndex={length - index}
          likeCard={moveOnPress(likeCard, "right")}
          removeCard={moveOnPress(removeCard, "left")}
          openInfo={() => onPress?.()}
        />
      )}
    </>
  );
};

export default memo(SwipeTile);
