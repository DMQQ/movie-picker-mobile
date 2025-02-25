import React, { forwardRef, memo, useEffect, useImperativeHandle } from "react";
import { View, StyleSheet, Dimensions, StyleProp, ViewStyle } from "react-native";
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
import Svg, { Path, Defs, Pattern, Line, G, Circle } from "react-native-svg";
import Thumbnail from "./Thumbnail";
import { Entypo } from "@expo/vector-icons";

const { width, height } = Dimensions.get("window");

// Define wheel segment colors
const COLORS = [
  "#592796",
  MD2DarkTheme.colors.primary,
  "#592796",
  MD2DarkTheme.colors.primary,
  "#592796",
  MD2DarkTheme.colors.primary,
  "#592796",
  MD2DarkTheme.colors.primary,
];

interface SegmentProps {
  item: {
    image: any;
    poster_path: string;
  };
  index: number;
  segmentAngle: number;
  wheelSize: number;
  startAngle: number;
}

const Segment = memo(({ item, index, segmentAngle, wheelSize, startAngle }: SegmentProps) => {
  const radius = wheelSize / 2;
  const middleAngle = startAngle + segmentAngle / 2;

  // Use exact calculation without rounding during the computation
  const angleInRadians = (middleAngle - 90) * (Math.PI / 180);
  const imageSize = wheelSize * 0.2;

  const distanceFromCenter = radius - imageSize / 2 - 15;

  // Calculate exact positions without premature rounding
  const translateX = Math.cos(angleInRadians) * distanceFromCenter;
  const translateY = Math.sin(angleInRadians) * distanceFromCenter;

  // Only round for the final position
  const left = radius - imageSize / 2 + translateX;
  const top = radius - imageSize / 2 + translateY;

  return (
    <View
      style={{
        position: "absolute",
        width: imageSize,
        height: imageSize,
        left,
        top,
        transform: [{ rotate: `${middleAngle}deg` }],
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Thumbnail
        path={item.poster_path}
        size={200}
        contentFit="contain"
        container={{
          width: imageSize,
          height: imageSize,
          backgroundColor: "transparent",
        }}
      />
    </View>
  );
});

interface WheelProps {
  size?: number;
  items: Array<{ image: any; poster_path: string }>;
  onSelectedItem?: (item: any) => void;
  onSpinStart?: () => void;
  style?: StyleProp<ViewStyle>;
}

const Wheel = forwardRef<{ spin: () => void }, WheelProps>(({ size = 300, items, style, onSelectedItem, onSpinStart }, ref) => {
  const segmentAngle = 360 / items.length;
  const rotate = useSharedValue(0);
  const isSpinning = useSharedValue(false);
  const translateY = useSharedValue(0);
  const lastHapticSegment = useSharedValue(-1);
  const lastHapticTime = useSharedValue(0);

  const t = useTranslation();

  const triggerItemHaptic = () => {
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

      if (distanceFromCenter < 5 && segmentCenter !== lastHapticSegment.value) {
        const currentTime = Date.now();
        if (currentTime - lastHapticTime.value > 100) {
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

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

    // Calculate initial spin
    const rotations = Math.min(Math.max(Math.abs(velocity / 500), 1), 7);
    const randomOffset = Math.random() * segmentAngle; // Random offset within one segment
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

        // Calculate final position
        const currentRotation = rotate.value % 360;
        const normalizedRotation = (currentRotation + 360) % 360;

        // Calculate which segment is at the top (pointer position)
        const segmentIndex = Math.floor(normalizedRotation / segmentAngle);

        // Calculate the exact angle needed to align the selected segment with the pointer
        const targetAngle = rotate.value - (normalizedRotation - segmentIndex * segmentAngle);

        // Add half segment offset to center the selection
        const finalTargetAngle = targetAngle + segmentAngle / 2;

        rotate.value = withTiming(
          finalTargetAngle,
          {
            duration: 800,
            easing: Easing.out(Easing.quad),
          },
          () => {
            isSpinning.value = false;
            if (onSelectedItem) {
              // Calculate final selected index
              const finalRotation = ((finalTargetAngle % 360) + 360) % 360;
              const selectedIndex = (items.length - Math.floor(finalRotation / segmentAngle) - 1) % items.length;
              runOnJS(onSelectedItem)(items[selectedIndex]);
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

  const renderWheelSegments = () => {
    return items.map((item, index) => {
      const startAngle = index * segmentAngle;
      const endAngle = startAngle + segmentAngle;
      const centerX = size / 2;
      const centerY = size / 2;
      const radius = size / 2;

      // Use precise calculations without premature rounding
      const startRad = ((startAngle - 90) * Math.PI) / 180;
      const endRad = ((endAngle - 90) * Math.PI) / 180;

      const x1 = centerX + radius * Math.cos(startRad);
      const y1 = centerY + radius * Math.sin(startRad);
      const x2 = centerX + radius * Math.cos(endRad);
      const y2 = centerY + radius * Math.sin(endRad);

      const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
      const pathData = [`M ${centerX},${centerY}`, `L ${x1},${y1}`, `A ${radius},${radius} 0 ${largeArcFlag} 1 ${x2},${y2}`, "Z"].join(" ");

      return (
        <G key={index}>
          <Path d={pathData} fill={COLORS[index % COLORS.length]} />
          {/* No pattern used here to simplify and ensure perfect circle */}
        </G>
      );
    });
  };

  // Add a border circle to ensure the wheel is perfectly round
  const renderWheelBorder = () => {
    const centerX = size / 2;
    const centerY = size / 2;
    const radius = size / 2;

    return (
      <Circle
        cx={centerX}
        cy={centerY}
        r={radius - 2} // Slightly smaller than wheel size to appear as a border
        fill="none"
        stroke="rgba(255, 255, 255, 0.2)"
        strokeWidth="4"
      />
    );
  };

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
        <Entypo name="triangle-down" size={100} color={MD2DarkTheme.colors.primary} />
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
            textAlign: "center",
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
                    borderRadius: size / 2,
                    overflow: "hidden",
                  },
                  useAnimatedStyle(() => ({
                    transform: [{ rotate: `${rotate.value}deg` }],
                  })),
                ]}
              >
                <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
                  {renderWheelSegments()}
                  {renderWheelBorder()}
                </Svg>

                {items.map((item, index) => (
                  <Segment
                    key={index}
                    item={item}
                    index={index}
                    segmentAngle={segmentAngle}
                    wheelSize={size}
                    startAngle={index * segmentAngle}
                  />
                ))}
              </Animated.View>
            </View>
          </Animated.View>
        </Animated.View>
      </GestureDetector>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: -130,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  wheelContainer: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  wheelMask: {
    width: width,
    backgroundColor: "transparent",
    alignItems: "center",
    justifyContent: "center",
  },
  wheel: {
    position: "absolute",
    top: 0,
    transform: [{ translateX: -150 }], // Half of default size (300)
    marginBottom: 50, // Add some margin at the bottom
  },
  segment: {
    position: "absolute",
    justifyContent: "center",
    alignItems: "center",
  },
  center: {
    position: "absolute",
    width: 100,
    left: "50%",
    marginLeft: -50,
    alignItems: "center",
    zIndex: 1,
    transform: [{ translateY: -50 }],
  },
});

export default memo(Wheel, () => true);
