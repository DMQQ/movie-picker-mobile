import { useEffect, useRef } from "react";
import { Dimensions, StyleSheet, View } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { Image } from "expo-image";
import { colors, radius, withAlpha } from "../../constants/design";

const GLOW_COLORS = [
  withAlpha(colors.primary, 0.28),
  "rgba(124,92,191,0.28)",
  withAlpha(colors.error, 0.22),
];

function CyclingGlow() {
  const op0 = useSharedValue(1);
  const op1 = useSharedValue(0);
  const op2 = useSharedValue(0);
  const ops = [op0, op1, op2];
  const currentIdx = useRef(0);

  const style0 = useAnimatedStyle(() => ({ opacity: op0.value }));
  const style1 = useAnimatedStyle(() => ({ opacity: op1.value }));
  const style2 = useAnimatedStyle(() => ({ opacity: op2.value }));
  const animStyles = [style0, style1, style2];

  useEffect(() => {
    const id = setInterval(() => {
      const cur = currentIdx.current;
      const next = (cur + 1) % GLOW_COLORS.length;
      ops[cur].value = withTiming(0, { duration: 1500 });
      ops[next].value = withTiming(1, { duration: 1500 });
      currentIdx.current = next;
    }, 5000);
    return () => clearInterval(id);
  }, []);

  return (
    <View style={styles.glow} pointerEvents="none">
      {GLOW_COLORS.map((color, i) => (
        <Animated.View key={i} style={[StyleSheet.absoluteFill, animStyles[i]]}>
          <LinearGradient
            colors={[color, "transparent"]}
            style={StyleSheet.absoluteFill}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
          />
        </Animated.View>
      ))}
    </View>
  );
}

const { width: W } = Dimensions.get("window");

const CARD_W = 108;
const CARD_H = 162;
const BASE = "https://image.tmdb.org/t/p/w185";

// Orbit center sits ~490px below the hero top so only the top arc is visible
const ORBIT_R = 410;
const ORBIT_CX = W / 2;
const ORBIT_CY = 490;

const ORBIT_DURATION = 55000;
const ORBIT_REPS = 500;

function PosterCard({
  orbitAngle,
  initAngle,
  poster,
}: {
  orbitAngle: Animated.SharedValue<number>;
  initAngle: number;
  poster: string;
}) {
  const style = useAnimatedStyle(() => {
    const a = orbitAngle.value + initAngle;
    return {
      transform: [
        { translateX: Math.cos(a) * ORBIT_R },
        { translateY: Math.sin(a) * ORBIT_R },
        { rotate: `${a + Math.PI / 2}rad` },
      ],
    };
  });

  return (
    <Animated.View
      style={[styles.card, { left: ORBIT_CX - CARD_W / 2, top: ORBIT_CY - CARD_H / 2 }, style]}
    >
      <Image
        source={{ uri: BASE + poster }}
        style={StyleSheet.absoluteFill}
        contentFit="cover"
      />
    </Animated.View>
  );
}

export { CyclingGlow };

export default function AnimatedBg({ posters }: { posters: string[] }) {
  const orbitAngle = useSharedValue(0);

  const COUNT = 12;
  const raw = posters.slice(0, COUNT);
  const tiles =
    raw.length > 0
      ? Array.from({ length: COUNT }, (_, i) => raw[i % raw.length])
      : [];

  const items = tiles.map((poster, i) => ({
    initAngle: (Math.PI * 2 / COUNT) * i,
    poster,
  }));

  useEffect(() => {
    orbitAngle.value = withTiming(Math.PI * 2 * ORBIT_REPS, {
      duration: ORBIT_DURATION * ORBIT_REPS,
      easing: Easing.linear,
    });
  }, []);

  if (items.length === 0) return null;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {items.map(({ initAngle, poster }, i) => (
        <PosterCard key={i} orbitAngle={orbitAngle} initAngle={initAngle} poster={poster} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  glow: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    height: "70%",
  },
  card: {
    position: "absolute",
    width: CARD_W,
    height: CARD_H,
    borderRadius: radius.card,
    overflow: "hidden",
    opacity: 0.55,
  },
  gradient: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: "65%",
  },
});
