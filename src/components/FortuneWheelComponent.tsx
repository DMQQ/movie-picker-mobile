import React, { forwardRef, memo, useEffect, useImperativeHandle } from "react";
import { View, StyleSheet, Image, Dimensions, ImageBackground, Vibration, StyleProp, ViewStyle } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
  runOnJS,
  clamp,
  SlideInDown,
  SlideOutDown,
  useAnimatedReaction,
} from "react-native-reanimated";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { MD2DarkTheme } from "react-native-paper";
import useTranslation from "../service/useTranslation";
import * as Haptics from "expo-haptics";

const { width, height } = Dimensions.get("window");

const Wheel = forwardRef<
  any,
  {
    size?: number;
    items: { image: any }[];
    onSelectedItem?: (item: any) => void;
    onSpinStart?: () => void;
    style: StyleProp<ViewStyle>;
  }
>(({ size = 300, items, style, onSelectedItem, onSpinStart }, ref) => {
  const segmentAngle = 360 / items.length;
  const rotate = useSharedValue(0);
  const isSpinning = useSharedValue(false);
  const translateY = useSharedValue(0);
  const lastHapticSegment = useSharedValue(-1);
  const lastHapticTime = useSharedValue(0);

  const t = useTranslation();

  const triggerItemHaptic = () => {
    // Use selectionAsync for a more premium feel than impact
    Haptics.selectionAsync();
  };

  useAnimatedReaction(
    () => rotate.value,
    (currentRotation) => {
      if (!isSpinning.value) return;

      const normalizedRotation = ((currentRotation % 360) + 360) % 360;
      const invertedAngle = (360 - normalizedRotation) % 360;
      const segmentCenter = Math.floor(invertedAngle / segmentAngle);
      const centerAngle = segmentCenter * segmentAngle + segmentAngle / 2;
      const distanceFromCenter = Math.abs(invertedAngle - centerAngle);

      // Only trigger if we're at the center and enough time has passed since last haptic
      if (distanceFromCenter < 5 && segmentCenter !== lastHapticSegment.value) {
        const currentTime = Date.now();
        if (currentTime - lastHapticTime.value > 100) {
          // Minimum 100ms between haptics
          lastHapticTime.value = currentTime;
          lastHapticSegment.value = segmentCenter;
          const rotationDelta = Math.abs(currentRotation - rotate.value);
          if (rotationDelta < 50) {
            runOnJS(triggerItemHaptic)();
          }
        }
      }
    }
  );

  const handleSpin = (velocity: number) => {
    if (isSpinning.value) return;

    if (onSpinStart) {
      runOnJS(onSpinStart)();
    }

    isSpinning.value = true;
    lastHapticSegment.value = -1;
    lastHapticTime.value = 0;

    // Initial spin feedback
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

    const rotations = Math.min(Math.max(Math.abs(velocity / 500), 1), 7);
    const randomOffset = Math.random() * 360;
    const initialTargetAngle = rotate.value + 360 * rotations + randomOffset;

    rotate.value = withTiming(
      initialTargetAngle,
      {
        duration: 5000,
        easing: Easing.out(Easing.cubic),
      },
      (finished) => {
        if (!finished) {
          isSpinning.value = false;
          return;
        }

        const finalAngle = ((rotate.value % 360) + 360) % 360;
        const invertedAngle = (360 - finalAngle) % 360;
        const selectedIndex = Math.floor((invertedAngle + segmentAngle / 2) / segmentAngle) % items.length;
        const targetAngle = (360 - selectedIndex * segmentAngle) % 360;

        let delta = targetAngle - finalAngle;
        if (delta > 180) delta -= 360;
        if (delta < -180) delta += 360;

        rotate.value = withTiming(
          rotate.value + delta,
          {
            duration: 800,
            easing: Easing.out(Easing.quad),
          },
          () => {
            isSpinning.value = false;
            if (onSelectedItem) {
              runOnJS(onSelectedItem)(items[selectedIndex]);
              // Final selection uses notification type for distinct feedback
              runOnJS(Haptics.notificationAsync)(Haptics.NotificationFeedbackType.Success);
            }
          }
        );
      }
    );
  };

  const gesture = Gesture.Pan()
    .onUpdate((event) => {
      if (!isSpinning.value) {
        translateY.value = clamp(event.translationY, -50, 0);
      }
    })
    .onEnd((event) => {
      if (event.velocityY < -100) {
        runOnJS(handleSpin)(event.velocityY);
        runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Light);
      }
      translateY.value = withTiming(0);
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  useImperativeHandle(ref, () => ({
    spin: () => {
      "worklet";
      runOnJS(handleSpin)(-1750);
      runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Light);
    },
  }));

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          useAnimatedStyle(() => ({
            opacity: isSpinning.value ? withTiming(1) : withTiming(0),
          })),

          styles.center,
        ]}
      >
        <MaterialCommunityIcons
          name="triangle"
          size={40}
          color={MD2DarkTheme.colors.primary}
          style={{ transform: [{ rotate: "180deg" }] }}
        />
      </Animated.View>

      <Animated.Text
        style={[
          useAnimatedStyle(() => ({
            opacity: isSpinning.value ? withTiming(0) : withTiming(1),
          })),
          {
            color: "#fff",
            fontFamily: "Bebas",
            fontSize: 18,
          },
          styles.center,
        ]}
      >
        {t("fortune-wheel.drag")}
      </Animated.Text>

      <GestureDetector gesture={gesture}>
        <Animated.View entering={SlideInDown.duration(350)} exiting={SlideOutDown.duration(350)}>
          <Animated.View style={[styles.wheelContainer, animatedStyle]}>
            <View style={[styles.wheelMask, { height: size / 2 }]}>
              <Animated.View
                style={[
                  styles.wheel,
                  {
                    width: size,
                    height: size,
                    borderRadius: 1000,
                    top: 0, // Changed from bottom to top
                    backgroundColor: MD2DarkTheme.colors.surface,
                  },
                  useAnimatedStyle(() => ({
                    transform: [{ rotate: `${rotate.value}deg` }],
                  })),
                ]}
              >
                {items.map((item, index) => (
                  <Segment key={index} item={item as any} index={index} segmentAngle={segmentAngle} wheelSize={size} />
                ))}
              </Animated.View>
            </View>
          </Animated.View>
        </Animated.View>
      </GestureDetector>
    </View>
  );
});

const Segment = memo(({ item, index, segmentAngle, wheelSize }: { item: any; index: number; segmentAngle: number; wheelSize: number }) => {
  const radius = wheelSize / 2;

  return (
    <View
      style={[
        styles.segment,
        {
          transform: [{ rotate: `${index * segmentAngle}deg` }],
        },
      ]}
    >
      <View
        style={[
          styles.image,
          {
            width: wheelSize * 0.2,
            height: wheelSize * 0.2,
            transform: [{ translateY: -radius * 0.75 }],
          },
        ]}
      >
        <Image
          source={{
            uri: "https://image.tmdb.org/t/p/w200" + item.poster_path,
          }}
          resizeMode="contain"
          borderRadius={20}
          style={{
            width: wheelSize * 0.2,
            height: wheelSize * 0.2,
          }}
        />
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: -130,
    left: -width / 1.5 - 35,
    right: 0,
    alignItems: "center",
  },
  wheelContainer: {
    width: "100%",
    alignItems: "center",
  },
  wheelMask: {
    width: width,
    backgroundColor: "transparent",
  },
  wheel: {
    position: "absolute",
    // backgroundColor: "#fff",
  },
  segment: {
    position: "absolute",
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    position: "absolute",
  },

  center: { transform: [{ translateX: width / 2.5 - 10 }, { translateY: -60 }], position: "absolute" },
});

export default memo(Wheel, () => true);
