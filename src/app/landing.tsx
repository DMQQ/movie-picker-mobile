import { AsyncStorage } from "expo-sqlite/kv-store";
import { router } from "expo-router";
import { useEffect, useRef } from "react";
import { Dimensions, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, {
  FadeInUp,
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { Image } from "expo-image";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import Text from "../components/Text";
import AnimatedHeading from "../components/AnimatedHeading";
import PrimaryButton from "../components/PrimaryButton";
import Button from "../components/Button";
import { colors, common, spacing, radius, fontSize, fontWeight, withAlpha } from "../constants/design";
import { posthog } from "../constants/posthog";
import useTranslation from "../service/useTranslation";

const { width: W, height: H } = Dimensions.get("window");

const CARD_W = 125;
const CARD_H = 188;
const BASE = "https://image.tmdb.org/t/p/w185";

// Glow colors cycle every 5s: blue → purple → crimson
const GLOW_COLORS = [
  withAlpha(colors.primary, 0.22),
  "rgba(124,92,191,0.22)",
  withAlpha(colors.error, 0.20),
];

// Circle — rx=ry guarantees constant linear speed for all cards
const ORBIT_R = 440;
const ORBIT_CX = W / 2;
const ORBIT_CY = H * 0.62;

const ORBIT_DURATION = 55000;
const ORBIT_REPS = 500;

const POSTER_PATHS = [
  "/q6y0Go1tsGEsmtFryDOJo3dEmqu.jpg",
  "/7WsyChQLEftFiDOVTGkv3hFpyyt.jpg",
  "/iPOn6DinuVyLY17YM9mKuPofV08.jpg",
  "/1g0dhYtq4irTY1GPXvft6k4YLjm.jpg",
  "/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg",
  "/bRwnj8WEKBCvmfeUNOukJPwB43K.jpg",
  "/qJ2tW6WMUDux911r6m7haRef0WH.jpg",
  "/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg",
  "/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg",
  "/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg",
  "/62HCnUTziyWcpDaBO2i1DX17ljH.jpg",
  "/iiZZdoQBEYBv6id8su7ImL0oCbD.jpg",
  "/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg",
  "/7WsyChQLEftFiDOVTGkv3hFpyyt.jpg",
  "/eM8bbTn8C8vUwwS6upzzm7gX31u.jpg",
  "/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg",
];

const FADE_DELAYS = [120, 820, 600, 350, 280, 540, 950, 680, 440, 760, 490, 180, 320, 710, 550, 90];

const POSTERS = POSTER_PATHS.map((poster, i) => ({
  angle: (Math.PI * 2 / POSTER_PATHS.length) * i,
  fadeDelay: FADE_DELAYS[i],
  poster,
}));

// One shared-value opacity per color — crossfade runs entirely on UI thread, no state, no re-renders.
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
    <View style={styles.topGlow} pointerEvents="none">
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

function OrbitingPosters() {
  const orbitAngle = useSharedValue(0);

  useEffect(() => {
    orbitAngle.value = withTiming(Math.PI * 2 * ORBIT_REPS, {
      duration: ORBIT_DURATION * ORBIT_REPS,
      easing: Easing.linear,
    });
  }, []);

  return (
    <>
      {POSTERS.map(({ angle, poster }, i) => (
        <PosterCard key={i} orbitAngle={orbitAngle} initAngle={angle} poster={poster} />
      ))}
    </>
  );
}

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
    <Animated.View style={[styles.card, { left: ORBIT_CX - CARD_W / 2, top: ORBIT_CY - CARD_H / 2 }, style]}>
      <Image source={{ uri: BASE + poster }} style={StyleSheet.absoluteFill} contentFit="cover"
        onError={() => {}}
      />
    </Animated.View>
  );
}


const MODES = [
  { key: "landing.modes.swipe", icon: "cards-outline" },
  { key: "landing.modes.vote", icon: "thumb-up-outline" },
  { key: "landing.modes.spin", icon: "rotate-right" },
  { key: "landing.modes.random", icon: "dice-5-outline" },
] as const;

export default function LandingScreen() {
  const insets = useSafeAreaInsets();
  const t = useTranslation();

  useEffect(() => {
    AsyncStorage.setItem("landing_shown", "1");
  }, []);

  const goQuickstart = () => {
    posthog?.capture("landing_quickstart_pressed");
    router.replace("/(tabs)");
    router.push({ pathname: "/room/qr-code", params: { quickStart: "true", autoStart: "true" } } as any);
  };

  const goBrowse = () => {
    posthog?.capture("landing_browse_pressed");
    router.replace("/(tabs)");
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom  }]}>
      <CyclingGlow />

      <OrbitingPosters />

      <LinearGradient
        colors={["transparent", colors.appBackground, colors.appBackground]}
        locations={[0, 0.5, 1]}
        style={styles.bottomFade}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
      />

      <Animated.View entering={FadeInUp.delay(60).duration(400)} style={styles.logoWrap}>
        <Image
          source={require("../../assets/images/notification-icon.png")}
          style={styles.logo}
          contentFit="contain"
        />
      </Animated.View>

      <View style={styles.textBlock}>
        <AnimatedHeading line1={t("landing.line1")} line2={t("landing.line2")} />

        <Animated.View entering={FadeInUp.delay(700).duration(400)} style={styles.subBlock}>
          <Text style={styles.sub}>{t("landing.sub")}</Text>

          <View style={styles.modesRow}>
            {MODES.map(({ key, icon }) => (
              <View key={key} style={styles.modeChip}>
                <MaterialCommunityIcons name={icon as any} size={20} color={withAlpha(colors.text, 0.45)} />
                <Text style={styles.modeText}>{t(key)}</Text>
              </View>
            ))}
          </View>
        </Animated.View>
      </View>

      <Animated.View entering={FadeInUp.delay(800).duration(400)} style={styles.actions}>
        <PrimaryButton onPress={goQuickstart} style={styles.primaryBtn}>
          {t("landing.cta")}
        </PrimaryButton>
        <Button mode="outlined" onPress={goBrowse} style={[common.pillButton, styles.browseBtn]}>
          {t("landing.browse")}
        </Button>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.appBackground,
    paddingHorizontal: spacing.xl,
    justifyContent: "space-between",
  },
  card: {
    position: "absolute",
    width: CARD_W,
    height: CARD_H,
    borderRadius: radius.card,
    overflow: "hidden",
    opacity: 0.28,
  },
  topGlow: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    height: H * 0.55,
  },
  bottomFade: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: H * 0.62,
  },
  logoWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-end",
    marginBottom: -spacing.xl,
  },
  logo: {
    width: 380,
    height: 380,
    borderRadius: 80,
    overflow: "hidden",
  },
  textBlock: {
    gap: 0,
  },
  subBlock: {
    gap: spacing.md,
  },
  sub: {
    fontSize: fontSize.lg,
    color: withAlpha(colors.text, 0.65),
    lineHeight: 24,
  },
  modesRow: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  modeChip: {
    flex: 1,
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: withAlpha(colors.text, 0.12),
    paddingVertical: spacing.sm,
    backgroundColor: withAlpha(colors.text, 0.05),
    alignItems: "center",
    gap: spacing.xs,
  },
  modeText: {
    fontSize: fontSize.xs,
    color: withAlpha(colors.text, 0.45),
    fontWeight: fontWeight.semibold,
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  actions: {
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  primaryBtn: {
    borderRadius: radius.pill,
  },
  browseBtn: {
    borderRadius: radius.pill,
  },
});
