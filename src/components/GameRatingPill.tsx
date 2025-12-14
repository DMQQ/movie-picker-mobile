import { useState, useEffect, useContext } from "react";
import { View, StyleSheet, TouchableOpacity, Platform, Modal } from "react-native";
import { Text, Button } from "react-native-paper";
import Animated, { withSpring, withSequence, useSharedValue, FadeIn, FadeOut } from "react-native-reanimated";
import { BlurView } from "expo-blur";
import * as Haptics from "expo-haptics";
import { SocketContext } from "../context/SocketContext";
import FrostedGlass from "./FrostedGlass";

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

  return (
    <Modal visible={showModal} transparent animationType="fade" statusBarTranslucent>
      <View style={styles.modalOverlay}>
        <FrostedGlass style={styles.modalContent}>
          <Animated.View style={styles.modalInner} entering={FadeIn} exiting={FadeOut}>
            <Text style={styles.modalTitle}>How was this game?</Text>
            <Text style={styles.modalSubtitle}>I really appreciate all feedback to make this app better! 🙏</Text>

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

            <Button mode="text" onPress={handleSkip} disabled={isSubmitting} textColor="rgba(255, 255, 255, 0.6)" style={styles.skipButton}>
              Skip
            </Button>
          </Animated.View>
        </FrostedGlass>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    width: "100%",
    maxWidth: 400,
    borderRadius: 24,
    overflow: "hidden",
    flex: 0,
  },
  modalInner: {
    padding: 30,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 32,
    fontFamily: "Bebas",
    color: "#fff",
    textAlign: "center",
    marginBottom: 8,
    letterSpacing: 1.2,
  },
  modalSubtitle: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.75)",
    textAlign: "center",
    marginBottom: 30,
    lineHeight: 20,
    paddingHorizontal: 10,
  },
  ratingsRow: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 20,
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
  skipButton: {
    marginTop: 5,
  },
});
