import { useState, useEffect, useContext } from "react";
import Text from "./Text";
import { colors, fontWeight, fontSize, radius, spacing} from "../constants/design";
import { View, StyleSheet, TouchableOpacity, Platform, TextInput } from "react-native";

import { withSpring, withSequence, useSharedValue } from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { SocketContext } from "../context/SocketContext";
import UserInputModal, { UserInputModalAction } from "./UserInputModal";
import useTranslation from "../service/useTranslation";

interface GameRatingPillProps {
  roomId: string;

  shouldShow: boolean;
}

type RatingType = "bad" | "mid" | "good";

const RATING_CONFIG = {
  bad: {
    emoji: "😞",
    label: "Bad",
    color: "#FF6B6B",
  },
  mid: {
    emoji: "😐",
    label: "Mid",
    color: "#FFB347",
  },
  good: {
    emoji: "😊",
    label: "Good",
    color: "#4CAF50",
  },
};

export default function GameRatingPill({ roomId, shouldShow }: GameRatingPillProps) {
  const { socket } = useContext(SocketContext);
  const t = useTranslation();
  const [selectedRating, setSelectedRating] = useState<RatingType | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showFeedbackInput, setShowFeedbackInput] = useState(false);
  const [feedbackText, setFeedbackText] = useState("");
  const scale = useSharedValue(1);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowModal(true);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const handleRatingPress = async (rating: RatingType) => {
    if (isSubmitting || !socket) return;

    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    scale.value = withSequence(withSpring(0.9, { damping: 10 }), withSpring(1.0, { damping: 10 }));

    setSelectedRating(rating);

    if (rating === "bad") {
      setShowFeedbackInput(true);
      return;
    }

    await submitRating(rating);
  };

  const submitRating = async (rating: RatingType, feedback?: string) => {
    if (!socket) return;

    setIsSubmitting(true);

    try {
      const response = await socket.emitWithAck("submit-game-rating", {
        roomId,
        rating,
        feedback,
      });

      if (response.success) {
        setShowModal(false);
        setShowFeedbackInput(false);

        if (Platform.OS !== "web") {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
      } else {
        if (response.error === "Rating already submitted") {
          setSelectedRating(response.existingRating || rating);
          setShowModal(false);
          setShowFeedbackInput(false);
        } else {
          setSelectedRating(null);
          console.error("Failed to submit rating:", response.error);
        }
      }
    } catch (error) {
      console.error("Error submitting rating:", error);
      setSelectedRating(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFeedbackSubmit = () => {
    submitRating("bad", feedbackText.trim() || undefined);
  };

  const handleSkip = () => {
    setShowModal(false);
    setShowFeedbackInput(false);
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handleBackToRatings = () => {
    setShowFeedbackInput(false);
    setSelectedRating(null);
    setFeedbackText("");
  };

  const actions: UserInputModalAction[] = showFeedbackInput
    ? [
        {
          label: t("game-rating.submit") || "Submit",
          mode: "contained",
          onPress: handleFeedbackSubmit,
          disabled: isSubmitting,
          loading: isSubmitting,
        },
        {
          label: t("game-rating.back") || "Back",
          mode: "text",
          textColor: "rgba(255, 255, 255, 0.6)",
          onPress: handleBackToRatings,
          disabled: isSubmitting,
        },
      ]
    : [
        {
          label: "Skip",
          mode: "text",
          textColor: "rgba(255, 255, 255, 0.6)",
          onPress: handleSkip,
          disabled: isSubmitting,
        },
      ];

  return (
    <UserInputModal
      visible={showModal && shouldShow}
      title={showFeedbackInput ? (t("game-rating.feedback-title") as string) || "What went wrong?" : (t("game-rating.title") as string)}
      subtitle={
        (showFeedbackInput
          ? t("game-rating.feedback-subtitle") || "Help us improve by sharing your feedback"
          : t("game-rating.subtitle")) as string
      }
      actions={actions}
      statusBarTranslucent
    >
      {showFeedbackInput ? (
        <View style={styles.feedbackContainer}>
          <TextInput
            style={styles.feedbackInput}
            placeholder={(t("game-rating.feedback-placeholder") as string) || "Tell us what went wrong..."}
            placeholderTextColor="rgba(255, 255, 255, 0.4)"
            value={feedbackText}
            onChangeText={setFeedbackText}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            editable={!isSubmitting}
          />
        </View>
      ) : (
        <View style={styles.ratingsRow}>
          {(Object.keys(RATING_CONFIG) as RatingType[]).map((ratingKey) => {
            const config = RATING_CONFIG[ratingKey];
            const isSelected = selectedRating === ratingKey;

            return (
              <TouchableOpacity
                key={ratingKey}
                style={[styles.ratingButton, isSelected && styles.ratingButtonSelected]}
                onPress={() => handleRatingPress(ratingKey)}
                disabled={isSubmitting}
                activeOpacity={0.7}
              >
                <Text style={styles.emoji}>{config.emoji}</Text>
                <Text style={styles.label}>{config.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      )}
    </UserInputModal>
  );
}

const styles = StyleSheet.create({
  ratingsRow: {
    flexDirection: "row",
    gap: spacing.lg,
    justifyContent: "center",
  },
  ratingButton: {
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.md,
    borderRadius: radius.card,
    backgroundColor: colors.overlay,
    minWidth: 80,
    gap: spacing.sm - 2,
  },
  ratingButtonSelected: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.4)",
  },
  emoji: {
    fontSize: 45,
  },
  label: {
    fontSize: fontSize.sm,
    color: "rgba(255, 255, 255, 0.9)",
    fontWeight: fontWeight.semibold,
  },
  feedbackContainer: {
    width: "100%",
  },
  feedbackInput: {
    backgroundColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.lg,
    color: colors.text,
    fontSize: fontSize.md,
    minHeight: 100,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
});
