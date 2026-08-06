import { LinearGradient } from "expo-linear-gradient";
import { memo, useEffect, useRef } from "react";
import {
  Dimensions,
  Platform,
  Pressable,
  StyleSheet,
  View,
  useWindowDimensions,
} from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { Text } from "react-native-paper";
import Animated, {
  Easing,
  Extrapolation,
  interpolate,
  runOnJS,
  type SharedValue,
  useAnimatedReaction,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { Movie } from "../../../types";
import RatingIcons from "../RatingIcons";
import Poster from "./Poster";
import GenresView from "../GenresView";
import { Link } from "expo-router";

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
    paddingHorizontal: spacing.sm + 2,
    fontFamily: "Bebas",
  },
  overview: {
    color: "rgba(255,255,255,0.8)",
    paddingHorizontal: spacing.sm + 2,
    marginTop: 5,
    fontSize: fontSize.lg,
  },
  release_date: {
    color: "rgba(255,255,255,0.6)",
    paddingHorizontal: spacing.sm + 2,
  },
  meta: {
    flexDirection: "row",
    marginTop: 12,
    alignItems: "center",
    gap: spacing.sm - 2,
    flexWrap: "wrap",
    paddingLeft: 10,
  },

  card: {
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
  },
});

const dims = {
  width: width * 0.9 - 20,
  height: height * 0.65,
};

const CARD_TOP = height * (Platform.OS === "ios" ? 0.055 : 0.075);

const SwipeTile = ({
  card,
  index,
  length,
  href,
  dragProgress,
  buttonSwipe,

  ...actions
}: {
  card: Movie;
  index: number;
  likeCard: () => void;
  removeCard: () => void;
  blockCard?: () => void;
  superLikeCard?: () => void;
  length: number;
  href: any;
  dragProgress?: SharedValue<number>;
  buttonSwipe?: SharedValue<number>;
}) => {
  const posX = useSharedValue(0);
  const posY = useSharedValue(index * -7.5);
  const posScale = useSharedValue(1 - index * 0.05);
  const opacity = useSharedValue(index > 0 ? 0 : 1);
  const prevIndex = useRef(index);

  useEffect(() => {
    if (index > 0) {
      opacity.value = withTiming(1, { duration: 350 });
    }
  }, []);

  const dragSnapshot = dragProgress?.value ?? 0;

  useEffect(() => {
    const oldIndex = prevIndex.current;
    prevIndex.current = index;

    if (dragSnapshot > 0 && oldIndex !== index) {
      const oldDragY = oldIndex > 0 ? Math.min(dragSnapshot, 1) * 7.5 : 0;
      const oldDragS = oldIndex > 0 ? Math.min(dragSnapshot, 1) * 0.05 : 0;
      const visualY = posY.value + oldDragY;
      const visualS = posScale.value + oldDragS;
      const targetY = index * -7.5;
      const targetS = 1 - index * 0.05;

      posX.value = 0;
      posY.value = visualY;
      posScale.value = visualS;

      if (
        Math.abs(visualY - targetY) > 0.5 ||
        Math.abs(visualS - targetS) > 0.01
      ) {
        const cfg = { mass: 0.3, damping: 10, stiffness: 200 };
        posY.value = withSpring(targetY, cfg);
        posScale.value = withSpring(targetS, cfg);
      }

      if (dragProgress && index === 0) {
        dragProgress.value = 0;
      }
      return;
    }

    const cfg = { mass: 0.3, damping: 10, stiffness: 200 };
    posX.value = withSpring(0, cfg);
    posY.value = withSpring(index * -7.5, cfg);
    posScale.value = withSpring(1 - index * 0.05, cfg);
  }, [index, dragSnapshot]);

  useAnimatedReaction(
    () => buttonSwipe?.value ?? 0,
    (current, previous) => {
      if (
        index !== 0 ||
        current === 0 ||
        previous === null ||
        current === previous
      )
        return;
      const nudgeCfg = { duration: 80, easing: Easing.out(Easing.quad) };
      const exitCfg = { duration: 420, easing: Easing.out(Easing.cubic) };
      if (current === 1 || current === 2) {
        posX.value = withSequence(
          withTiming(60, nudgeCfg),
          withTiming(width + 200, exitCfg),
        );
        posY.value = withSequence(
          withTiming(0, nudgeCfg),
          withTiming(80, exitCfg),
        );
      } else {
        posX.value = withSequence(
          withTiming(-60, nudgeCfg),
          withTiming(-width - 200, exitCfg),
        );
        posY.value = withSequence(
          withTiming(0, nudgeCfg),
          withTiming(80, exitCfg),
        );
      }
      if (buttonSwipe) buttonSwipe.value = 0;
    },
  );

  const isLeftVisible = useSharedValue(false);
  const isRightVisible = useSharedValue(false);

  const moveGesture = Gesture.Pan()
    .onBegin(() => {
      posY.value = 0;
      posScale.value = 1;
    })
    .onChange(({ translationX }) => {
      posX.value = translationX;
      if (dragProgress) {
        dragProgress.value = Math.min(
          Math.abs(translationX) / (width * 0.15),
          1,
        );
      }

      const nextLeft = translationX > 50;
      const nextRight = translationX < -50;
      if (isLeftVisible.value !== nextLeft) isLeftVisible.value = nextLeft;
      if (isRightVisible.value !== nextRight) isRightVisible.value = nextRight;
    })
    .onEnd(() => {
      const exitCfg = { duration: 420, easing: Easing.out(Easing.cubic) };
      if (posX.value > width * 0.15) {
        posX.value = withTiming(width + 200, exitCfg, (finished) => {
          if (finished) runOnJS(actions.likeCard)();
        });
        posY.value = withTiming(80, exitCfg);
        if (dragProgress) dragProgress.value = 1;
      } else if (posX.value < -width * 0.15) {
        posX.value = withTiming(-width - 200, exitCfg, (finished) => {
          if (finished) runOnJS(actions.removeCard)();
        });
        posY.value = withTiming(80, exitCfg);
        if (dragProgress) dragProgress.value = 1;
      } else {
        posX.value = withSpring(0, { damping: 50, stiffness: 500 });
        posY.value = withSpring(0, { damping: 50, stiffness: 500 });
        posScale.value = withSpring(1, { damping: 50, stiffness: 500 });
        if (dragProgress) dragProgress.value = withTiming(0, { duration: 200 });
        isLeftVisible.value = false;
        isRightVisible.value = false;
      }
    })
    .enabled(index === 0);

  const animatedStyle = useAnimatedStyle(() => {
    const rotate = interpolate(
      posX.value,
      [-width * 0.35, width * 0.35],
      [-10, 10],
      Extrapolation.CLAMP,
    );

    const progress = dragProgress?.value ?? 0;
    const dragAdjustY = index > 0 ? Math.min(progress, 1) * 7.5 : 0;
    const dragAdjustScale = index > 0 ? Math.min(progress, 1) * 0.05 : 0;

    return {
      transform: [
        { translateX: posX.value },
        { translateY: posY.value + dragAdjustY },
        { rotate: `${rotate}deg` },
        { scale: posScale.value + dragAdjustScale },
      ],
      top: CARD_TOP,
      opacity: opacity.value,
    };
  });

  return (
    <GestureDetector gesture={moveGesture}>
      <Animated.View
        style={[animatedStyle, { zIndex: 1000 - index }]}
        pointerEvents={index === 0 ? "auto" : "none"}
      >
        <Link asChild href={href}>
          <Pressable
            style={StyleSheet.flatten([styles.container, styles.card])}
          >
            <LinearGradient
              colors={[
                "transparent",
                "transparent",
                "rgba(0,0,0,0.4)",
                "rgba(0,0,0,1)",
              ]}
              style={[styles.gradientContainer, dims]}
            >
              <Text style={styles.title}>{card?.title || card?.name}</Text>
              <View
                style={{
                  flexDirection: "row",
                  paddingHorizontal: spacing.sm + 2,
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
                {card.genres ? (
                  <GenresView genres={card.genres.slice(0, 3)} />
                ) : null}
                <Text style={styles.release_date}>
                  {card.release_date || card.first_air_date}
                </Text>
              </View>
            </LinearGradient>

            <Poster
              link
              isSwipeable
              isLeftVisible={isLeftVisible}
              isRightVisible={isRightVisible}
              imageDimensions={dims}
              translateX={posX}
              card={card}
            />
          </Pressable>
        </Link>
      </Animated.View>
    </GestureDetector>
  );
};

export default memo(SwipeTile);
