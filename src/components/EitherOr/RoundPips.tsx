import { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
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
  const width = useSharedValue(active ? 24 : 8);

  useEffect(() => {
    width.value = withTiming(active ? 24 : 8, { duration: 300 });
  }, [active]);

  const animatedStyle = useAnimatedStyle(() => ({ width: width.value }));

  return (
    <Animated.View
      style={[
        styles.pip,
        done && styles.pipDone,
        active && styles.pipActive,
        animatedStyle,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    gap: 6,
    justifyContent: "center",
    alignItems: "center",
  },
  pip: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: withAlpha(colors.text, 0.2),
  },
  pipDone: {
    backgroundColor: withAlpha(colors.primary, 0.5),
  },
  pipActive: {
    backgroundColor: colors.primary,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
    elevation: 4,
  },
});
