import { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withSequence, withTiming } from "react-native-reanimated";
import { colors, spacing, withAlpha } from "../../constants/design";

interface Props {
  currentRound: number;
  totalRounds: number;
}

export default function RoundPips({ currentRound, totalRounds }: Props) {
  return (
    <View style={styles.row}>
      {Array.from({ length: totalRounds }, (_, i) => i + 1).map((round) => (
        <Pip key={round} active={round === currentRound} done={round < currentRound} />
      ))}
    </View>
  );
}

function Pip({ active, done }: { active: boolean; done: boolean }) {
  const scale = useSharedValue(1);

  useEffect(() => {
    if (active) {
      scale.value = withRepeat(withSequence(withTiming(1.4, { duration: 500 }), withTiming(1, { duration: 500 })), -1, true);
    } else {
      scale.value = withTiming(1, { duration: 200 });
    }
  }, [active]);

  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return <Animated.View style={[styles.pip, (active || done) && styles.pipFilled, animatedStyle]} />;
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    gap: spacing.xs,
    justifyContent: "center",
    alignItems: "center",
  },
  pip: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: withAlpha(colors.text, 0.2),
  },
  pipFilled: {
    backgroundColor: colors.primary,
  },
});
