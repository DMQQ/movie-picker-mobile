import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { memo, useEffect, useRef } from "react";
import { Dimensions, Platform, StyleSheet, View, useWindowDimensions } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { Text } from "react-native-paper";
import Animated, {
  Extrapolation,
  FadeIn,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { Movie } from "../../../types";
import TabBar from "../Home/TabBar";
import RatingIcons from "../RatingIcons";
import Poster from "./Poster";

const { width } = Dimensions.get("screen");

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    left: width * 0.1 - 10,
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
  const position = useSharedValue({ x: 0, y: Math.max(index * -15, -60) });
  const scale = useSharedValue(Math.max(1 - index * 0.075, 0.85));

  useEffect(() => {
    position.value = withTiming({ x: 0, y: Math.max(index * -15, -45) }, { duration: 200 });
    scale.value = withTiming(Math.max(1 - index * 0.075, 0.85), { duration: 200 });
  }, [index]);

  const likeCard = () => {
    setTimeout(() => {
      actions.likeCard();
    }, 200);
  };

  const removeCard = () => {
    setTimeout(() => {
      actions.removeCard();
    }, 200);
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
        position.value = withSpring(
          { x: 0, y: 0 },
          {
            damping: 10,
            stiffness: 150,
          }
        );
        isLeftVisible.value = false;
        isRightVisible.value = false;
      }
    })
    .enabled(index === 0);

  const animatedStyle = useAnimatedStyle(() => {
    const rotate = interpolate(position.value.x, [-width * 0.35, width * 0.35], [-10, 10], Extrapolation.CLAMP);

    return {
      transform: [
        { translateX: position.value.x },
        { translateY: position.value.y },
        { rotate: `${rotate}deg` },
        {
          scale: scale.value,
        },
      ],
      top: withSpring(height * (Platform.OS === "ios" ? 0.075 : 0.09)),
    };
  });

  const isPressed = useRef(false);

  const moveOnPress = (fn: () => any, dir: "left" | "right") => {
    return () => {
      if (isPressed.current) return;
      isPressed.current = true;

      if (dir === "left") {
        position.value = withSpring({ x: -width - 100, y: 100 });
      } else {
        position.value = withSpring({ x: width + 100, y: 100 });
      }
      fn();

      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    };
  };

  if (index >= 3) return null;

  const dims = {
    width: width * 0.9 - 20,
    height: height * 0.65,
  };

  return (
    <>
      <GestureDetector gesture={moveGesture}>
        <Animated.View style={[animatedStyle, { zIndex: 1000 - index }]} entering={index > 1 ? FadeIn : undefined}>
          <View style={styles.container}>
            <LinearGradient colors={["transparent", "rgba(0,0,0,0.2)", "rgba(0,0,0,0.9)"]} style={[styles.gradientContainer, dims]}>
              <Text style={styles.title}>{card.title || card.name}</Text>
              <View style={{ flexDirection: "row", paddingHorizontal: 10, marginTop: 5 }}>
                <RatingIcons size={15} vote={card?.vote_average} />
              </View>
              {card.overview && (
                <Text style={styles.overview} numberOfLines={3}>
                  {card.overview}
                </Text>
              )}

              <Text style={styles.release_date}>
                {card.genres ? `${card?.genres?.map((m) => m.name).join(", ")}` : ""} {"•"} {card.release_date || card.first_air_date}
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
      </GestureDetector>

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
