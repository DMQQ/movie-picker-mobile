import { useEffect } from "react";
import { Dimensions, Platform, StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";

const { width, height } = Dimensions.get("window");

const CARD_WIDTH = width * 0.9 - 20;
const CARD_HEIGHT = height * 0.65;
const CARD_TOP = height * (Platform.OS === "ios" ? 0.055 : 0.075);
const SHIMMER_WIDTH = CARD_WIDTH * 0.55;

function SkeletonCard({ index }: { index: number }) {
  const translateX = useSharedValue(-SHIMMER_WIDTH);

  useEffect(() => {
    translateX.value = withRepeat(
      withTiming(CARD_WIDTH + SHIMMER_WIDTH, { duration: 1800 }),
      -1,
    );
  }, []);

  const shimmerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <Animated.View
      style={[
        styles.card,
        {
          transform: [
            { scale: 1 - index * 0.05 },
            { translateY: index * -7.5 },
          ],
          opacity: 1 - index * 0.3,
          zIndex: 3 - index,
        },
      ]}
    >
      <Animated.View style={[styles.shimmer, shimmerStyle]}>
        <LinearGradient
          colors={[
            "transparent",
            "rgba(255,255,255,0.05)",
            "rgba(255,255,255,0.09)",
            "rgba(255,255,255,0.05)",
            "transparent",
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{ flex: 1 }}
        />
      </Animated.View>

      <LinearGradient
        colors={["transparent", "rgba(0,0,0,0.85)"]}
        style={styles.cardGradient}
        pointerEvents="none"
      />

      <View style={styles.cardContent}>
        <View style={[styles.line, { width: "60%", height: 28, marginBottom: 10 }]} />
        <View style={[styles.line, { width: "88%", height: 10, marginBottom: 6 }]} />
        <View style={[styles.line, { width: "72%", height: 10, marginBottom: 6 }]} />
        <View style={[styles.line, { width: "50%", height: 10, marginBottom: 18 }]} />
        <View style={{ flexDirection: "row", gap: 8 }}>
          <View style={[styles.line, { width: 58, height: 22, borderRadius: 11 }]} />
          <View style={[styles.line, { width: 58, height: 22, borderRadius: 11 }]} />
          <View style={[styles.line, { width: 58, height: 22, borderRadius: 11 }]} />
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  cardStack: {
    position: "absolute",
    left: width * 0.1 - 10,
    top: CARD_TOP,
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
  },
  card: {
    position: "absolute",
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 25,
    backgroundColor: "#111",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    overflow: "hidden",
    justifyContent: "flex-end",
  },
  shimmer: {
    position: "absolute",
    top: 0,
    bottom: 0,
    width: SHIMMER_WIDTH,
    zIndex: 1,
  },
  cardGradient: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: CARD_HEIGHT * 0.45,
  },
  cardContent: {
    padding: 16,
    paddingBottom: 24,
    zIndex: 2,
  },
  line: {
    backgroundColor: "rgba(255,255,255,0.09)",
    borderRadius: 4,
  },
  labelWrap: {
    position: "absolute",
    left: 0,
    right: 0,
    top: CARD_TOP + CARD_HEIGHT + 18,
    alignItems: "center",
  },
  labelText: {
    fontFamily: "Bebas",
    fontSize: 22,
    letterSpacing: 1.5,
    color: "rgba(255,255,255,0.4)",
    textAlign: "center",
  },
});

import { useAppSelector } from "../redux/store";
import useTranslation from "../service/useTranslation";

function useRoomLoaderLabel(): string {
  const gameEnded = useAppSelector((state) => state.room.gameEnded);
  const isJoining = useAppSelector((state) => state.room.isJoining);
  const t = useTranslation();
  if (gameEnded) return t("room.finished") as string;
  if (isJoining) return t("room.joining") as string;
  return t("room.awaiting-start") as string;
}

export default function RoomLoader() {
  const label = useRoomLoaderLabel();
  return (
    <View style={styles.container}>
      <View style={styles.cardStack}>
        <SkeletonCard index={2} />
        <SkeletonCard index={1} />
        <SkeletonCard index={0} />
      </View>
      <View style={styles.labelWrap}>
        <Text style={styles.labelText}>{label}</Text>
      </View>
    </View>
  );
}
