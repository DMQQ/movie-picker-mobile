import { useEffect, useState } from "react";
import { View, StyleSheet } from "react-native";
import Animated, {
  FadeIn,
  FadeInDown,
  useSharedValue,
  useAnimatedProps,
  withTiming,
  Easing,
} from "react-native-reanimated";
import Svg, { Circle } from "react-native-svg";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import Text from "../Text";
import AnimatedHeading from "../AnimatedHeading";
import { colors, fontSize, spacing, withAlpha } from "../../constants/design";
import useTranslation from "../../service/useTranslation";

const AUTO_START_PHRASES = [
  "room.loading-sneaking",
  "room.loading-bribing",
  "room.loading-popcorn",
  "room.loading-gods",
  "room.loading-shuffling",
];

const AUTO_START_ICONS = [
  "ghost-outline",
  "cash-multiple",
  "popcorn",
  "lightning-bolt",
  "shuffle-variant",
] as const;

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const RING_SIZE = 200;
const RING_STROKE = 6;
const RING_RADIUS = (RING_SIZE - RING_STROKE) / 2;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

export default function AutoStartOverlay() {
  const t = useTranslation();
  const [phraseIndex, setPhraseIndex] = useState(0);
  const progress = useSharedValue(0);

  useEffect(() => {
    const id = setInterval(
      () => setPhraseIndex((i) => (i + 1) % AUTO_START_PHRASES.length),
      1200,
    );
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const target = (phraseIndex + 1) / AUTO_START_PHRASES.length;
    progress.value = withTiming(target, { duration: 450, easing: Easing.out(Easing.cubic) });
  }, [phraseIndex]);

  const arcProps = useAnimatedProps(() => ({
    strokeDashoffset: RING_CIRCUMFERENCE * (1 - progress.value),
  }));

  return (
    <Animated.View entering={FadeInDown} style={styles.container}>
      <View style={styles.ring}>
        <Svg width={RING_SIZE} height={RING_SIZE} style={StyleSheet.absoluteFill}>
          <Circle
            cx={RING_SIZE / 2}
            cy={RING_SIZE / 2}
            r={RING_RADIUS}
            stroke={withAlpha(colors.primary, 0.15)}
            strokeWidth={RING_STROKE}
            fill="none"
          />
          <AnimatedCircle
            cx={RING_SIZE / 2}
            cy={RING_SIZE / 2}
            r={RING_RADIUS}
            stroke={colors.primary}
            strokeWidth={RING_STROKE}
            fill="none"
            strokeDasharray={RING_CIRCUMFERENCE}
            animatedProps={arcProps}
            strokeLinecap="round"
            rotation="-90"
            origin={`${RING_SIZE / 2}, ${RING_SIZE / 2}`}
          />
        </Svg>
        <Animated.View key={phraseIndex} entering={FadeIn.duration(350)}>
          <MaterialCommunityIcons
            name={AUTO_START_ICONS[phraseIndex] as any}
            size={64}
            color={colors.primary}
          />
        </Animated.View>
      </View>
      <View style={styles.phraseBlock}>
        <AnimatedHeading key={phraseIndex} line1={t(AUTO_START_PHRASES[phraseIndex])} charDelay={20} centered />
        <Text style={styles.stepLabel}>
          {phraseIndex + 1} / {AUTO_START_PHRASES.length}
        </Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.appBackground,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xxl * 2,
  },
  ring: {
    width: RING_SIZE,
    height: RING_SIZE,
    alignItems: "center",
    justifyContent: "center",
  },
  phraseBlock: {
    alignItems: "center",
    gap: spacing.sm,
    paddingHorizontal: spacing.xxl,
    width: "100%",
    height:100
  },
  stepLabel: {
    fontSize: fontSize.sm,
    color: colors.placeholder,
  },
});
