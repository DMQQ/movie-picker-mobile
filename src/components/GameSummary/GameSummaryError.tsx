import { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import Text from "../Text";
import Animated, {
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import PrimaryButton from "../PrimaryButton";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import useTranslation from "../../service/useTranslation";
import { colors, fontSize, radius, spacing } from "../../constants/design";

const ERROR_RED = "#E5484D";

function FilmIcon() {
  const rotate = useSharedValue(0);

  useEffect(() => {
    rotate.value = withRepeat(
      withSequence(
        withTiming(-6, { duration: 90 }),
        withTiming(6, { duration: 180 }),
        withTiming(0, { duration: 90 }),
      ),
      -1,
    );
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotate.value}deg` }],
  }));

  return (
    <Animated.View style={animStyle}>
      <View style={styles.iconWrap}>
        <View style={styles.iconGlow} />
        <MaterialCommunityIcons name="filmstrip-off" size={40} color={ERROR_RED} />
      </View>
    </Animated.View>
  );
}

interface Props {
  error: string;
  onBack: () => void;
}

export default function GameSummaryError({ error, onBack }: Props) {
  const t = useTranslation();
  return (
    <View style={styles.container}>
      <Animated.View entering={FadeInDown.duration(400).springify()} style={styles.inner}>
        <FilmIcon />

        <View style={styles.textBlock}>
          <Text style={styles.heading}>{t("game-summary.error")}</Text>
          <Text style={styles.subtext}>{error}</Text>
        </View>

        <View style={styles.divider} />

        <PrimaryButton onPress={onBack} style={styles.btn}>
          {t("game-summary.back-to-home")}
        </PrimaryButton>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.xxl,
  },
  inner: {
    width: "100%",
    alignItems: "center",
    gap: spacing.xl,
  },
  iconWrap: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: `${ERROR_RED}14`,
    borderWidth: 1.5,
    borderColor: `${ERROR_RED}35`,
    alignItems: "center",
    justifyContent: "center",
  },
  iconGlow: {
    position: "absolute",
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: `${ERROR_RED}08`,
    transform: [{ scale: 1.6 }],
  },
  textBlock: {
    alignItems: "center",
    gap: spacing.sm,
  },
  heading: {
    fontSize: 42,
    fontFamily: "Bebas",
    color: colors.text,
    letterSpacing: 2,
    textAlign: "center",
  },
  subtext: {
    fontSize: fontSize.md,
    color: "rgba(255,255,255,0.45)",
    textAlign: "center",
    lineHeight: 21,
    maxWidth: 260,
  },
  divider: {
    width: 40,
    height: 1,
    backgroundColor: colors.border,
  },
  btn: {
    borderRadius: radius.pill,
    width: "100%",
  },
});
