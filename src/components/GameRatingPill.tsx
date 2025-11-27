import React, { useState, useEffect, useContext } from "react";
import { View, StyleSheet, TouchableOpacity, Platform } from "react-native";
import { Text } from "react-native-paper";
import Animated, {
  useAnimatedStyle,
  withSpring,
  withSequence,
  useSharedValue,
  FadeIn,
} from "react-native-reanimated";
import { BlurView } from "expo-blur";
import * as Haptics from "expo-haptics";
import { SocketContext } from "../context/SocketContext";

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
  const [hasRated, setHasRated] = useState(false);
  const [selectedRating, setSelectedRating] = useState<RatingType | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  const scale = useSharedValue(1);

  useEffect(() => {
    checkExistingRating();
  }, [roomId, socket]);

  const checkExistingRating = async () => {
    if (!socket || !roomId) return;

    setIsChecking(true);
    try {
      const response = await socket.emitWithAck("check-user-rating", roomId);

      if (response.success && response.hasRated) {
        setHasRated(true);
        setSelectedRating(response.rating);
      }
    } catch (error) {
      console.error("Failed to check rating:", error);
    } finally {
      setIsChecking(false);
    }
  };

  const handleRatingPress = async (rating: RatingType) => {
    if (hasRated || isSubmitting || !socket) return;

    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    scale.value = withSequence(
      withSpring(0.9, { damping: 10 }),
      withSpring(1.0, { damping: 10 }),
    );

    setIsSubmitting(true);
    setSelectedRating(rating);

    try {
      const response = await socket.emitWithAck("submit-game-rating", {
        roomId,
        rating,
      });

      if (response.success) {
        setHasRated(true);

        if (Platform.OS !== "web") {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
      } else {
        if (response.error === "Rating already submitted") {
          setHasRated(true);
          setSelectedRating(response.existingRating || rating);
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

  if (isChecking) return null;

  if (hasRated) return null;

  return (
    <Animated.View style={styles.container} entering={FadeIn}>
      <BlurView
        intensity={Platform.OS === "ios" ? 30 : 80}
        style={[styles.blurContainer]}
      >
        <View
          style={[
            styles.content,
            Platform.OS === "android" && styles.androidBackground,
          ]}
        >
          <View style={styles.ratingsRow}>
            {(Object.keys(RATING_CONFIG) as RatingType[]).map((ratingKey) => {
              const config = RATING_CONFIG[ratingKey];
              const isSelected = selectedRating === ratingKey;

              return (
                <TouchableOpacity
                  key={ratingKey}
                  style={[
                    styles.ratingButton,
                    isSelected && styles.ratingButtonSelected,
                  ]}
                  onPress={() => handleRatingPress(ratingKey)}
                  disabled={hasRated || isSubmitting}
                  activeOpacity={0.7}
                >
                  <Text style={styles.emoji}>{config.emoji}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
        <Text style={styles.promptText}>Rate this game</Text>
      </BlurView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 60,
    left: "50%",
    transform: [
      {
        translateX: "-50%",
      },
    ],
  },
  blurContainer: {
    borderRadius: 30,
    overflow: "hidden",
    paddingHorizontal: 4,
    paddingVertical: 4,
  },
  content: {
    alignItems: "center",
  },
  androidBackground: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  promptText: {
    fontSize: 10,
    color: "rgba(255, 255, 255, 0.8)",
    marginBottom: 8,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    textAlign: "center",
    marginTop: 2.5,
  },
  ratingsRow: {
    flexDirection: "row",
    gap: 12,
  },
  ratingButton: {
    alignItems: "center",
    padding: 4,
    borderRadius: 100,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
  },
  ratingButtonSelected: {
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  emoji: {
    fontSize: 28,
  },
  label: {
    fontSize: 11,
    color: "rgba(255, 255, 255, 0.9)",
    fontWeight: "600",
  },
});
