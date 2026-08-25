import LottieView from "lottie-react-native";
import Text from "../Text";
import { colors, fontWeight, fontSize, spacing } from "../../constants/design";
import { StyleSheet, View } from "react-native";
import useTranslation from "../../service/useTranslation";

interface Props {
  gameEndReason?: string;
  maxRounds?: number;
  type?: string;
  roomId?: string;
  hasMatches: boolean;
  matchCount?: number;
}

export default function GameSummaryHeader({
  gameEndReason,
  maxRounds,
  type,
  roomId,
  hasMatches,
  matchCount = 0,
}: Props) {
  const t = useTranslation();
  const title = (() => {
    if (!hasMatches) return "SO CLOSE...";
    if (matchCount >= 5) return "MOVIE MARATHON!";
    if (matchCount >= 3) return "GREAT TASTE!";
    if (matchCount === 2) return "DOUBLE FEATURE!";
    return "MATCH MADE!";
  })();

  const subtitle = hasMatches
    ? `${matchCount} film${matchCount !== 1 ? "s" : ""} locked in for tonight`
    : "keep swiping — the perfect film is out there";

  const meta = [
    subtitle,
    maxRounds != null ? `${maxRounds} rounds` : null,
    type === "movie" ? t("game-summary.movies") as string : type ? t("game-summary.tv-shows") as string : null,
  ]
    .filter(Boolean)
    .join("  ·  ");

  return (
    <View style={styles.section}>
      {hasMatches && (
        <LottieView
          source={require("../../assets/confetti.json")}
          autoPlay
          loop={false}
          style={styles.confetti}
        />
      )}
      <Text style={styles.title}>{title}</Text>
      {meta ? <Text style={styles.meta}>{meta}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  section: { gap: spacing.xs },
  title: {
    fontSize: 62,
    fontFamily: "Bebas",
    color: colors.text,
    letterSpacing: 1.5,
    textShadowColor: "rgba(0,0,0,0.9)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
    lineHeight: 64,
  },
  meta: {
    fontSize: fontSize.sm,
    color: "rgba(255,255,255,0.6)",
    fontWeight: fontWeight.medium,
    letterSpacing: 0.3,
  },
  confetti: { ...StyleSheet.absoluteFill, zIndex: 10 },
});
