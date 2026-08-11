import { LinearGradient } from "expo-linear-gradient";
import Text from "../Text";
import { memo, useEffect } from "react";
import {
  Dimensions,
  Platform,
  Pressable,
  StyleSheet,
  View,
} from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";

import { scheduleOnRN } from "react-native-worklets";
import Animated, {
  Easing,
  Extrapolation,
  interpolate,
  type SharedValue,
  useAnimatedReaction,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { Movie } from "../../../types";
import RatingIcons from "../RatingIcons";
import Poster from "./Poster";
import GenresView from "../GenresView";
import { Link } from "expo-router";
import { colors, fontSize, radius, spacing } from "../../constants/design";

const { width, height } = Dimensions.get("window");

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    left: width * 0.1 - 10,
    backgroundColor: colors.appBackground,
    borderRadius: radius.lg + 1,
    overflow: "hidden",
  },
  gradientContainer: {
    flex: 1,
    borderRadius: radius.modal - 1,
    overflow: "hidden",
    justifyContent: "flex-end",
    position: "absolute",
    zIndex: 10,
    paddingBottom: spacing.xl,
  },
  title: {
    color: colors.text,
    fontSize: 32,
    paddingHorizontal: spacing.sm + 2,
    fontFamily: "Bebas",
  },
  overview: {
    color: "rgba(255,255,255,0.8)",
    paddingHorizontal: spacing.sm + 2,
    marginTop: spacing.xs + 1,
    fontSize: fontSize.lg,
  },
  release_date: {
    color: "rgba(255,255,255,0.6)",
    paddingHorizontal: spacing.sm + 2,
  },
  meta: {
    flexDirection: "row",
    marginTop: spacing.md,
    alignItems: "center",
    gap: spacing.sm - 2,
    flexWrap: "wrap",
    paddingLeft: spacing.sm + 2,
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
  const animIndex = useSharedValue(index);

  useEffect(() => {
    if (index > 0) {
      opacity.value = withTiming(1, { duration: 350 });
    }
  }, []);

  const isLeftVisible = useSharedValue(false);
  const isRightVisible = useSharedValue(false);
  const isSwipingOut = useSharedValue(false);

  // Synchronizes index and prevents positions from leaking when cards shift or re-render
  useAnimatedReaction(
    () => `${index}-${card?.id || card?.title || card?.name || ""}`,
    (current, previous) => {
      if (previous === null || current === previous) return;

      animIndex.value = index;
      isSwipingOut.value = false;

      const targetY = index * -7.5;
      const targetS = 1 - index * 0.05;

      posX.value = 0;
      posY.value = targetY;
      posScale.value = targetS;

      if (index === 0 && dragProgress) {
        dragProgress.value = 0;
      }
    },
  );

  // Programmatic swipe buttons handler
  useAnimatedReaction(
    () => buttonSwipe?.value ?? 0,
    (current, previous) => {
      if (
        index !== 0 ||
        current === 0 ||
        previous === null ||
        current === previous ||
        isSwipingOut.value
      )
        return;

      isSwipingOut.value = true;
      const nudgeCfg = { duration: 80, easing: Easing.out(Easing.quad) };
      const exitCfg = { duration: 300, easing: Easing.out(Easing.cubic) };

      if (dragProgress) {
        dragProgress.value = withTiming(1, {
          duration: 380,
          easing: Easing.out(Easing.cubic),
        });
      }

      if (current === 1 || current === 2) {
        const action =
          (current === 2 ? actions.superLikeCard : actions.likeCard) ??
          actions.likeCard;
        posX.value = withTiming(60, nudgeCfg, () => {
          posX.value = withTiming(width + 200, exitCfg, (finished) => {
            if (finished) {
              if (buttonSwipe) buttonSwipe.value = 0;
              scheduleOnRN(action);
            }
          });
        });
      } else {
        const action =
          (current === -2 ? actions.blockCard : actions.removeCard) ??
          actions.removeCard;
        posX.value = withTiming(-60, nudgeCfg, () => {
          posX.value = withTiming(-width - 200, exitCfg, (finished) => {
            if (finished) {
              if (buttonSwipe) buttonSwipe.value = 0;
              scheduleOnRN(action);
            }
          });
        });
      }
    },
  );

  const moveGesture = Gesture.Pan()
    .onBegin(() => {
      if (isSwipingOut.value) return;
      posY.value = 0;
      posScale.value = withTiming(0.98, { duration: 80 });
    })
    .onChange(({ translationX }) => {
      if (isSwipingOut.value) return;
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
    .onEnd(({ translationX }) => {
      if (isSwipingOut.value) return;
      const exitCfg = { duration: 300, easing: Easing.out(Easing.cubic) };

      if (translationX > width * 0.15) {
        isSwipingOut.value = true;
        if (dragProgress) {
          dragProgress.value = withTiming(1, exitCfg);
        }
        posX.value = withTiming(
          translationX + width + 200,
          exitCfg,
          (finished) => {
            if (finished) {
              scheduleOnRN(actions.likeCard);
            }
          },
        );
        posY.value = withTiming(80, exitCfg);
      } else if (translationX < -width * 0.15) {
        isSwipingOut.value = true;
        if (dragProgress) {
          dragProgress.value = withTiming(1, exitCfg);
        }
        posX.value = withTiming(
          translationX - width - 200,
          exitCfg,
          (finished) => {
            if (finished) {
              scheduleOnRN(actions.removeCard);
            }
          },
        );
        posY.value = withTiming(80, exitCfg);
      } else {
        posX.value = withSpring(0, { damping: 20, stiffness: 300 });
        posY.value = withSpring(0, { damping: 20, stiffness: 300 });
        posScale.value = withSpring(1, { damping: 20, stiffness: 300 });
        if (dragProgress) dragProgress.value = withTiming(0, { duration: 200 });
        isLeftVisible.value = false;
        isRightVisible.value = false;
      }
    });

  const animatedStyle = useAnimatedStyle(() => {
    const idx = animIndex.value;
    const rotate = interpolate(
      posX.value,
      [-width * 0.35, width * 0.35],
      [-10, 10],
      Extrapolation.CLAMP,
    );

    const progress = dragProgress?.value ?? 0;
    const isTop = idx === 0;

    const dragAdjustY = isTop ? 0 : Math.min(progress, 1) * 7.5;
    const dragAdjustScale = isTop ? 0 : Math.min(progress, 1) * 0.05;

    const currentPosY = isTop ? posY.value : idx * -7.5;
    const currentScale = isTop ? posScale.value : 1 - idx * 0.05;

    return {
      transform: [
        { translateX: posX.value },
        { translateY: currentPosY + dragAdjustY },
        { rotate: `${rotate}deg` },
        { scale: currentScale + dragAdjustScale },
      ],
      top: CARD_TOP,
      opacity: opacity.value,
    };
  });

  return (
    <Animated.View
      style={[animatedStyle, { zIndex: 1000 - index }]}
      pointerEvents={index === 0 ? "auto" : "none"}
    >
      <GestureDetector gesture={moveGesture}>
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
      </GestureDetector>
    </Animated.View>
  );
};

export default memo(SwipeTile);
