import { Link } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { View, StyleSheet, Pressable } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import Text from "./Text";
import Touch from "./Touch";
import {
  colors,
  fontSize,
  fontWeight,
  radius,
  spacing,
} from "../constants/design";
import FortuneWheelAnimation from "./GameListAnimations/FortuneWheelAnimation";
import SwiperAnimation from "./GameListAnimations/SwipeAnimation";
import VoterAnimation from "./GameListAnimations/VoterAnimation";
import RandomMovieAnimation from "./GameListAnimations/RandomMovieAnimation";
import EitherOrAnimation from "./GameListAnimations/EitherOrAnimation";
import { posthog } from "../constants/posthog";

export const CARD_HEIGHT = 260;
export const CARD_HEIGHT_FEATURED = 310;

const Animations = [
  <SwiperAnimation />,
  <VoterAnimation />,
  <FortuneWheelAnimation />,
  <RandomMovieAnimation />,
  <EitherOrAnimation />,
];

export interface GameCardProps {
  title: string;
  description: string;
  href?: string;
  onPress?: () => void;
  players?: string;
  duration?: string;
  index: number;
  badge?: string;
  badgeColor?: string;
  highlight?: string;
  featured?: boolean;
  beta?: boolean;
  compact?: boolean;
  small?: boolean;
}

export default function GameCard({
  title,
  description,
  href,
  onPress,
  players,
  duration,
  index,
  badge,
  badgeColor,
  highlight,
  featured,
  compact,
  small,
}: GameCardProps) {
  if (compact) {
    return (
      <Pressable
        style={({ pressed }) => [styles.compactCard, pressed && styles.pressed]}
        onPress={onPress}
      >
        <View style={[styles.compactAccent, { backgroundColor: badgeColor ?? colors.primary }]} />
        <View style={[styles.compactAnimWrap, { backgroundColor: (badgeColor ?? colors.primary) + "22" }]}>
          {Animations[index]}
        </View>
        <View style={styles.compactText}>
          <Text style={styles.compactTitle}>{title}</Text>
          <Text style={styles.compactDesc}>{description}</Text>
        </View>
        <MaterialCommunityIcons name="chevron-right" size={22} color={colors.placeholder} />
      </Pressable>
    );
  }

  const cardHeight = (featured ? CARD_HEIGHT_FEATURED : CARD_HEIGHT) * (small ? 0.65 : 1);
  const touchable = (
    <Touch onPress={() => { posthog?.capture("game_mode_selected", { game: href ?? null }); onPress?.(); }}>
      <View
        style={[
          styles.card,
          { height: cardHeight },
          featured && { borderWidth: 1.5, borderColor: `${badgeColor ?? colors.primary}66` },
        ]}
      >
        {Animations[index]}

        {badge && (
          <View style={[styles.badgeChip, { backgroundColor: badgeColor ?? colors.primary }]}>
            {featured && <MaterialCommunityIcons name="crown" size={11} color={colors.text} />}
            <Text style={styles.badgeText}>{badge}</Text>
          </View>
        )}

        <LinearGradient
          colors={["transparent", colors.appBackground]}
          style={styles.cardGradient}
        >
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle} numberOfLines={2} textBreakStrategy="highQuality">
              {title}
            </Text>
            <Text style={styles.cardDescription}>{description}</Text>
            {highlight && (
              <View style={styles.highlightRow}>
                <MaterialCommunityIcons
                  name="lightning-bolt"
                  size={11}
                  color={badgeColor ?? colors.primary}
                />
                <Text style={[styles.highlightText, { color: badgeColor ?? colors.primary }]}>
                  {highlight}
                </Text>
              </View>
            )}
            <View style={styles.cardMeta}>
              {players && (
                <View style={styles.metaItem}>
                  <MaterialCommunityIcons
                    name="account-group"
                    size={13}
                    color="rgba(255,255,255,0.65)"
                  />
                  <Text style={styles.metaText}>{players}</Text>
                </View>
              )}
              {players && duration && <Text style={styles.metaDot}>·</Text>}
              {duration && (
                <View style={styles.metaItem}>
                  <MaterialCommunityIcons
                    name="clock-outline"
                    size={13}
                    color="rgba(255,255,255,0.65)"
                  />
                  <Text style={styles.metaText}>{duration}</Text>
                </View>
              )}
            </View>
          </View>
        </LinearGradient>
      </View>
    </Touch>
  );

  return (
    <Animated.View style={styles.cardContainer} exiting={FadeInDown.delay((index + 1) * 75)}>
      {href ? <Link href={href as any} asChild>{touchable}</Link> : touchable}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  // full card
  cardContainer: { borderRadius: radius.card, overflow: "hidden" },
  card: { borderRadius: radius.card, overflow: "hidden" },
  cardGradient: { position: "absolute", bottom: 0, left: 0, right: 0, zIndex: 10 },
  cardContent: { paddingHorizontal: spacing.screen, paddingVertical: spacing.md },
  cardTitle: { fontFamily: "Bebas", fontSize: fontSize.display, color: colors.text },
  cardDescription: {
    color: "rgba(255,255,255,0.7)",
    fontSize: fontSize.md,
    lineHeight: 18,
    marginTop: spacing.xs - 2,
  },
  cardMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm - 2,
    marginTop: spacing.sm,
  },
  metaItem: { flexDirection: "row", alignItems: "center", gap: spacing.xs },
  metaText: { color: "rgba(255,255,255,0.65)", fontSize: fontSize.sm },
  metaDot: { color: "rgba(255,255,255,0.35)", fontSize: fontSize.sm },
  badgeChip: {
    position: "absolute",
    top: spacing.md,
    left: spacing.md,
    zIndex: 20,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 3,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  badgeText: {
    color: colors.text,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    letterSpacing: 0.4,
    textTransform: "uppercase",
  },
  highlightRow: { flexDirection: "row", alignItems: "center", gap: 3, marginTop: spacing.xs },
  highlightText: { fontSize: 11, fontWeight: fontWeight.semibold },

  // compact card
  compactCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: radius.card,
    overflow: "hidden",
    gap: spacing.md,
    paddingRight: spacing.lg,
  },
  pressed: { opacity: 0.7 },
  compactAccent: { width: 4, alignSelf: "stretch" },
  compactAnimWrap: {
    width: 64,
    height: 64,
    borderRadius: radius.sm,
    overflow: "hidden",
    marginVertical: spacing.md,
  },
  compactText: { flex: 1, gap: 3 },
  compactTitle: {
    fontFamily: "Bebas",
    fontSize: fontSize.xl,
    letterSpacing: 0.5,
    color: colors.text,
  },
  compactDesc: { fontSize: fontSize.sm, color: colors.placeholder, lineHeight: 17 },
});
