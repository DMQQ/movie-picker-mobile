import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { memo, useCallback, useEffect, useRef } from "react";
import { Dimensions, Platform, Pressable, StyleSheet, View, useWindowDimensions } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { Text } from "react-native-paper";
import Animated, {
  Extrapolation,
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
import useTranslation from "../../service/useTranslation";
import GenresView from "../GenresView";

const { width, height } = Dimensions.get("window");

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
    paddingBottom: 20,
  },
  title: {
    color: "white",
    fontSize: 32,
    paddingHorizontal: 10,
    fontFamily: "Bebas",
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
  },
  meta: { flexDirection: "row", marginTop: 12, alignItems: "center", gap: 6, flexWrap: "wrap", paddingLeft: 10 },

  card: {
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
  },
});

const dims = {
  width: width * 0.9 - 20,
  height: height * 0.65,
};

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
  blockCard?: () => void;
  superLikeCard?: () => void;
  length: number;
  onPress: () => void;
}) => {
  const t = useTranslation();
  const position = useSharedValue({ x: 0, y: index * -7.5, scale: 1 - index * 0.05 });

  useEffect(() => {
    position.value = withTiming({ x: 0, y: index * -7.5, scale: 1 - index * 0.05 }, { duration: 250 });
  }, [index]);

  const isLeftVisible = useSharedValue(false);
  const isRightVisible = useSharedValue(false);

  const moveGesture = Gesture.Pan()
    .onChange(({ translationX }) => {
      position.value = {
        x: translationX,
        y: 0,
        scale: 1,
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
      if (position.value.x > width * 0.15) {
        position.value = withSpring({ x: width + 100, y: 100, scale: 1 });
        setTimeout(() => {
          "worklet";
          runOnJS(actions.likeCard)();
        }, 100);
      } else if (position.value.x < -width * 0.15) {
        position.value = withSpring({ x: -width - 100, y: 100, scale: 1 });
        setTimeout(() => {
          "worklet";
          runOnJS(actions.removeCard)();
        }, 100);
      } else {
        position.value = withSpring(
          { x: 0, y: 0, scale: 1 },
          {
            damping: 50,
            stiffness: 500,
          },
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
        { scale: position.value.scale },
      ],
      top: height * (Platform.OS === "ios" ? 0.075 : 0.09),
    };
  });

  const isPressed = useRef(false);
  const timeoutIds = useRef<NodeJS.Timeout[]>([]);

  // Cleanup timeouts on unmount to prevent memory leaks
  useEffect(() => {
    return () => {
      timeoutIds.current.forEach(clearTimeout);
    };
  }, []);

  const likeCard = () => {
    const id = setTimeout(() => {
      actions.likeCard();
    }, 200);
    timeoutIds.current.push(id);
  };

  const removeCard = () => {
    const id = setTimeout(() => {
      actions.removeCard();
    }, 200);
    timeoutIds.current.push(id);
  };

  const blockCard = () => {
    const id = setTimeout(() => {
      actions.blockCard?.();
    }, 200);
    timeoutIds.current.push(id);
  };

  const superLikeCard = () => {
    const id = setTimeout(() => {
      actions.superLikeCard?.();
    }, 200);
    timeoutIds.current.push(id);
  };

  const moveOnPress = useCallback((fn: () => any, dir: "left" | "right") => {
    return () => {
      if (isPressed.current) return;
      isPressed.current = true;

      if (dir === "left") {
        position.value = withSpring({ x: -width - 100, y: 100, scale: 1 });
      } else {
        position.value = withSpring({ x: width + 100, y: 100, scale: 1 });
      }
      fn();

      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    };
  }, []);

  return (
    <>
      <GestureDetector gesture={moveGesture}>
        <Animated.View style={[animatedStyle, { zIndex: 1000 - index }]}>
          <Pressable onPress={onPress} style={[styles.container, styles.card]}>
            <LinearGradient
              colors={["transparent", "transparent", "rgba(0,0,0,0.4)", "rgba(0,0,0,1)"]}
              style={[styles.gradientContainer, dims]}
            >
              <Text style={styles.title}>{card.title || card.name}</Text>
              <View
                style={{
                  flexDirection: "row",
                  paddingHorizontal: 10,
                }}
              >
                <RatingIcons size={15} vote={card?.vote_average} />
              </View>
              {card.overview && (
                <Text style={styles.overview} numberOfLines={3}>
                  {card.overview}
                </Text>
              )}

              <View style={styles.meta}>
                {card.genres ? <GenresView genres={card.genres.slice(0, 3)} /> : null}
                <Text style={styles.release_date}>{card.release_date || card.first_air_date}</Text>
              </View>
            </LinearGradient>

            <Poster
              isSwipeable
              isLeftVisible={isLeftVisible}
              isRightVisible={isRightVisible}
              imageDimensions={dims}
              translate={position}
              card={card}
            />
          </Pressable>
        </Animated.View>
      </GestureDetector>

      {index === 0 && (
        <TabBar
          zIndex={length - index}
          likeCard={moveOnPress(likeCard, "right")}
          removeCard={moveOnPress(removeCard, "left")}
          openInfo={onPress}
          blockCard={actions.blockCard ? moveOnPress(blockCard, "left") : undefined}
          superLikeCard={actions.superLikeCard ? moveOnPress(superLikeCard, "right") : undefined}
          labels={{
            block: t("swipe.block") as string,
            dislike: t("swipe.nope") as string,
            like: t("swipe.like") as string,
            superLike: t("swipe.super") as string,
          }}
        />
      )}
    </>
  );
};

export default memo(SwipeTile);
