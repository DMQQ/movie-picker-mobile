import { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withTiming, Easing, interpolateColor } from "react-native-reanimated";
import { colors, radius, withAlpha } from "../../constants/design";

interface Props {
  startedAt: number;
  countdownMs: number;
  frozen: boolean;
}

export default function CountdownBar({ startedAt, countdownMs, frozen }: Props) {
  const progress = useSharedValue(1);

  useEffect(() => {
    if (frozen) return;
    const elapsed = Date.now() - startedAt;
    const remaining = Math.max(countdownMs - elapsed, 0);
    progress.value = remaining / countdownMs;
    progress.value = withTiming(0, { duration: remaining, easing: Easing.linear });
  }, [startedAt, countdownMs, frozen]);

  const style = useAnimatedStyle(() => ({
    width: `${progress.value * 100}%`,
    backgroundColor: interpolateColor(progress.value, [0, 0.3, 1], [colors.error, colors.error, colors.primary]),
  }));

  return (
    <View style={styles.track}>
      <Animated.View style={[styles.fill, style]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    flex: 1,
    borderRadius: 0,
    backgroundColor: withAlpha(colors.text, 0.12),
    overflow: "hidden",
  },
  fill: {
    height: "100%",
    borderRadius: radius.xs,
  },
});
