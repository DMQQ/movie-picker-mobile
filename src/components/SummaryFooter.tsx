import { useState, useEffect, useContext } from "react";
import { StyleSheet, View, TextInput, TouchableOpacity, type ReactNode } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, {
  FadeIn,
  FadeOut,
  useSharedValue,
  useAnimatedStyle,
  useAnimatedKeyboard,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import Text from "./Text";
import IconButton from "./IconButton";
import PrimaryButton from "./PrimaryButton";
import { FancySpinner } from "./FancySpinner";
import { SocketContext } from "../context/SocketContext";
import { colors, common, fontSize, fontWeight, radius, spacing, withAlpha } from "../constants/design";
import { posthog } from "../constants/posthog";
import useTranslation from "../service/useTranslation";
import { Platform } from "react-native";

type RatingType = "bad" | "mid" | "good";

const RATING_CONFIG: Record<RatingType, { emoji: string }> = {
  bad: { emoji: "😞" },
  mid: { emoji: "😐" },
  good: { emoji: "😊" },
};

function PulseDot() {
  const opacity = useSharedValue(1);
  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(withTiming(0.25, { duration: 700 }), withTiming(1, { duration: 700 })),
      -1,
    );
  }, []);
  const style = useAnimatedStyle(() => ({ opacity: opacity.value }));
  return <Animated.View style={[styles.pulseDot, style]} />;
}

interface SummaryFooterProps {
  isHost: boolean;
  onQuit: () => void;
  configuring?: boolean;
  playAgainFrom?: string;
  posthogGame: string;
  guestPrimaryLabel: string;
  guestSecondary?: ReactNode;
  id?: string;
  // party waiting
  newGameLoading?: boolean;
  onHeightChange?: (height: number) => void;
}

export default function SummaryFooter({
  isHost,
  onQuit,
  configuring = false,
  playAgainFrom,
  posthogGame,
  guestPrimaryLabel,
  guestSecondary,
  id,
  newGameLoading = false,
  onHeightChange,
}: SummaryFooterProps) {
  const insets = useSafeAreaInsets();
  const { socket } = useContext(SocketContext);
  const t = useTranslation();
  const keyboard = useAnimatedKeyboard();
  const feedbackStyle = useAnimatedStyle(() => ({
    bottom: keyboard.height.value - (keyboard.height.value  > 0 ? insets.bottom : 0),
  }));

  const [ratingVisible, setRatingVisible] = useState(true);
  const [selectedRating, setSelectedRating] = useState<RatingType | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackText, setFeedbackText] = useState("");

  const submitRating = async (rating: RatingType, feedback?: string) => {
    if (!socket) return;
    setIsSubmitting(true);
    try {
      const payload = posthogGame === "voter"
        ? { sessionId: id, rating, feedback }
        : { roomId: id, rating, feedback };
      const response = await socket.emitWithAck("submit-game-rating", payload);
      if (response.success) {
        if (Platform.OS !== "web") {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
        setTimeout(() => setRatingVisible(false), 400);
      } else if (response.error === "Rating already submitted") {
        setRatingVisible(false);
      } else {
        setSelectedRating(null);
      }
    } catch {
      setSelectedRating(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRatingPress = (rating: RatingType) => {
    if (isSubmitting || !socket) return;
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSelectedRating(rating);
    if (rating === "bad") {
      setShowFeedback(true);
      return;
    }
    submitRating(rating);
  };

  const handlePlayAgain = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    posthog?.capture("play_again_tapped", { game: posthogGame });
    if (playAgainFrom) {
      router.push({ pathname: "/play-again", params: { from: playAgainFrom } } as any);
    } else {
      router.push("/play-again" as any);
    }
  };

  return (
    <>
      {/* Feedback panel — floats above keyboard independently */}
      {showFeedback && (
        <Animated.View style={[styles.feedbackPanel, feedbackStyle]}>
          <View style={styles.feedbackHeader}>
            <TouchableOpacity
              onPress={() => {
                setShowFeedback(false);
                setSelectedRating(null);
                setFeedbackText("");
              }}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <MaterialCommunityIcons name="arrow-left" size={20} color={colors.text} />
            </TouchableOpacity>
            <Text style={styles.ratingTitle}>
              {t("game-rating.feedback-title") || "What went wrong?"}
            </Text>
          </View>
          <View style={styles.feedbackInputRow}>
            <TextInput
              style={styles.feedbackInput}
              placeholder={(t("game-rating.feedback-placeholder") as string) || "Tell us what went wrong..."}
              placeholderTextColor={colors.placeholder}
              value={feedbackText}
              onChangeText={setFeedbackText}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
              editable={!isSubmitting}
              autoFocus
            />
            <TouchableOpacity
              style={[styles.feedbackSubmit, isSubmitting && { opacity: 0.5 }]}
              onPress={() => submitRating("bad", feedbackText.trim() || undefined)}
              disabled={isSubmitting}
              activeOpacity={0.7}
            >
              <MaterialCommunityIcons name="send" size={20} color={colors.text} />
            </TouchableOpacity>
          </View>
        </Animated.View>
      )}

      {/* Main footer — always pinned at bottom: 0 */}
      <View
        style={[styles.container, ]}
        onLayout={(e) => onHeightChange?.(e.nativeEvent.layout.height)}
      >
        {newGameLoading ? (
          <Animated.View
            key="waiting"
            entering={FadeIn.duration(300)}
            exiting={FadeOut.duration(200)}
            style={styles.waitingRow}
          >
            <View style={styles.spinnerWrap}>
              <FancySpinner size={38} />
            </View>
            <View style={styles.waitingInfo}>
              <View style={styles.waitingTitleRow}>
                <PulseDot />
                <Text style={styles.waitingTitle}>{t("party-waiting.starting")}</Text>
              </View>
              <Text style={styles.waitingSubtitle}>{t("party-waiting.preparing")}</Text>
            </View>
          </Animated.View>
        ) : (
          <Animated.View
            key="normal"
            entering={FadeIn.duration(300)}
            exiting={FadeOut.duration(200)}
          >
            {ratingVisible && !showFeedback && (
              <View style={styles.ratingStrip}>
                <Text style={styles.ratingTitle}>{t("game-rating.title")}</Text>
                <View style={styles.emojiRow}>
                  {(Object.keys(RATING_CONFIG) as RatingType[]).map((key) => (
                    <TouchableOpacity
                      key={key}
                      style={[styles.emojiBtn, selectedRating === key && styles.emojiBtnSelected]}
                      onPress={() => handleRatingPress(key)}
                      disabled={isSubmitting}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.emoji}>{RATING_CONFIG[key].emoji}</Text>
                    </TouchableOpacity>
                  ))}
                  <TouchableOpacity
                    style={styles.dismissBtn}
                    onPress={() => setRatingVisible(false)}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <MaterialCommunityIcons name="close" size={16} color={colors.placeholder} />
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {ratingVisible && !showFeedback && <View style={styles.ratingDivider} />}

            {isHost ? (
              <View style={styles.buttonRow}>
                <IconButton
                  icon="logout"
                  size={24}
                  onPress={onQuit}
                  style={[common.iconButton, styles.quitIcon]}
                />
                <PrimaryButton
                  icon={({ color }) => (
                    <MaterialCommunityIcons name="refresh" size={18} color={color} />
                  )}
                  onPress={handlePlayAgain}
                  style={styles.mainBtn}
                >
                  {t("game-summary.play-again")}
                </PrimaryButton>
              </View>
            ) : (
              <>
                {configuring && (
                  <View style={styles.configuringStrip}>
                    <PulseDot />
                    <View style={styles.configuringText}>
                      <Text style={styles.configuringTitle}>{t("party-waiting.host-setting-up")}</Text>
                      <Text style={styles.configuringSubtitle}>{t("party-waiting.host-subtitle")}</Text>
                    </View>
                  </View>
                )}
                <View
                  pointerEvents={configuring ? "none" : "auto"}
                  style={[styles.buttonRow, { opacity: configuring ? 0.4 : 1 }]}
                >
                  <PrimaryButton onPress={onQuit} style={styles.mainBtn}>
                    {guestPrimaryLabel}
                  </PrimaryButton>
                  {guestSecondary}
                </View>
              </>
            )}
          </Animated.View>
        )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 10,
    backgroundColor: colors.appBackground,
  },
  // waiting state
  waitingRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    gap: spacing.md,
  },
  spinnerWrap: {
    width: 44,
    alignItems: "center",
  },
  waitingInfo: {
    flex: 1,
    gap: spacing.xs,
  },
  waitingTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  pulseDot: {
    width: 7,
    height: 7,
    borderRadius: 100,
    backgroundColor: colors.primary,
  },
  waitingTitle: {
    fontFamily: "Bebas",
    fontSize: fontSize.xl,
    letterSpacing: 0.5,
    color: colors.text,
  },
  waitingSubtitle: {
    fontSize: fontSize.sm,
    color: colors.placeholder,
  },
  // rating strip
  ratingStrip: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    gap: spacing.sm,
  },
  ratingTitle: {
    flex: 1,
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.text,
  },
  emojiRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  emojiBtn: {
    padding: spacing.xs,
    borderRadius: radius.sm,
  },
  emojiBtnSelected: {
    backgroundColor: withAlpha(colors.primary, 0.18),
  },
  emoji: {
    fontSize: 26,
  },
  dismissBtn: {
    marginLeft: spacing.xs,
  },
  // feedback panel — separate absolute element, floats above keyboard
  feedbackPanel: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 20,
    backgroundColor: colors.appBackground,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    gap: spacing.sm,
  },
  feedbackHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  feedbackInputRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: spacing.sm,
  },
  feedbackInput: {
    flex: 1,
    backgroundColor: colors.input,
    borderRadius: radius.md,
    padding: spacing.md,
    color: colors.text,
    fontSize: fontSize.md,
    minHeight: 72,
    borderWidth: 1,
    borderColor: withAlpha(colors.text, 0.15),
    textAlignVertical: "top",
  },
  feedbackSubmit: {
    width: 44,
    height: 44,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "flex-end",
  },
  // configuring strip (host picking next game)
  configuringStrip: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  configuringText: {
    flex: 1,
    gap: 2,
  },
  configuringTitle: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.text,
  },
  configuringSubtitle: {
    fontSize: fontSize.xs,
    color: colors.placeholder,
  },
  // divider between rating and buttons
  ratingDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
    marginHorizontal: spacing.lg,
  },
  // button row
  buttonRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm + 2,
    paddingHorizontal: spacing.screen,
    paddingTop: spacing.sm,
  },
  mainBtn: {
    flex: 1,
    borderRadius: radius.pill,
  },
  quitIcon: {
    backgroundColor: colors.surface,
    borderRadius: radius.pill,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
});
