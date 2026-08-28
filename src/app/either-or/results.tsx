import { useEffect, useRef, useState } from "react";
import { BackHandler, LayoutChangeEvent, ScrollView, StyleSheet, View } from "react-native";
import LottieView from "lottie-react-native";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, { FadeIn } from "react-native-reanimated";
import Text from "../../components/Text";
import AnimatedBg from "../../components/GameSummary/AnimatedBgClassic";
import Podium from "../../components/EitherOr/Podium";
import Bracket, { computeBracketFitScale } from "../../components/EitherOr/Bracket";
import { FancySpinner } from "../../components/FancySpinner";
import CreateCollectionFromLiked from "../../components/CreateCollectionFromLiked";
import UserAvatar from "../../components/UserAvatar";
import { usePartyGameFlow } from "../../hooks/usePartyGameFlow";
import { useAppDispatch, useAppSelector } from "../../redux/store";
import { eitherOrActions } from "../../redux/eitherOr/eitherOrSlice";
import { roomActions } from "../../redux/room/roomSlice";
import { partyActions } from "../../redux/party/partySlice";
import SummaryFooter from "../../components/SummaryFooter";
import useTranslation from "../../service/useTranslation";
import ReviewManager from "../../utils/rate";
import { colors, fontSize, radius, spacing, typography, withAlpha } from "../../constants/design";
import { posthog } from "../../constants/posthog";

export default function EitherOrResults() {
  const t = useTranslation();
  const dispatch = useAppDispatch();
  const insets = useSafeAreaInsets();
  const top3 = useAppSelector((state) => state.eitherOr.top3);
  const champion = useAppSelector((state) => state.eitherOr.champion);
  const bracketSize = useAppSelector((state) => state.eitherOr.bracketSize);
  const matchResults = useAppSelector((state) => state.eitherOr.matchResults);
  const myUserId = useAppSelector((state) => state.app.userId);
  const roomId = useAppSelector((state) => state.eitherOr.roomId);
  const users = useAppSelector((state) => state.eitherOr.users);
  const players = useAppSelector((state) => state.eitherOr.players);
  const history = useAppSelector((state) => state.eitherOr.history);
  const isHost = useAppSelector((state) => state.eitherOr.isHost);

  const displayPlayers = players.length > 0 ? players : users.map((u) => ({ userId: u.userId, username: u.username }));

  const agreeScore = (userId: string): number | null => {
    const voted = history.filter((h) => h.votes?.[userId] !== undefined);
    if (voted.length === 0) return null;
    const agreed = voted.filter((h) => h.votes[userId] === h.winnerSide);
    return agreed.length / voted.length;
  };

  const confettiRef = useRef<LottieView>(null);
  const [bracketCardWidth, setBracketCardWidth] = useState(0);
  const onBracketLayout = (e: LayoutChangeEvent) => setBracketCardWidth(e.nativeEvent.layout.width);
  const totalRounds = Math.log2(bracketSize);
  // Fit all rounds to card width; pass Infinity for height so only width constrains the scale.
  const bracketScale = bracketCardWidth > 0 ? computeBracketFitScale(bracketSize, totalRounds, bracketCardWidth, Infinity) : 1;

  useEffect(() => {
    if (top3.length) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      confettiRef.current?.play();
    }
  }, [top3.length]);

  const onDone = () => {
    ReviewManager.onGameComplete(true);
    dispatch(eitherOrActions.reset());
    router.dismissTo("/");
  };

  useEffect(() => {
    const sub = BackHandler.addEventListener("hardwareBackPress", () => {
      onDone();
      return true;
    });
    return () => sub.remove();
  }, []);

  const configuring = usePartyGameFlow(isHost, (mode) => {
    if (mode === "voter") {
      router.navigate("/voter" as any);
    } else if (mode === "either-or") {
      dispatch(eitherOrActions.reset());
      router.replace("/either-or/setup" as any);
    } else if (mode === "swipe") {
      dispatch(roomActions.reset());
      dispatch(partyActions.setSwipeFromParty(true));
      router.navigate("/room/setup" as any);
    }
  });

  if (!top3.length) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", gap: spacing.screen, backgroundColor: colors.appBackground }}>
        <FancySpinner />
        <Text>{t("eitherOr.results.loading")}</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.appBackground }}>
      <AnimatedBg matchedMovies={top3} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: spacing.screen, paddingTop: insets.top, paddingBottom: insets.bottom + spacing.xxl * 3 }}
      >
        <Animated.View entering={FadeIn.duration(400)} style={styles.header}>
          <Text style={styles.eyebrow}>{t("eitherOr.results.title")}</Text>
          <Text style={styles.headline}>{champion?.title || champion?.name}</Text>
        </Animated.View>

        <Podium top3={top3} />

        {displayPlayers.length > 1 && (
          <View style={styles.playersSection}>
            <Text style={styles.sectionTitle}>Players</Text>
            <View style={styles.playersList}>
              {displayPlayers.map((player) => {
                const isMe = player.userId === myUserId;
                const score = !isMe ? agreeScore(player.userId) : null;
                return (
                  <View
                    key={player.userId}
                    style={[styles.playerRow, isMe && styles.playerRowMe]}
                  >
                    <UserAvatar name={player.username || "?"} size={36} />
                    <View style={styles.playerInfo}>
                      <Text style={styles.playerName}>{player.username}</Text>
                      {score !== null && (
                        <Text style={styles.playerScore}>{Math.round(score * 100)}% agree</Text>
                      )}
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        <View style={styles.bracketSection}>
          <Text style={styles.sectionTitle}>{t("eitherOr.bracket.title")}</Text>
          <View style={styles.bracketCard} onLayout={onBracketLayout}>
            <Bracket bracketSize={bracketSize} matchResults={matchResults} currentMatch={null} champion={champion} scale={bracketScale} />
          </View>
        </View>
      </ScrollView>

      <LottieView
        ref={confettiRef}
        source={require("../../assets/confetti.json")}
        autoPlay={false}
        loop={false}
        style={styles.confetti}
        pointerEvents="none"
      />

      <SummaryFooter
        isHost={isHost}
        onQuit={onDone}
        configuring={configuring}
        playAgainFrom="either-or"
        posthogGame="either-or"
        guestPrimaryLabel={t("eitherOr.results.done") as string}
        guestSecondary={<CreateCollectionFromLiked data={top3} />}
        id={roomId}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: "center",
    marginBottom: spacing.xl,
  },
  eyebrow: {
    fontSize: fontSize.sm,
    color: colors.placeholder,
    letterSpacing: 2,
    textTransform: "uppercase",
  },
  headline: {
    fontFamily: "Bebas",
    fontSize: typography.bebasSize.empty,
    color: colors.text,
    textAlign: "center",
    marginTop: spacing.xs,
  },
  playersSection: {
    marginTop: spacing.xxl,
  },
  playersList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  playerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: withAlpha(colors.surface, 0.8),
    borderRadius: radius.pill,
    paddingVertical: spacing.xs,
    paddingLeft: spacing.xs,
    paddingRight: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  playerRowMe: {
    backgroundColor: withAlpha(colors.primary, 0.12),
    borderColor: withAlpha(colors.primary, 0.4),
  },
  playerInfo: {
    flexDirection: "column",
  },
  playerName: {
    fontSize: fontSize.md,
    color: colors.text,
  },
  playerScore: {
    fontSize: fontSize.xs,
    color: colors.placeholder,
  },
  bracketSection: {
    marginTop: spacing.xxl,
  },
  sectionTitle: {
    fontSize: typography.bebasSize.section,
    fontFamily: "Bebas",
    color: colors.text,
    marginBottom: spacing.md,
  },
  bracketCard: {
    overflow: "hidden",
  },
  confetti: {
    ...StyleSheet.absoluteFill,
    zIndex: 10,
    pointerEvents: "none",
  },
});
