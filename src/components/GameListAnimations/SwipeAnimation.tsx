import React, { useEffect } from "react";
import { View, StyleSheet } from "react-native";
import Animated, { useSharedValue, useAnimatedStyle, withTiming, Easing, interpolateColor } from "react-native-reanimated";

const SwiperAnimation = () => {
  // Create 5 cards
  const numCards = 5;

  // Create cards with initial positions
  const cards = Array.from({ length: numCards }).map((_, index) => ({
    // Position and basic properties
    x: useSharedValue(0),
    y: useSharedValue(index * 2),
    rotate: useSharedValue(0),
    scale: useSharedValue(1 - index * 0.02),
    colorProgress: useSharedValue(0),
    zIndex: useSharedValue(numCards - index), // Higher z-index = front card
  }));

  // Animation state
  const isAnimating = useSharedValue(0);
  const swipeDirection = useSharedValue(1); // 1 for right, -1 for left

  // Animation function
  const runAnimation = () => {
    // Prevent multiple animations
    if (isAnimating.value === 1) return;
    isAnimating.value = 1;

    // Current swipe direction (alternate each time)
    const direction = swipeDirection.value;
    swipeDirection.value *= -1;

    // Color value based on direction
    const colorValue = direction === 1 ? 1 : 2; // 1=green, 2=red

    // Get frontmost card (card with highest z-index should be at index 0)
    // Only animate this card
    cards[0].colorProgress.value = withTiming(colorValue, {
      duration: 200,
      easing: Easing.out(Easing.quad),
    });

    cards[0].x.value = withTiming(direction * 300, {
      duration: 800,
      easing: Easing.out(Easing.quad),
    });

    cards[0].rotate.value = withTiming(direction * 25, {
      duration: 800,
      easing: Easing.out(Easing.quad),
    });

    // After animation completes
    setTimeout(() => {
      // 1. Save properties of the swiped card
      const topCardProps = {
        x: cards[0].x.value,
        y: cards[0].y.value,
        rotate: cards[0].rotate.value,
        scale: cards[0].scale.value,
        colorProgress: cards[0].colorProgress.value,
        zIndex: cards[0].zIndex.value,
      };

      // 2. Shift all cards up in the stack (move properties from i+1 to i)
      for (let i = 0; i < numCards - 1; i++) {
        // Move values up the stack
        cards[i].x.value = 0; // Reset x position
        cards[i].y.value = withTiming(i * 2, {
          duration: 300,
          easing: Easing.out(Easing.quad),
        });
        cards[i].rotate.value = 0; // Reset rotation
        cards[i].scale.value = withTiming(1 - i * 0.02, {
          duration: 300,
          easing: Easing.out(Easing.quad),
        });
        cards[i].colorProgress.value = 0; // Reset color
        cards[i].zIndex.value = numCards - i; // Update z-index
      }

      // 3. Move the swiped card to back
      const lastIndex = numCards - 1;
      cards[lastIndex].x.value = 0; // Reset horizontal position
      cards[lastIndex].y.value = lastIndex * 2; // Move to bottom
      cards[lastIndex].rotate.value = 0; // Reset rotation
      cards[lastIndex].scale.value = 1 - lastIndex * 0.02; // Set scale
      cards[lastIndex].colorProgress.value = 0; // Reset color
      cards[lastIndex].zIndex.value = numCards - lastIndex; // Set z-index

      // Mark animation as complete
      isAnimating.value = 0;

      // Schedule next animation after delay
      setTimeout(runAnimation, 500);
    }, 800);
  };

  // Start animation on component mount
  useEffect(() => {
    const timer = setTimeout(runAnimation, 500);
    return () => clearTimeout(timer);
  }, []);

  // Create animated styles for cards
  const cardStyles = cards.map((card) => {
    return useAnimatedStyle(() => {
      const backgroundColor = interpolateColor(card.colorProgress.value, [0, 1, 2], ["#4A4A4A", "#4CAF50", "#FF5252"]);

      return {
        transform: [
          { translateX: card.x.value },
          { translateY: card.y.value },
          { rotate: `${card.rotate.value}deg` },
          { scale: card.scale.value },
        ],
        backgroundColor,
        zIndex: card.zIndex.value,
      };
    });
  });

  return (
    <View style={styles.container}>
      {cards.map((_, index) => (
        <Animated.View key={index} style={[styles.card, cardStyles[index]]}>
          <View style={styles.cardContent} />
        </Animated.View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#1A1A1A",
  },
  card: {
    position: "absolute",
    width: 140,
    height: 180,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    backgroundColor: "#4A4A4A", // Default gray
  },
  cardContent: {
    width: "90%",
    height: 8,
    backgroundColor: "#666666",
    borderRadius: 4,
    position: "absolute",
    bottom: 20,
    alignSelf: "center",
  },
});

export default SwiperAnimation;
