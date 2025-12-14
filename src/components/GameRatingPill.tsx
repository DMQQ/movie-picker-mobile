import { useState, useEffect, useContext } from "react";
import { View, StyleSheet, TouchableOpacity, Platform } from "react-native";
import { Text } from "react-native-paper";
import { withSpring, withSequence, useSharedValue } from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { SocketContext } from "../context/SocketContext";
import UserInputModal, { UserInputModalAction } from "./UserInputModal";
import useTranslation from "../service/useTranslation";

interface GameRatingPillProps {
  roomId: string;
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

export default function GameRatingPill({ roomId }: GameRatingPillProps) {
  const { socket } = useContext(SocketContext);
  const t = useTranslation();
  const [selectedRating, setSelectedRating] = useState<RatingType | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showModal, setShowModal] = useState(false);
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

    setIsSubmitting(true);
    setSelectedRating(rating);

    try {
      const response = await socket.emitWithAck("submit-game-rating", {
        roomId,
        rating,
      });

      if (response.success) {
        setShowModal(false);

        if (Platform.OS !== "web") {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
      } else {
        if (response.error === "Rating already submitted") {
          setSelectedRating(response.existingRating || rating);
          setShowModal(false);
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

  const handleSkip = () => {
    setShowModal(false);
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const actions: UserInputModalAction[] = [
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
      visible={showModal}
      title={t("game-rating.title")}
      subtitle={t("game-rating.subtitle")}
      actions={actions}
      statusBarTranslucent
    >
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
    </UserInputModal>
  );
}

const styles = StyleSheet.create({
  ratingsRow: {
    flexDirection: "row",
    gap: 16,
    justifyContent: "center",
  },
  ratingButton: {
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    borderRadius: 16,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    minWidth: 80,
    gap: 6,
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
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.9)",
    fontWeight: "600",
  },
});
