import { useEffect, useMemo } from "react";
import { Dimensions, StyleSheet, View } from "react-native";
import Animated, {
  Easing,
  FadeIn,
  FadeInDown,
  FadeInUp,
  FadeOut,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import Text from "../Text";
import Thumbnail, { ThumbnailSizes } from "../Thumbnail";
import useTranslation from "../../service/useTranslation";
import { prefetchThumbnails } from "../../utils/prefetchImages";
import { colors, fontSize, radius, spacing, typography } from "../../constants/design";
import type { MatchResultEntry } from "../../redux/eitherOr/eitherOrSlice";

interface Props {
  completedRound: number;
  nextRound: number;
  bracketSize: number;
  matchResults: MatchResultEntry[];
}

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get("window");
const AVAIL_W = SCREEN_W - spacing.xl * 2;
const MAX_CARD_H = Math.floor(SCREEN_H * 0.52);

function getCardSize(n: number) {
  const raw = Math.floor(AVAIL_W / (1 + Math.max(n - 1, 0) * 0.55));
  const cardW = Math.min(raw, 260);
  const cardH = Math.min(Math.floor(cardW * (16 / 9)), MAX_CARD_H);
  return { cardW, cardH };
}

export default function RoundTransition({ completedRound, nextRound, bracketSize, matchResults }: Props) {
  const t = useTranslation();
  const dotOpacity = useSharedValue(0.3);

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

  const winners = useMemo(
    () => matchResults.filter((m) => m.roundNumber === completedRound).map((m) => m.winner),
    [matchResults, completedRound]
  );

  useEffect(() => {
    const posterPaths = winners.map((w) => w.poster_path).filter(Boolean);
    if (posterPaths.length) {
      prefetchThumbnails(posterPaths, ['xlarge', 'large']);
    }
  }, [winners]);

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

  const n = winners.length;
  const { cardW, cardH } = getCardSize(n);
  const step = Math.round(cardW * 0.55);
  const deckW = n > 1 ? (n - 1) * step + cardW : cardW;
  const maxRot = n <= 2 ? 8 : n <= 4 ? 18 : 28;
  const arcDrop = n <= 2 ? 8 : n <= 4 ? 20 : 48;
  const deckH = cardH + arcDrop;
  const thumbnailSize = cardW > 200 ? ThumbnailSizes.poster.xlarge : ThumbnailSizes.poster.large;

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

      <View style={{ width: deckW, height: deckH }}>
        {winners.map((movie, i) => {
          const frac = n > 1 ? (i - (n - 1) / 2) / ((n - 1) / 2) : 0;
          const rot = Math.sign(frac) * frac * frac * maxRot;
          const x = n > 1 ? (i - (n - 1) / 2) * step : 0;
          const y = arcDrop * frac * frac;
          const zIndex = n - Math.abs(Math.round(i - (n - 1) / 2));

          const xAnim = useSharedValue(0);
          const yAnim = useSharedValue(0);
          const rotAnim = useSharedValue(0);

          useEffect(() => {
            xAnim.value = withDelay(120, withTiming(x, { duration: 480, easing: Easing.out(Easing.cubic) }));
            yAnim.value = withDelay(120, withTiming(y, { duration: 480, easing: Easing.out(Easing.cubic) }));
            rotAnim.value = withDelay(120, withTiming(rot, { duration: 480, easing: Easing.out(Easing.cubic) }));
          }, []);

          const animStyle = useAnimatedStyle(() => ({
            transform: [{ translateX: xAnim.value }, { translateY: yAnim.value }, { rotate: `${rotAnim.value}deg` }],
          }));

          return (
            <Animated.View
              key={movie.id}
              style={[styles.cardEnterWrap, { left: deckW / 2 - cardW / 2, top: 0, zIndex }, animStyle]}
            >
              <View
                style={[
                  styles.card,
                  { width: cardW, height: cardH },
                ]}
              >
                <Thumbnail
                  path={movie.poster_path}
                  size={thumbnailSize}
                  container={{ width: cardW, height: cardH, borderRadius: radius.md }}
                  style={{ width: cardW, height: cardH, borderRadius: radius.md }}
                />
                <View style={styles.trophyBadge}>
                  <MaterialCommunityIcons name="trophy" size={11} color={colors.appBackground} />
                </View>
              </View>
            </Animated.View>
          );
        })}
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
    gap: spacing.xl + spacing.lg,
  },
  header: {
    alignItems: "center",
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
  cardEnterWrap: {
    position: "absolute",
  },
  card: {
    borderRadius: radius.md,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 8,
  },
  trophyBadge: {
    position: "absolute",
    top: spacing.xs,
    right: spacing.xs,
    width: 22,
    height: 22,
    borderRadius: radius.pill,
    backgroundColor: "#FFD166",
    alignItems: "center",
    justifyContent: "center",
  },
  footer: {
    alignItems: "center",
    gap: spacing.xs,
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
