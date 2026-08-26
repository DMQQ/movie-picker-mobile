import { MaterialCommunityIcons } from "@expo/vector-icons";
import Text from "../../components/Text";
import {
  colors,
  fontWeight,
  fontSize,
  radius,
  spacing,
} from "../../constants/design";
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
import { router } from "expo-router";
import PageHeading from "../../components/PageHeading";
import { useUnviewedMatches } from "../../hooks/useUnviewedMatches";
import ActiveGameBanner from "../../components/ActiveGameBanner";
import { TourAttachStep } from "../../components/Tour/TourAttachStep";
import { TourProvider } from "../../components/Tour/TourProvider";
import { type TourRef, type TourStep } from "../../components/Tour/TourContext";
import TutorialTooltip from "../../components/TutorialTooltip";
import { useTutorialSeen, useMarkAllTutorialsSeen } from "../../hooks/useTutorial";
import PlatformBlurView from "../../components/PlatformBlurView";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import GameCard, { CARD_HEIGHT } from "../../components/GameCard";

const CARD_GAP = 24;


export default function GameList() {
  const t = useTranslation();
  useUnviewedMatches();

  const tourRef = useRef<TourRef>(null);
  const scrollRef = useRef<ScrollView>(null);
  const { seen, markSeen } = useTutorialSeen("tutorial_home_seen");
  const markAllSeen = useMarkAllTutorialsSeen();
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
        players: "1-10",
        duration: t("games.duration-short"),
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
        duration: t("games.duration-instant"),
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
        duration: t("games.duration-instant"),
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
        players: "1+",
        duration: t("games.duration-medium"),
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
        players: "1-10",
        duration: t("games.duration-long"),
        index: 4,
        badge: t("games.eitherOr.badge") as string,
        badgeColor: colors.error,
        highlight: t("games.eitherOr.highlight") as string,
      },
    ],
    [t],
  );

return (
    <TourProvider ref={tourRef} steps={steps} onStop={markSeen} onSkippedFirst={markAllSeen}>
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
