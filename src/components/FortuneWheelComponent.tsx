import React, { memo, useEffect } from "react";
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
} from "react-native-reanimated";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { MD2DarkTheme } from "react-native-paper";
import useTranslation from "../service/useTranslation";

const { width, height } = Dimensions.get("window");

const Wheel = ({
  size = 300,
  items,
  style,
  onSelectedItem,
  onSpinStart,
}: {
  size?: number;
  items: { image: any }[];
  onSelectedItem?: (item: any) => void;
  onSpinStart?: () => void;
  style: StyleProp<ViewStyle>;
}) => {
  const segmentAngle = 360 / items.length;
  const rotate = useSharedValue(0);
  const isSpinning = useSharedValue(false);
  const translateY = useSharedValue(0);

  const t = useTranslation();

  const handleSpin = (velocity: number) => {
    if (isSpinning.value) return;

    if (onSpinStart) {
      runOnJS(onSpinStart)();
    }

    isSpinning.value = true;

    const rotations = Math.min(Math.max(Math.abs(velocity / 500), 1), 6);
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
              runOnJS(Vibration.vibrate)(100);
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
        runOnJS(Vibration.vibrate)(100);
      }
      translateY.value = withTiming(0);
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
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
};

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
