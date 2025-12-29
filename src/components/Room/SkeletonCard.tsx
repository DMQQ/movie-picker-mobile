import React, { useEffect } from "react";
import { View, StyleSheet } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  interpolate,
} from "react-native-reanimated";

interface SkeletonCardProps {
  width: number;
  height: number;
  borderRadius?: number;
  style?: any;
}

const SkeletonCard: React.FC<SkeletonCardProps> = ({ width, height, borderRadius = 16, style }) => {
  const shimmer = useSharedValue(0);

  useEffect(() => {
    shimmer.value = withRepeat(withTiming(1, { duration: 1500 }), -1, false);
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(shimmer.value, [0, 0.5, 1], [0.3, 0.5, 0.3]);

    return {
      opacity,
    };
  });

  return (
    <View style={[styles.container, style]}>
      <Animated.View
        style={[
          styles.skeleton,
          {
            width,
            height,
            borderRadius,
          },
          animatedStyle,
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginRight: 16,
  },
  skeleton: {
    backgroundColor: "#2a2a2a",
  },
});

export default SkeletonCard;
