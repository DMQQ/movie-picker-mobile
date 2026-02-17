import { Entypo } from "@expo/vector-icons";
import {
  BlurMask,
  Canvas,
  Circle,
  Group,
  LinearGradient,
  Path,
  RadialGradient,
  Rect,
  Skia,
  SweepGradient,
  vec,
} from "@shopify/react-native-skia";
import * as Haptics from "expo-haptics";
import { forwardRef, memo, useImperativeHandle, useMemo } from "react";
import { Dimensions, Image, Platform, StyleProp, StyleSheet, View, ViewStyle } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { MD2DarkTheme } from "react-native-paper";
import Animated, {
  clamp,
  Easing,
  runOnJS,
  SlideInDown,
  SlideOutDown,
  useAnimatedReaction,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import useTranslation from "../service/useTranslation";

const { width } = Dimensions.get("window");

// --- CONFIGURATION ---
const BORDER_WIDTH = 12;
const COLORS = new Array(4).fill(["#1a1a1a", "#2a2a2a"]).flat();

interface SegmentProps {
  item: {
    image: any;
    poster_path: string;
  };
  index: number;
  segmentAngle: number;
  wheelSize: number;
  startAngle: number;
}

const Segment = memo(({ item, segmentAngle, wheelSize, startAngle }: SegmentProps) => {
  const radius = wheelSize / 2;
  const middleAngle = startAngle + segmentAngle / 2;
  const angleInRadians = (middleAngle - 90) * (Math.PI / 180);

  const imageSize = wheelSize * 0.13;
  const distanceFromCenter = radius - imageSize / 2 - BORDER_WIDTH - 45;

  const translateX = Math.cos(angleInRadians) * distanceFromCenter;
  const translateY = Math.sin(angleInRadians) * distanceFromCenter;

  const left = radius - imageSize / 2 + translateX;
  const top = radius - imageSize / 2 + translateY;

  return (
    <View
      style={{
        position: "absolute",
        width: imageSize,
        height: imageSize,
        left,
        top,
        transform: [{ rotate: `${middleAngle}deg` }],
        justifyContent: "center",
        alignItems: "center",
        zIndex: 10,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.5,
        shadowRadius: 4,
        elevation: 5,
      }}
    >
      <Image
        source={{ uri: "https://image.tmdb.org/t/p/w200" + item.poster_path }}
        resizeMode="cover"
        style={{
          width: imageSize,
          height: imageSize * 1.5,
          borderRadius: 4,
          backgroundColor: "#000",
        }}
      />
    </View>
  );
});

// --- THE FANCY OVERLAY (Gold-Silver Hub) ---
const WheelOverlay = ({ size }: { size: number }) => {
  const center = vec(size / 2, size / 2);
  const radius = size / 2;
  const hubRadius = size * 0.15;

  return (
    <Canvas style={{ width: size, height: size, position: "absolute", top: 0, left: 0 }} pointerEvents="none">
      {/* 1. SHADOW VIGNETTE */}
      <Rect x={0} y={0} width={size} height={size}>
        <RadialGradient
          c={center}
          r={radius}
          colors={["rgba(255,255,255,0.025)", "rgba(255,255,255,0.1)", "transparent"]}
          positions={[0.5, 0.8, 1]}
        />
      </Rect>

      {/* 2. OUTER GOLD RIM */}
      <Circle cx={center.x} cy={center.y} r={radius - BORDER_WIDTH / 2} style="stroke" strokeWidth={BORDER_WIDTH}>
        <SweepGradient c={center} colors={["#FFD700", "#FFF8DC", "#B8860B", "#FFD700", "#FFF8DC", "#B8860B", "#FFD700"]} />
        <BlurMask blur={2} style="solid" />
      </Circle>

      <Circle cx={center.x} cy={center.y} r={radius - BORDER_WIDTH} style="stroke" strokeWidth={1} color="rgba(255,255,255,0.4)" />

      {/* 3. THE PREMIUM GOLD-SILVER HUB */}
      <Group>
        {/* Shadow Drop */}
        <Circle cx={center.x} cy={center.y} r={hubRadius + 10} color="black" opacity={0.6}>
          <BlurMask blur={12} style="normal" />
        </Circle>

        {/* The Hub Frame (Ring) - Mixed Gold & Silver */}
        <Circle cx={center.x} cy={center.y} r={hubRadius} style="stroke" strokeWidth={20}>
          <SweepGradient
            c={center}
            colors={[
              "#FFD700", // Gold
              "#C0C0C0", // Silver
              "#B8860B", // Dark Bronze
              "#E5E4E2", // Platinum
              "#FFD700", // Gold
            ]}
          />
        </Circle>

        {/* The Hub Cap - Metallic Sphere Gradient */}
        <Circle cx={center.x} cy={center.y} r={hubRadius}>
          <RadialGradient
            c={vec(center.x - hubRadius * 0.3, center.y - hubRadius * 0.3)} // Light from Top-Left
            r={hubRadius * 1.5}
            colors={[
              "#FFFFFF", // Specular Highlight (Pure White)
              "#E5E4E2", // Silver
              "#D4AF37", // Metallic Gold
              "#8B7E66", // Muted Bronze
              "#1a1a1a", // Deep Shadow
            ]}
            positions={[0, 0.2, 0.5, 0.8, 1]}
          />
        </Circle>

        {/* Inner Border Ring (Definition) */}
        <Circle cx={center.x} cy={center.y} r={hubRadius} style="stroke" strokeWidth={1} color="rgba(0,0,0,0.5)" />

        {/* The "Hard" Gloss Reflection (Top Half) */}
        <Circle cx={center.x} cy={center.y - hubRadius * 0.2} r={hubRadius * 0.8} opacity={0.5}>
          <LinearGradient
            start={vec(center.x, center.y - hubRadius)}
            end={vec(center.x, center.y)}
            colors={["rgba(255,255,255,0.9)", "transparent"]}
          />
        </Circle>
      </Group>
    </Canvas>
  );
};

// --- BACKGROUND SEGMENTS ---
const WheelBackground = ({ size, items }: { size: number; items: any[] }) => {
  const segmentAngle = 360 / items.length;
  const center = size / 2;

  return (
    <Canvas style={{ width: size, height: size, position: "absolute" }}>
      {items.map((_, index) => {
        const startAngle = index * segmentAngle;

        const p = Skia.Path.Make();
        p.moveTo(center, center);

        const rect = { x: 0, y: 0, width: size, height: size };
        p.arcToOval(rect, startAngle - 90, segmentAngle, false);

        p.close();

        return <Path key={index} path={p} color={COLORS[index % COLORS.length]} />;
      })}
    </Canvas>
  );
};

interface WheelProps {
  size?: number;
  items: Array<{ image: any; poster_path: string }>;
  onSelectedItem?: (item: any) => void;
  onSpinStart?: () => void;
  style?: StyleProp<ViewStyle>;
}

const Wheel = forwardRef<{ spin: () => void }, WheelProps>(({ size = width * 1.5, items, style, onSelectedItem, onSpinStart }, ref) => {
  const segmentAngle = 360 / items.length;
  const rotate = useSharedValue(0);
  const isSpinning = useSharedValue(false);
  const translateY = useSharedValue(0);
  const lastHapticSegment = useSharedValue(-1);
  const lastHapticTime = useSharedValue(0);

  const t = useTranslation();

  const triggerItemHaptic = () => {
    if (Platform.OS === "ios") Haptics.selectionAsync();
  };

  useAnimatedReaction(
    () => rotate.value,
    (currentRotation) => {
      if (!isSpinning.value) return;
      const normalizedRotation = ((currentRotation % 360) + 360) % 360;
      const invertedAngle = (360 - normalizedRotation) % 360;
      const segmentCenter = Math.floor(invertedAngle / segmentAngle);
      const centerAngle = segmentCenter * segmentAngle + segmentAngle / 2;
      const distanceFromCenter = Math.abs(invertedAngle - centerAngle);

      if (distanceFromCenter < 5 && segmentCenter !== lastHapticSegment.value) {
        const currentTime = Date.now();
        if (currentTime - lastHapticTime.value > 50) {
          lastHapticTime.value = currentTime;
          lastHapticSegment.value = segmentCenter;
          runOnJS(triggerItemHaptic)();
        }
      }
    },
  );

  const handleSpin = (velocity: number) => {
    if (isSpinning.value) return;
    if (onSpinStart) runOnJS(onSpinStart)();

    isSpinning.value = true;
    runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Heavy);

    const rotations = Math.min(Math.max(Math.abs(velocity / 500), 2), 8);
    const randomOffset = (Math.random() - 0.5) * (segmentAngle * 0.8);
    const initialTargetAngle = rotate.value + 360 * rotations + randomOffset;

    rotate.value = withTiming(initialTargetAngle, { duration: 4000, easing: Easing.out(Easing.cubic) }, (finished) => {
      if (!finished) {
        isSpinning.value = false;
        return;
      }
      const currentRot = rotate.value % 360;
      const normalizedRot = (currentRot + 360) % 360;
      const segmentIndex = Math.floor(normalizedRot / segmentAngle);
      const targetAngle = rotate.value - (normalizedRot - segmentIndex * segmentAngle);
      const finalTargetAngle = targetAngle + segmentAngle / 2;

      rotate.value = withTiming(finalTargetAngle, { duration: 1000, easing: Easing.out(Easing.back(1.5)) }, () => {
        isSpinning.value = false;
        if (onSelectedItem) {
          const finalRotation = ((finalTargetAngle % 360) + 360) % 360;
          const selectedIndex = (items.length - Math.floor(finalRotation / segmentAngle) - 1) % items.length;
          runOnJS(onSelectedItem)(items[selectedIndex]);
          runOnJS(Haptics.notificationAsync)(Haptics.NotificationFeedbackType.Success);
        }
      });
    });
  };

  const gesture = Gesture.Pan()
    .onUpdate((event) => {
      if (!isSpinning.value) translateY.value = clamp(event.translationY, -50, 0);
    })
    .onEnd((event) => {
      if (event.velocityY < -100) {
        runOnJS(handleSpin)(event.velocityY);
      }
      translateY.value = withTiming(0);
    });

  useImperativeHandle(ref, () => ({
    spin: () => {
      runOnJS(handleSpin)(-2000);
    },
  }));

  const animatedWheelStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotate.value}deg` }],
  }));

  const animatedBounceStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <View style={[styles.container, { height: size, bottom: -(size * 0.6) }]}>
      <Animated.View style={[styles.center, { zIndex: 100 }]}>
        <Canvas style={{ width: 60, height: 60 }}>
          <Path path="M 10 0 L 50 0 L 30 40 Z" color={MD2DarkTheme.colors.primary}>
            <BlurMask blur={4} style="solid" />
          </Path>
          <Path path="M 10 0 L 50 0 L 30 40 Z" color="#fff" style="stroke" strokeWidth={2} />
        </Canvas>
      </Animated.View>

      <Animated.Text
        style={[useAnimatedStyle(() => ({ opacity: isSpinning.value ? withTiming(0) : withTiming(1) })), styles.ctaText, styles.center]}
      >
        {t("fortune-wheel.drag")}
      </Animated.Text>

      <GestureDetector gesture={gesture}>
        <Animated.View entering={SlideInDown} exiting={SlideOutDown} style={[styles.wheelContainer, animatedBounceStyle]}>
          <Animated.View style={[{ width: size, height: size }, animatedWheelStyle]}>
            <WheelBackground size={size} items={items} />

            {items.map((item, index) => (
              <Segment
                key={index}
                item={item}
                index={index}
                segmentAngle={segmentAngle}
                wheelSize={size}
                startAngle={index * segmentAngle}
              />
            ))}
          </Animated.View>

          <WheelOverlay size={size} />
        </Animated.View>
      </GestureDetector>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    left: 0,
    right: 0,
    justifyContent: "flex-start",
    alignItems: "center",
  },
  wheelContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  center: {
    position: "absolute",
    top: -40,
    width: "100%",
    alignItems: "center",
  },
  ctaText: {
    color: "#fff",
    fontFamily: "Bebas",
    fontSize: 24,
    textShadowColor: "rgba(0,0,0,0.8)",
    textShadowRadius: 4,
    top: -80,
  },
});

export default memo(Wheel);
