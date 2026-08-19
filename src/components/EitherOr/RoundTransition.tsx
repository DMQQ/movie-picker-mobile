import { useEffect, useState } from "react";
import { LayoutChangeEvent, StyleSheet, View } from "react-native";
import Animated, {
  Easing,
  FadeIn,
  FadeInDown,
  FadeInUp,
  FadeOut,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import Text from "../Text";
import Bracket, { computeBracketFitScale } from "./Bracket";
import useTranslation from "../../service/useTranslation";
import { colors, fontSize, spacing, typography } from "../../constants/design";
import type { MatchResultEntry } from "../../redux/eitherOr/eitherOrSlice";

interface Props {
  completedRound: number;
  nextRound: number;
  bracketSize: number;
  matchResults: MatchResultEntry[];
}

export default function RoundTransition({ completedRound, nextRound, bracketSize, matchResults }: Props) {
  const t = useTranslation();
  const dotOpacity = useSharedValue(0.3);
  const [wrapSize, setWrapSize] = useState({ width: 0, height: 0 });

  const onWrapLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setWrapSize({ width, height });
  };

  const scale = computeBracketFitScale(bracketSize, 1, wrapSize.width, wrapSize.height, completedRound);

  useEffect(() => {
    dotOpacity.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 500, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.3, { duration: 500, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
  }, []);

  const dotStyle = useAnimatedStyle(() => ({ opacity: dotOpacity.value }));

  const totalRounds = Math.log2(bracketSize);
  const roundsFromEnd = totalRounds - nextRound;
  const nextStageName =
    roundsFromEnd === 0
      ? t("eitherOr.bracket.final")
      : roundsFromEnd === 1
        ? t("eitherOr.bracket.semifinal")
        : roundsFromEnd === 2
          ? t("eitherOr.bracket.quarterfinal")
          : t("eitherOr.bracket.round", { round: nextRound });

  return (
    <Animated.View
      entering={FadeIn.duration(250)}
      exiting={FadeOut.duration(200)}
      style={styles.overlay}
    >

      <Animated.View entering={FadeInDown.duration(350)} style={styles.header}>
        <View style={styles.eyebrowRow}>
          <MaterialCommunityIcons name="trophy-outline" size={14} color={colors.primary} />
          <Text style={styles.eyebrow}>{t("eitherOr.bracket.title")}</Text>
        </View>
        <Text style={styles.completedTitle}>
          {t("eitherOr.game.roundComplete", { round: completedRound })}
        </Text>
      </Animated.View>

      <View style={styles.bracketWrap} onLayout={onWrapLayout}>
        {wrapSize.width > 0 && (
          <Bracket
            bracketSize={bracketSize}
            matchResults={matchResults}
            currentMatch={null}
            champion={null}
            maxRound={completedRound}
            startRound={completedRound}
            scale={scale}
          />
        )}
      </View>

      <Animated.View entering={FadeInUp.duration(380).delay(150)} style={styles.footer}>
        <View style={styles.nextBadge}>
          <Animated.View style={[styles.nextDot, dotStyle]} />
          <Text style={styles.nextLabel}>{t("eitherOr.game.nextRoundStarting", { round: nextRound })}</Text>
        </View>
        <Text style={styles.nextStage}>{nextStageName}</Text>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: colors.appBackground,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.lg,
  },
  header: {
    alignItems: "center",
    marginBottom: spacing.xl,
    gap: spacing.xs,
  },
  eyebrowRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  eyebrow: {
    fontSize: fontSize.sm,
    color: colors.placeholder,
    letterSpacing: 2,
    textTransform: "uppercase",
  },
  completedTitle: {
    fontFamily: "Bebas",
    fontSize: typography.bebasSize.section,
    color: colors.text,
  },
  bracketWrap: {
    flex: 1,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  footer: {
    alignItems: "center",
    gap: spacing.xs,
    marginTop: spacing.xl,
  },
  nextBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  nextDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: colors.primary,
  },
  nextLabel: {
    fontSize: fontSize.sm,
    color: colors.placeholder,
  },
  nextStage: {
    fontFamily: "Bebas",
    fontSize: typography.bebasSize.auth,
    color: colors.primary,
    letterSpacing: 3,
  },
});
