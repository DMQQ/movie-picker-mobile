import { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  withDelay,
  Easing,
} from "react-native-reanimated";

export const FancySpinner = ({ size = 100, speed = 2000, dotSize = 16 }: { size?: number; speed?: number; dotSize?: number }) => {
  const angle = useSharedValue(0);
  const hue = useSharedValue(0);

  const scales = [useSharedValue(1), useSharedValue(1), useSharedValue(1)];

  useEffect(() => {
    angle.value = withRepeat(withTiming(360, { duration: speed * 2, easing: Easing.linear }), -1);

    hue.value = withRepeat(withTiming(360, { duration: speed * 3, easing: Easing.linear }), -1);

    scales.forEach((scale, index) => {
      scale.value = withDelay(
        index * 150,
        withRepeat(withSequence(withTiming(1.8, { duration: speed / 2 }), withTiming(1, { duration: speed / 2 })), -1)
      );
    });
  }, []);

  const getAnimatedDotStyle = (index: number) =>
    useAnimatedStyle(() => {
      const radius = size / 2 - dotSize;
      const theta = ((angle.value + index * 120) * Math.PI) / 180;
      const currentHue = (hue.value + index * 60) % 360;
      const color = `hsl(${currentHue}, 100%, 70%)`;

      return {
        transform: [
          { translateX: radius * Math.cos(theta) - dotSize / 2 },
          { translateY: radius * Math.sin(theta) - dotSize / 2 },
          { scale: scales[index].value },
        ],
        backgroundColor: color,
        style: {
          shadowColor: color,
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 1,
          shadowRadius: 15,
          elevation: 20,
        },
      };
    });

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      {[0, 1, 2].map((index) => (
        <Animated.View
          key={index}
          style={[
            styles.dot,
            {
              width: dotSize,
              height: dotSize,
              borderRadius: dotSize / 2,
            },
            getAnimatedDotStyle(index),
          ]}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
  },
  dot: {
    position: "absolute",
  },
});
