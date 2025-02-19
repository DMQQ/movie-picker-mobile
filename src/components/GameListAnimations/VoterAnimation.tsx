import React, { useEffect, useRef } from "react";
import { View, StyleSheet, Animated, Easing } from "react-native";

const VoterAnimation = () => {
  // Create animated values for each card
  const likedCardPosition = useRef(new Animated.Value(0)).current;
  const dislikedCardPosition = useRef(new Animated.Value(0)).current;
  const neutralCardScale = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    // Create animation sequence
    const animateCards = () => {
      // Reset animations
      likedCardPosition.setValue(0);
      dislikedCardPosition.setValue(0);
      neutralCardScale.setValue(0.8);

      Animated.parallel([
        // Animate liked card to the right
        Animated.timing(likedCardPosition, {
          toValue: 100,
          duration: 800,

          useNativeDriver: true,
        }),
        // Animate disliked card to the left
        Animated.timing(dislikedCardPosition, {
          toValue: -100,
          duration: 800,

          useNativeDriver: true,
        }),
        // Scale up the neutral card
        Animated.timing(neutralCardScale, {
          toValue: 1,
          duration: 600,

          useNativeDriver: true,
        }),
      ]).start();
    };

    // Start animation after a short delay
    const timeout = setTimeout(() => {
      animateCards();
    }, 500);

    return () => clearTimeout(timeout);
  }, []);

  // Create interpolated values for rotations and opacity
  const likedCardRotation = likedCardPosition.interpolate({
    inputRange: [0, 130],
    outputRange: ["0deg", "15deg"],
  });

  const dislikedCardRotation = dislikedCardPosition.interpolate({
    inputRange: [-130, 0],
    outputRange: ["-15deg", "0deg"],
  });

  const sideCardsOpacity = neutralCardScale.interpolate({
    inputRange: [0.8, 1],
    outputRange: [1, 0.7],
  });

  return (
    <View style={styles.container}>
      {/* Animated movie cards */}
      <Animated.View
        style={[
          styles.movieCard,
          styles.likedCard,
          {
            transform: [{ translateX: likedCardPosition }, { rotate: likedCardRotation }, { scale: 0.9 }],
            opacity: sideCardsOpacity,
          },
        ]}
      >
        <View style={styles.posterPlaceholder} />
        <View style={styles.movieInfo}>
          <View style={styles.movieTitle} />
          <View style={styles.movieDetails} />
        </View>
      </Animated.View>

      <Animated.View
        style={[
          styles.movieCard,
          styles.neutralCard,
          {
            transform: [{ scale: neutralCardScale }],
            zIndex: 3,
          },
        ]}
      >
        <View style={styles.posterPlaceholder} />
        <View style={styles.movieInfo}>
          <View style={styles.movieTitle} />
          <View style={styles.movieDetails} />
        </View>
      </Animated.View>

      <Animated.View
        style={[
          styles.movieCard,
          styles.dislikedCard,
          {
            transform: [{ translateX: dislikedCardPosition }, { rotate: dislikedCardRotation }, { scale: 0.9 }],
            opacity: sideCardsOpacity,
          },
        ]}
      >
        <View style={styles.posterPlaceholder} />
        <View style={styles.movieInfo}>
          <View style={styles.movieTitle} />
          <View style={styles.movieDetails} />
        </View>
      </Animated.View>

      {/* Rating stars */}
      <View style={styles.starsContainer}>
        <View style={[styles.star, styles.starFilled]} />
        <View style={[styles.star, styles.starFilled]} />
        <View style={[styles.star, styles.starFilled]} />
        <View style={[styles.star, styles.starEmpty]} />
        <View style={[styles.star, styles.starEmpty]} />
      </View>
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
  movieCard: {
    position: "absolute",
    width: 130,
    height: 180,
    borderRadius: 10,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.27,
    shadowRadius: 4.65,
    elevation: 6,
  },
  likedCard: {
    backgroundColor: "#4CAF50",
  },
  neutralCard: {
    backgroundColor: "#3E3E3E",
  },
  dislikedCard: {
    backgroundColor: "#FF5252",
  },
  posterPlaceholder: {
    width: "100%",
    height: "70%",
    backgroundColor: "#555555",
  },
  movieInfo: {
    padding: 8,
    height: "30%",
  },
  movieTitle: {
    width: "80%",
    height: 10,
    backgroundColor: "#6C6C6C",
    borderRadius: 2,
    marginBottom: 8,
  },
  movieDetails: {
    width: "60%",
    height: 8,
    backgroundColor: "#6C6C6C",
    borderRadius: 2,
  },
  starsContainer: {
    flexDirection: "row",
    position: "absolute",
    bottom: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  star: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginHorizontal: 4,
  },
  starFilled: {
    backgroundColor: "#FFD700",
  },
  starEmpty: {
    backgroundColor: "#555555",
  },
});

export default VoterAnimation;
