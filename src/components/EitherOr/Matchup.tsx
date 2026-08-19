import { useEffect, useState } from "react";
import { LayoutChangeEvent, StyleSheet, View } from "react-native";
import Animated, { Easing, FadeIn, FadeInLeft, FadeInRight, useAnimatedStyle, useSharedValue, withRepeat, withSequence, withTiming } from "react-native-reanimated";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Text from "../Text";
import Portal from "../Portal";
import MatchupCard from "./MatchupCard";
import CountdownBar from "./CountdownBar";
import RoundPips from "./RoundPips";
import ActivePlayers from "./ActivePlayers";
import AvatarText from "../AvatarText";
import TieOverlay from "./TieOverlay";
import useEitherOrContext from "../../context/EitherOrContext";
import { useAppSelector } from "../../redux/store";
import useTranslation from "../../service/useTranslation";
import { colors, fontSize, fontWeight, radius, spacing, typography, withAlpha } from "../../constants/design";
import { getUserAvatarColor } from "../../utils/avatar";
import type { Side } from "../../redux/eitherOr/eitherOrSlice";

export default function Matchup() {
  const t = useTranslation();
  const { vote } = useEitherOrContext();
  const currentMatch = useAppSelector((state) => state.eitherOr.currentMatch);
  const tally = useAppSelector((state) => state.eitherOr.tally);
  const votedUserIds = useAppSelector((state) => state.eitherOr.votedUserIds);
  const users = useAppSelector((state) => state.eitherOr.users);
  const votedSide = useAppSelector((state) => state.eitherOr.votedSide);
  const lastResult = useAppSelector((state) => state.eitherOr.lastResult);

  const isRevealing =
    !!lastResult &&
    !!currentMatch &&
    lastResult.roundNumber === currentMatch.roundNumber &&
    lastResult.matchIndex === currentMatch.matchIndex;

  const [duelSize, setDuelSize] = useState({ width: 0, height: 0 });
  const onDuelLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setDuelSize({ width, height });
  };

  // onLayout reports the duel View's border-box size, so its own padding must be
  // subtracted to get the content box the cards actually have to fit in.
  const contentWidth = duelSize.width > 0 ? duelSize.width - spacing.sm * 2 : 0;
  const cardWidth = contentWidth > 0 ? contentWidth / 2 : 0;
  // Drive height from available vertical space so cards fill the screen.
  // Fall back to natural poster ratio when height isn't measured yet.
  const cardHeight = duelSize.height > 0 ? duelSize.height * 0.65 : cardWidth * 1.5;

  const vsScale = useSharedValue(1);

  useEffect(() => {
    if (isRevealing) {
      vsScale.value = withTiming(1, { duration: 200 });
    } else {
      vsScale.value = withRepeat(withSequence(withTiming(1.15, { duration: 700 }), withTiming(1, { duration: 700 })), -1, true);
    }
  }, [isRevealing]);

  const vsAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: vsScale.value }],
  }));

  // Nudge the player once the clock is running out on an undecided vote — one
  // buzz with a few seconds left, a stronger one right before it expires.
  useEffect(() => {
    if (!currentMatch || votedSide !== null || isRevealing) return;

    const WARNING_REMAINING_MS = 3000;
    const URGENT_REMAINING_MS = 1000;
    const endsAt = currentMatch.startedAt + currentMatch.countdownMs;
    const warningDelay = endsAt - WARNING_REMAINING_MS - Date.now();
    const urgentDelay = endsAt - URGENT_REMAINING_MS - Date.now();

    const timers: ReturnType<typeof setTimeout>[] = [];
    if (warningDelay > 0) {
      timers.push(setTimeout(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning), warningDelay));
    }
    if (urgentDelay > 0) {
      timers.push(setTimeout(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy), urgentDelay));
    }

    return () => timers.forEach(clearTimeout);
  }, [currentMatch?.roundNumber, currentMatch?.matchIndex, currentMatch?.startedAt, currentMatch?.countdownMs, votedSide, isRevealing]);

  const [remainingSeconds, setRemainingSeconds] = useState(0);
  useEffect(() => {
    if (!currentMatch || isRevealing) { setRemainingSeconds(0); return; }
    const tick = () => setRemainingSeconds(
      Math.max(Math.ceil((currentMatch.startedAt + currentMatch.countdownMs - Date.now()) / 1000), 0)
    );
    tick();
    const id = setInterval(tick, 250);
    return () => clearInterval(id);
  }, [currentMatch?.startedAt, currentMatch?.countdownMs, isRevealing]);

  if (!currentMatch) return null;

  const outcomeFor = (side: Side) => {
    if (!isRevealing) return null;
    return lastResult!.winnerSide === side ? ("won" as const) : ("lost" as const);
  };

  const totalVotes = tally.champion + tally.challenger;
  const hasVoted = votedSide !== null;
  const champPercent = totalVotes > 0 ? Math.round((tally.champion / totalVotes) * 100) : 0;
  const chalPercent = totalVotes > 0 ? Math.round((tally.challenger / totalVotes) * 100) : 0;
  const matchKey = `${currentMatch.roundNumber}-${currentMatch.matchIndex}`;
  const champTitle = currentMatch.champion.title || currentMatch.champion.name || "";
  const chalTitle = currentMatch.challenger.title || currentMatch.challenger.name || "";
  const roundsFromEnd = currentMatch.totalRounds - currentMatch.roundNumber;
  const stageName = roundsFromEnd === 0
    ? t("eitherOr.bracket.final")
    : roundsFromEnd === 1
      ? t("eitherOr.bracket.semifinal")
      : roundsFromEnd === 2
        ? t("eitherOr.bracket.quarterfinal")
        : t("eitherOr.bracket.round", { round: currentMatch.roundNumber });
  const champYear = (currentMatch.champion.release_date || currentMatch.champion.first_air_date)?.slice(0, 4) ?? "";
  const chalYear = (currentMatch.challenger.release_date || currentMatch.challenger.first_air_date)?.slice(0, 4) ?? "";
  const matchLabel = currentMatch.matchesInRound > 1
    ? `${currentMatch.matchIndex + 1}/${currentMatch.matchesInRound}`
    : null;

  return (
    <View style={{ flex: 1 }}>
      {/* Blurred split-screen background */}
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <Image
          source={{ uri: `https://image.tmdb.org/t/p/w300${currentMatch.champion.poster_path}` }}
          blurRadius={28}
          contentFit="cover"
          cachePolicy="memory-disk"
          style={[StyleSheet.absoluteFill, { right: "50%" }]}
        />
        <Image
          source={{ uri: `https://image.tmdb.org/t/p/w300${currentMatch.challenger.poster_path}` }}
          blurRadius={28}
          contentFit="cover"
          cachePolicy="memory-disk"
          style={[StyleSheet.absoluteFill, { left: "50%" }]}
        />
        {/* Feather the seam between the two halves */}
        <LinearGradient
          colors={["transparent", "rgba(0,0,0,0.55)", "transparent"]}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={[StyleSheet.absoluteFill, styles.bgSeam]}
        />
        <View style={[StyleSheet.absoluteFill, styles.bgDim]} />
      </View>

      <View style={styles.header}>
        <View style={styles.headerSide}>
          <View style={styles.roundBadgeCol}>
            <Text style={styles.roundBadgeStageName}>{stageName}</Text>
            <View style={styles.roundBadge}>
              {matchLabel && <Text style={styles.roundBadgeMatch}>{matchLabel}</Text>}
              {!isRevealing && (
                <Text style={[styles.roundBadgeSeconds, remainingSeconds <= 5 && styles.roundBadgeSecondsUrgent]}>
                  {matchLabel ? "· " : ""}{remainingSeconds}s
                </Text>
              )}
            </View>
          </View>
        </View>

        <RoundPips currentRound={currentMatch.roundNumber} totalRounds={currentMatch.totalRounds} />

        <View style={[styles.headerSide, styles.headerSideRight]}>
          <ActivePlayers />
        </View>
      </View>

      {/* Full-width progress bar pinned to screen bottom */}
      <View style={styles.bottomBar} pointerEvents="none">
        <CountdownBar startedAt={currentMatch.startedAt} countdownMs={currentMatch.countdownMs} frozen={isRevealing} />
      </View>

      <View style={styles.duel} onLayout={onDuelLayout}>
        {/* Top space: vote percentages animate in after voting */}
        <View style={styles.duelTop}>
          {hasVoted && (
            <Animated.View entering={FadeIn.duration(400)} style={styles.votePercentRow}>
              <Text style={styles.votePercent}>{champPercent}%</Text>
              <Text style={styles.votePercent}>{chalPercent}%</Text>
            </Animated.View>
          )}
        </View>

        {cardWidth > 0 && (
          <View style={styles.cardsRow}>
            <Animated.View key={`champ-${matchKey}`} entering={FadeInLeft.duration(350).easing(Easing.out(Easing.cubic))}>
              <View style={styles.champTilt}>
                <MatchupCard
                  movie={currentMatch.champion}
                  side="champion"
                  votes={tally.champion}
                  totalVotes={totalVotes}
                  votedSide={votedSide}
                  outcome={outcomeFor("champion")}
                  onPress={vote}
                  width={cardWidth}
                  height={cardHeight}
                />
              </View>
            </Animated.View>

            <Animated.View style={[styles.vsBadgeWrap, vsAnimatedStyle]}>
              <View style={styles.vsBadge}>
                <Text style={styles.vs}>{t("eitherOr.game.vs")}</Text>
              </View>
            </Animated.View>

            <Animated.View key={`chal-${matchKey}`} entering={FadeInRight.duration(350).easing(Easing.out(Easing.cubic))}>
              <View style={styles.chalTilt}>
                <MatchupCard
                  movie={currentMatch.challenger}
                  side="challenger"
                  votes={tally.challenger}
                  totalVotes={totalVotes}
                  votedSide={votedSide}
                  outcome={outcomeFor("challenger")}
                  onPress={vote}
                  width={cardWidth}
                  height={cardHeight}
                />
              </View>
            </Animated.View>
          </View>
        )}

        <View style={styles.duelBottom} />
      </View>

      <View style={styles.footer}>
        <View style={styles.footerSide}>
          <Text numberOfLines={1} style={styles.footerTitle}>{champTitle}</Text>
          {champYear ? <Text style={styles.footerYear}>{champYear}</Text> : null}
        </View>

        <View style={styles.footerCenter}>
          <View style={styles.playerRow}>
            {users.map((user) => {
              const voted = votedUserIds.includes(user.userId);
              return (
                <View key={user.userId} style={styles.playerSlot}>
                  <AvatarText
                    size={30}
                    label={user.username[0]?.toUpperCase() || "?"}
                    style={{ backgroundColor: getUserAvatarColor(user.username) }}
                  />
                  <View style={[styles.votedDot, voted ? styles.votedDotYes : styles.votedDotNo]}>
                    <MaterialCommunityIcons
                      name={voted ? "check" : "clock-outline"}
                      size={8}
                      color={colors.text}
                    />
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        <View style={[styles.footerSide, styles.footerSideRight]}>
          <Text numberOfLines={1} style={[styles.footerTitle, styles.footerTitleRight]}>{chalTitle}</Text>
          {chalYear ? <Text style={[styles.footerYear, styles.footerTitleRight]}>{chalYear}</Text> : null}
        </View>
      </View>

      {isRevealing && lastResult?.tieReason && (
        <Portal>
          <TieOverlay reason={lastResult.tieReason} />
        </Portal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
    paddingHorizontal: spacing.screen,
  },
  headerSide: {
    flex: 1,
    alignItems: "flex-start",
  },
  headerSideRight: {
    alignItems: "flex-end",
  },
  roundBadgeCol: {
    gap: 1,
  },
  roundBadgeStageName: {
    fontFamily: "Bebas",
    fontSize: 22,
    color: colors.text,
    lineHeight: 24,
  },
  roundBadge: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: spacing.xs,
  },
  roundBadgeMatch: {
    fontSize: fontSize.xs,
    color: colors.placeholder,
    fontWeight: fontWeight.medium,
  },
  roundBadgeSeconds: {
    fontSize: fontSize.xs,
    color: colors.placeholder,
    fontWeight: fontWeight.medium,
  },
  roundBadgeSecondsUrgent: {
    color: colors.error,
    fontWeight: fontWeight.semibold,
  },
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 4,
  },
  bgDim: {
    backgroundColor: "rgba(0,0,0,0.78)",
  },
  bgSeam: {
    left: "42%",
    right: "42%",
  },
  duel: {
    flex: 1,
    flexDirection: "column",
    alignItems: "stretch",
    paddingHorizontal: spacing.sm,
    paddingBottom: spacing.screen,
  },
  duelTop: {
    flex: 1,
    justifyContent: "flex-end",
    paddingBottom: spacing.md,
  },
  duelBottom: {
    flex: 1,
  },
  cardsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  votePercentRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
  },
  votePercent: {
    fontFamily: "Bebas",
    fontSize: typography.bebasSize.empty,
    color: colors.text,
    opacity: 0.9,
  },
  champTilt: {
    transform: [{ perspective: 1000 }, { rotateY: "14deg" }],
  },
  chalTilt: {
    transform: [{ perspective: 1000 }, { rotateY: "-14deg" }],
  },
  vsBadgeWrap: {
    zIndex: 10,
    marginHorizontal: -22,
  },
  vsBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.appBackground,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: colors.primary,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.7,
    shadowRadius: 8,
    elevation: 8,
  },
  vs: {
    fontFamily: "Bebas",
    fontSize: fontSize.lg,
    color: colors.text,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.screen,
    paddingBottom: spacing.lg,
    paddingTop: spacing.sm,
    gap: spacing.sm,
  },
  footerSide: {
    flex: 1,
  },
  footerSideRight: {
    alignItems: "flex-end",
  },
  footerTitle: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.text,
  },
  footerTitleRight: {
    textAlign: "right",
  },
  footerYear: {
    fontSize: fontSize.xs,
    color: colors.placeholder,
    marginTop: 2,
  },
  footerCenter: {
    alignItems: "center",
    justifyContent: "center",
  },
  playerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  playerSlot: {
    position: "relative",
  },
  votedDot: {
    position: "absolute",
    bottom: -2,
    right: -2,
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 1.5,
    borderColor: colors.appBackground,
    alignItems: "center",
    justifyContent: "center",
  },
  votedDotYes: {
    backgroundColor: colors.primary,
  },
  votedDotNo: {
    backgroundColor: withAlpha(colors.text, 0.25),
  },
});
