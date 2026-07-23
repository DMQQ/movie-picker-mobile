import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useCallback, useEffect, useMemo, useRef } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { IconButton, Text } from "react-native-paper";
import SafeIOSContainer from "../../components/SafeIOSContainer";
import useTranslation from "../../service/useTranslation";
import { Link, router } from "expo-router";
import Animated, { FadeInDown } from "react-native-reanimated";
import FortuneWheelAnimation from "../../components/GameListAnimations/FortuneWheelAnimation";
import SwiperAnimation from "../../components/GameListAnimations/SwipeAnimation";
import VoterAnimation from "../../components/GameListAnimations/VoterAnimation";
import RandomMovieAnimation from "../../components/GameListAnimations/RandomMovieAnimation";
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

const CARD_HEIGHT = 280;
const CARD_GAP = 24;

interface GameCardProps {
  title: string;
  description: string;
  href: string;
  beta?: boolean;
  players?: string;
  duration?: string;
  index: number;
}

const Animations = [
  <SwiperAnimation />,
  <VoterAnimation />,
  <FortuneWheelAnimation />,
  <RandomMovieAnimation />,
];

const GameCard = ({
  title,
  description,
  href,
  players,
  duration,
  index,
}: GameCardProps) => {
  return (
    <Animated.View
      style={styles.cardContainer}
      exiting={FadeInDown.delay((index + 1) * 75)}
    >
      <Link href={href as any} asChild>
        <Touch>
          <View style={styles.card}>
            {Animations[index]}

            <LinearGradient
              colors={["transparent", "rgba(0,0,0,0.85)"]}
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
                <View style={styles.cardMeta}>
                  {players && (
                    <View style={styles.metaItem}>
                      <MaterialCommunityIcons
                        name="account-group"
                        size={12}
                        color="rgba(255,255,255,0.5)"
                      />
                      <Text style={styles.metaText}>{players}</Text>
                    </View>
                  )}
                  {players && duration && <Text style={styles.metaDot}>·</Text>}
                  {duration && (
                    <View style={styles.metaItem}>
                      <MaterialCommunityIcons
                        name="clock-outline"
                        size={12}
                        color="rgba(255,255,255,0.5)"
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
        duration: "3-10m",
        index: 0,
      },
      {
        title: t("games.fortunewheel.title"),
        description: t("games.fortunewheel.description"),
        href: "/fortune",
        players: "1",
        duration: "1m",
        index: 2,
      },
      {
        title: t("games.random.title"),
        description: t("games.random.description"),
        href: "/random",
        players: "1",
        duration: "< 1m",
        index: 3,
      },
      {
        title: t("games.voter.title"),
        description: t("games.voter.description"),
        href: "/voter",
        beta: true,
        players: "2",
        duration: "5-10 min",
        index: 1,
      },
    ],
    [t],
  );

  return (
    <TourProvider ref={tourRef} steps={steps} onStop={markSeen}>
      <SafeIOSContainer
        style={{ flex: 1, backgroundColor: "#000", paddingBottom: 0 }}
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
                <IconButton icon="camera" size={20} iconColor="white" />
                <Text style={styles.qrButtonText}>{t("scanner.button")}</Text>
              </Pressable>
            </PlatformBlurView>
          </TourAttachStep>
        </PageHeading>

        <ScrollView
          ref={scrollRef}
          style={[
            styles.container,
            Platform.OS === "android" && { marginTop: 30 },
          ]}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingTop: 60,
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
    paddingHorizontal: 15,
    paddingTop: 15,
  },
  header: {
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.1)",
  },
  headerTop: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    paddingHorizontal: 8,
    position: "relative",
  },
  backButton: {
    marginRight: 8,
    position: "absolute",
    left: 8,
    zIndex: 1,
  },
  headerTitle: {
    fontFamily: "Bebas",
    fontSize: 32,
    color: "#fff",
    flex: 1,
    textAlign: "center",
    marginLeft: 40,
    marginRight: 40,
  },
  categoriesContainer: {
    marginTop: 8,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.1)",
    marginRight: 8,
  },
  categoryChipActive: {
    backgroundColor: "#fff",
  },
  categoryText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  categoryTextActive: {
    color: "#000",
  },
  cardContainer: {
    borderRadius: 16,
    overflow: "hidden",
  },
  card: {
    height: CARD_HEIGHT,
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "#1a1a1a",
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
    paddingHorizontal: 15,
    paddingVertical: 12,
  },
  cardTitle: {
    fontFamily: "Bebas",
    fontSize: 28,
    color: "#fff",
  },
  cardDescription: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 13,
    lineHeight: 18,
    marginTop: 2,
  },
  cardMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 8,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  metaText: {
    color: "rgba(255,255,255,0.45)",
    fontSize: 12,
  },
  metaDot: {
    color: "rgba(255,255,255,0.25)",
    fontSize: 12,
  },
  qrButtonContainer: {
    borderRadius: 100,
    overflow: "hidden",
  },
  qrButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  qrButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    paddingRight: 10,
  },
});
