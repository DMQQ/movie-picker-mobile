import { useEffect } from "react";
import { Dimensions, StyleSheet, View } from "react-native";
import { colors, radius, spacing} from "../../constants/design";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const TILE_WIDTH = (SCREEN_WIDTH - 60) / 3;
const TILE_HEIGHT = TILE_WIDTH * 1.5;

export default function GroupSkeleton() {
  const opacity = useSharedValue(1);

  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(0.3, { duration: 800, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );
  }, []);

  const animStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <View style={styles.grid}>
      {Array.from({ length: 9 }).map((_, i) => (
        <Animated.View key={i} style={[styles.tile, animStyle]} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.screen,
    paddingTop: spacing.xl * 4,
  },
  tile: {
    width: TILE_WIDTH,
    height: TILE_HEIGHT,
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceElevated,
  },
});
