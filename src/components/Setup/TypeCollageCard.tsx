import { StyleSheet, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { FadeIn, useAnimatedStyle, withTiming, Easing } from "react-native-reanimated";
import Text from "../Text";
import Touch from "../Touch";
import Thumbnail from "../Thumbnail";
import { colors, radius, spacing, typography } from "../../constants/design";
import { useTheme } from "../../hooks/useTheme";

interface Props {
  posters: string[];
  label: string;
  isSelected: boolean;
  onPress: () => void;
  height: number;
}

const FAN = [
  { rotate: "-14deg", tx: -105, ty: 20, scale: 0.84, zIndex: 1 },
  { rotate: "-7deg",  tx: -52,  ty: 8,  scale: 0.92, zIndex: 2 },
  { rotate: "0deg",   tx: 0,    ty: 0,  scale: 1.0,  zIndex: 3 },
  { rotate: "7deg",   tx: 52,   ty: 8,  scale: 0.92, zIndex: 2 },
  { rotate: "14deg",  tx: 105,  ty: 20, scale: 0.84, zIndex: 1 },
];

export default function TypeCollageCard({ posters, label, isSelected, onPress, height }: Props) {
  const theme = useTheme();

  const dimStyle = useAnimatedStyle(() => ({
    opacity: withTiming(isSelected ? 0 : 0.4, { duration: 200, easing: Easing.out(Easing.cubic) }),
  }));

  if (height <= 0) return null;

  const posterH = height * 0.74;
  const posterW = posterH / 1.5;
  const raw = posters.slice(0, 5);
  const tiles = raw.length > 0 && raw.length < 5
    ? Array.from({ length: 5 }, (_, i) => raw[i % raw.length])
    : raw;

  return (
    <Animated.View entering={FadeIn.duration(300)} style={{ width: "100%", height }}>
      <Touch
        onPress={onPress}
        scaleTo={0.98}
        style={[styles.card, { height }, isSelected && { borderColor: theme.colors.primary, borderWidth: 3 }]}
      >
        <View style={styles.fanArea}>
          {tiles.map((poster, i) => {
            const cfg = FAN[i];
            return (
              <View
                key={i}
                style={[
                  styles.poster,
                  {
                    width: posterW,
                    height: posterH,
                    zIndex: cfg.zIndex,
                    transform: [
                      { translateX: cfg.tx },
                      { translateY: cfg.ty },
                      { rotate: cfg.rotate },
                      { scale: cfg.scale },
                    ],
                  },
                ]}
              >
                <Thumbnail
                  path={poster}
                  size={342}
                  container={StyleSheet.absoluteFill}
                  style={StyleSheet.absoluteFill}
                />
              </View>
            );
          })}
        </View>

        <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, styles.dim, dimStyle]} />

        <LinearGradient
          colors={["transparent", "rgba(0,0,0,0.55)", "rgba(0,0,0,0.95)"]}
          style={styles.gradient}
        >
          <Text style={styles.label}>{label}</Text>
        </LinearGradient>

        {isSelected && (
          <View style={[styles.checkmark, { backgroundColor: theme.colors.primary }]}>
            <MaterialCommunityIcons name="check" size={20} color={colors.text} />
          </View>
        )}
      </Touch>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: "100%",
    borderRadius: radius.card,
    overflow: "hidden",
    backgroundColor: colors.surface,
    borderWidth: 3,
    borderColor: "transparent",
  },
  fanArea: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1
  },
  poster: {
    position: "absolute",
    borderRadius: radius.sm + 2,
    overflow: "hidden",
  },
  dim: {
    backgroundColor: "#000",
  },
  gradient: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: "42%",
    justifyContent: "flex-end",
    padding: spacing.lg,
    zIndex: 2,
  },
  label: {
    color: colors.text,
    fontSize: typography.bebasSize.auth,
    fontFamily: "Bebas",
    letterSpacing: typography.bebasLetterSpacing,
    textShadowColor: "rgba(0,0,0,0.75)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  checkmark: {
    position: "absolute",
    top: spacing.sm,
    right: spacing.sm,
    width: 32,
    height: 32,
    borderRadius: radius.pill,
    justifyContent: "center",
    alignItems: "center",
  },
});
