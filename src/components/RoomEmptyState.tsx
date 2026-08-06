import { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import { useAppSelector } from "../redux/store";
import { Text } from "react-native-paper";
import Animated, {
  FadeIn,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import useTranslation from "../service/useTranslation";

function PulseRing({ color, delay }: { color: string; delay: number }) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0.55);

  useEffect(() => {
    scale.value = withRepeat(
      withDelay(delay, withTiming(2.6, { duration: 2200 })),
      -1,
    );
    opacity.value = withRepeat(
      withDelay(delay, withTiming(0, { duration: 2200 })),
      -1,
    );
  }, []);

  const style = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return <Animated.View style={[styles.ring, { borderColor: color }, style]} />;
}

export default function RoomEmptyState() {
  const gameEnded = useAppSelector((state) => state.room.gameEnded);
  const hasUserPlayed = useAppSelector((state) => state.room.hasUserPlayed);
  const t = useTranslation();

  const waiting = !gameEnded && hasUserPlayed;
  const color = gameEnded ? "#ca469c" : "#7845ac";
  const icon: keyof typeof MaterialCommunityIcons.glyphMap = gameEnded
    ? "flag-checkered"
    : "check-circle-outline";

  return (
    <Animated.View entering={FadeIn.duration(350)} style={styles.container}>
      <View style={styles.iconWrap}>
        <PulseRing color={color} delay={0} />
        <PulseRing color={color} delay={800} />
        <MaterialCommunityIcons name={icon} size={60} color={color} />
      </View>

      {waiting && (
        <Text style={styles.title}>{t("room.no-more-results")}</Text>
      )}

      <Text style={[styles.subtitle, !waiting && styles.subtitleLarge]}>
        {gameEnded ? t("room.finished") : t("room.waiting")}
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 44,
  },
  iconWrap: {
    width: 90,
    height: 90,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 32,
  },
  ring: {
    position: "absolute",
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 1.5,
  },
  title: {
    fontFamily: "Bebas",
    fontSize: 32,
    color: "#fff",
    letterSpacing: 1.5,
    textAlign: "center",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 14,
    color: "rgba(255,255,255,0.45)",
    textAlign: "center",
    lineHeight: 21,
  },
  subtitleLarge: {
    fontFamily: "Bebas",
    fontSize: 26,
    color: "rgba(255,255,255,0.7)",
    letterSpacing: 1,
  },
});
