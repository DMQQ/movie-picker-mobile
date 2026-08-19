import { MaterialCommunityIcons } from "@expo/vector-icons";
import Text from "../../components/Text";
import {
  colors,
  fontWeight,
  fontSize,
  radius,
  spacing,
  withAlpha,
} from "../../constants/design";
import { LinearGradient } from "expo-linear-gradient";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";

import SegmentedControl from "../../components/SegmentedControl";
import SafeIOSContainer from "../../components/SafeIOSContainer";
import useTranslation from "../../service/useTranslation";
import { Link, router } from "expo-router";
import Animated, { FadeInDown } from "react-native-reanimated";
import FortuneWheelAnimation from "../../components/GameListAnimations/FortuneWheelAnimation";
import SwiperAnimation from "../../components/GameListAnimations/SwipeAnimation";
import VoterAnimation from "../../components/GameListAnimations/VoterAnimation";
import RandomMovieAnimation from "../../components/GameListAnimations/RandomMovieAnimation";
import EitherOrAnimation from "../../components/GameListAnimations/EitherOrAnimation";
import PageHeading from "../../components/PageHeading";
import { useUnviewedMatches } from "../../hooks/useUnviewedMatches";
import Touch from "../../components/Touch";
import ActiveGameBanner from "../../components/ActiveGameBanner";
import { TourAttachStep } from "../../components/Tour/TourAttachStep";
import { TourProvider } from "../../components/Tour/TourProvider";
import { type TourRef, type TourStep } from "../../components/Tour/TourContext";
import TutorialTooltip from "../../components/TutorialTooltip";
import { useTutorialSeen } from "../../hooks/useTutorial";
import PlatformBlurView from "../../components/PlatformBlurView";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { posthog } from "../../constants/posthog";

const CARD_HEIGHT = 260;
const CARD_HEIGHT_FEATURED = 310;
const CARD_GAP = 24;

interface GameCardProps {
  title: string;
  description: string;
  href: string;
  beta?: boolean;
  players?: string;
  duration?: string;
  index: number;
  badge?: string;
  badgeColor?: string;
  highlight?: string;
  featured?: boolean;
}

const Animations = [
  <SwiperAnimation />,
  <VoterAnimation />,
  <FortuneWheelAnimation />,
  <RandomMovieAnimation />,
  <EitherOrAnimation />,
];

const GameCard = ({
  title,
  description,
  href,
  players,
  duration,
  index,
  badge,
  badgeColor,
  highlight,
  featured,
}: GameCardProps) => {
  const cardHeight = featured ? CARD_HEIGHT_FEATURED : CARD_HEIGHT;
  return (
    <Animated.View
      style={[styles.cardContainer]}
      exiting={FadeInDown.delay((index + 1) * 75)}
    >
      <Link href={href as any} asChild>
        <Touch onPress={() => posthog?.capture("game_mode_selected", { game: href })}>
          <View style={[styles.card, { height: cardHeight }, featured && { borderWidth: 1.5, borderColor: `${badgeColor ?? colors.primary}66` }]}>
            {Animations[index]}

            {badge && (
              <View style={[styles.badgeChip, { backgroundColor: badgeColor ?? colors.primary }]}>
                {featured && (
                  <MaterialCommunityIcons name="crown" size={11} color={colors.text} />
                )}
                <Text style={styles.badgeText}>{badge}</Text>
              </View>
            )}

            <LinearGradient
              colors={["transparent", colors.appBackground]}
              style={styles.cardGradient}
            >
              <View style={styles.cardContent}>
                <Text
                  style={styles.cardTitle}
                  numberOfLines={2}
                  textBreakStrategy="highQuality"
                >
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
      </Link>
    </Animated.View>
  );
};

export default function GameList() {
  const t = useTranslation();
  useUnviewedMatches();

  const tourRef = useRef<TourRef>(null);
  const scrollRef = useRef<ScrollView>(null);
  const { seen, markSeen } = useTutorialSeen("tutorial_home_seen");
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (seen === false) {
      const timer = setTimeout(() => tourRef.current?.start(), 300);
      return () => clearTimeout(timer);
    }
  }, [seen]);

  const scrollTo = useCallback(
    (y: number) =>
      new Promise<void>((resolve) => {
        scrollRef.current?.scrollTo({ y, animated: true });
        setTimeout(resolve, 380);
      }),
    [],
  );

  const steps = useMemo<TourStep[]>(
    () => [
      {
        render: (props) => (
          <TutorialTooltip
            {...props}
            title={t("tutorial.swipe.title") as string}
            description={t("tutorial.swipe.description") as string}
          />
        ),
        spotRadius: 16,
        placement: "bottom",
      },
      {
        render: (props) => (
          <TutorialTooltip
            {...props}
            title={t("tutorial.fortune.title") as string}
            description={t("tutorial.fortune.description") as string}
          />
        ),
        spotRadius: 16,
        placement: "bottom",
        before: () => scrollTo(CARD_HEIGHT + CARD_GAP - 40),
      },
      {
        render: (props) => (
          <TutorialTooltip
            {...props}
            title={t("tutorial.random.title") as string}
            description={t("tutorial.random.description") as string}
          />
        ),
        spotRadius: 16,
        placement: "top",
        before: () => scrollTo(2 * (CARD_HEIGHT + CARD_GAP) - 40),
      },
      {
        render: (props) => (
          <TutorialTooltip
            {...props}
            title={t("tutorial.voter.title") as string}
            description={t("tutorial.voter.description") as string}
          />
        ),
        spotRadius: 16,
        placement: "top",
        before: () => scrollTo(3 * (CARD_HEIGHT + CARD_GAP)),
      },
      {
        render: (props) => (
          <TutorialTooltip
            {...props}
            title={t("tutorial.join.title") as string}
            description={t("tutorial.join.description") as string}
          />
        ),
        spotRadius: 100,
        placement: "bottom",
        before: () => scrollTo(0),
      },
    ],
    [scrollTo, t],
  );

  const games = useMemo(
    () => [
      {
        title: t("games.voter.swipe"),
        description: t("games.voter.swipeDescription"),
        href: "/room/setup",
        players: "1-8",
        duration: "~1 min",
        index: 0,
        badge: t("games.voter.swipeBadge") as string,
        badgeColor: colors.primary,
        highlight: t("games.voter.swipeHighlight") as string,
        featured: true,
      },
      {
        title: t("games.fortunewheel.title"),
        description: t("games.fortunewheel.description"),
        href: "/fortune",
        players: "1",
        duration: "< 1 min",
        index: 2,
        badge: t("games.fortunewheel.badge") as string,
        badgeColor: "#F59E0B",
        highlight: t("games.fortunewheel.highlight") as string,
        featured: true,
      },
      {
        title: t("games.random.title"),
        description: t("games.random.description"),
        href: "/random",
        players: "1",
        duration: "< 1 min",
        index: 3,
        badge: t("games.random.badge") as string,
        badgeColor: "#22C55E",
        highlight: t("games.random.highlight") as string,
      },
      {
        title: t("games.voter.title"),
        description: t("games.voter.description"),
        href: "/voter",
        beta: true,
        players: "2",
        duration: "~3 min",
        index: 1,
        badge: t("games.voter.badge") as string,
        badgeColor: "#8B5CF6",
        highlight: t("games.voter.highlight") as string,
      },
      {
        title: t("games.eitherOr.title"),
        description: t("games.eitherOr.description"),
        href: "/either-or/setup",
        beta: true,
        players: "1-8",
        duration: "2-5 min",
        index: 4,
        badge: t("games.eitherOr.badge") as string,
        badgeColor: colors.error,
        highlight: t("games.eitherOr.highlight") as string,
      },
    ],
    [t],
  );

return (
    <TourProvider ref={tourRef} steps={steps} onStop={markSeen}>
      <SafeIOSContainer
        style={{
          flex: 1,
          backgroundColor: colors.appBackground,
          paddingBottom: 0,
        }}
      >
        <PageHeading
          title={t("voter.games") as string}
          showBackButton={false}
          showRightIconButton={false}
          rightIconTitle={t("scanner.button") as string}
          extraScreenPaddingTop={Platform.OS === "android" ? 0 : 0}
        >
          <TourAttachStep index={4}>
            <PlatformBlurView interactive style={styles.qrButtonContainer}>
              <Pressable
                onPress={() => router.push("/qr-scanner")}
                style={styles.qrButton}
              >
                <MaterialCommunityIcons name="camera" size={20} color={colors.text} style={styles.qrIcon} />
                <Text style={styles.qrButtonText}>{t("scanner.button")}</Text>
              </Pressable>
            </PlatformBlurView>
          </TourAttachStep>
        </PageHeading>

        <ScrollView
          ref={scrollRef}
          style={[
            styles.container,
            Platform.OS === "android" && { marginTop: spacing.xxl + 6 },
          ]}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingTop: spacing.xl * 3,
            paddingBottom: insets.bottom,
          }}
        >
          <ActiveGameBanner />
          {games.map((game, arrayIndex) => (
            <TourAttachStep
              key={game.index}
              index={arrayIndex}
              fill
              style={{ marginBottom: CARD_GAP }}
            >
              <GameCard
                index={game.index}
                title={game.title as string}
                description={game.description as string}
                href={game.href}
                beta={game.beta}
                players={game.players}
                duration={game.duration}
                badge={game.badge}
                badgeColor={game.badgeColor}
                highlight={game.highlight}
                featured={(game as any).featured}
              />
            </TourAttachStep>
          ))}
        </ScrollView>
      </SafeIOSContainer>
    </TourProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: spacing.screen,
    paddingTop: spacing.screen,
  },
  header: {
    paddingBottom: spacing.screen,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTop: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.lg,
    paddingHorizontal: spacing.sm,
    position: "relative",
  },
  backButton: {
    marginRight: spacing.sm,
    position: "absolute",
    left: 8,
    zIndex: 1,
  },
  headerTitle: {
    fontFamily: "Bebas",
    fontSize: 32,
    color: colors.text,
    flex: 1,
    textAlign: "center",
    marginLeft: spacing.xxl + 16,
    marginRight: spacing.xxl + 16,
  },
  modeChipsRow: {
    marginBottom: spacing.lg,
  },
  cardContainer: {
    borderRadius: radius.card,
    overflow: "hidden",
  },

  card: {
    borderRadius: radius.card,
    overflow: "hidden",
  },
  cardImage: {
    width: "100%",
    height: "100%",
  },
  cardGradient: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  cardContent: {
    paddingHorizontal: spacing.screen,
    paddingVertical: spacing.md,
  },
  cardTitle: {
    fontFamily: "Bebas",
    fontSize: fontSize.display,
    color: colors.text,
  },
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
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  metaText: {
    color: "rgba(255,255,255,0.65)",
    fontSize: fontSize.sm,
  },
  metaDot: {
    color: "rgba(255,255,255,0.35)",
    fontSize: fontSize.sm,
  },
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
  highlightRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    marginTop: spacing.xs,
  },
  highlightText: {
    fontSize: 11,
    fontWeight: fontWeight.semibold,
  },
  qrButtonContainer: {
    borderRadius: radius.pill,
    overflow: "hidden",
  },
  qrButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  qrIcon: {},
  qrButtonText: {
    color: colors.text,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
  },
});
