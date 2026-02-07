import React, { useEffect, useRef } from "react";
import { View, StyleSheet, Animated, Easing } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { MD2DarkTheme } from "react-native-paper";

const RandomMovieAnimation = () => {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    // Pulse animation
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    );

    // Glow animation
    const glowLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 0.6,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0.3,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]),
    );

    // Subtle rotate
    const rotateLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 3000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(rotateAnim, {
          toValue: 0,
          duration: 3000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    );

    pulseLoop.start();
    glowLoop.start();
    rotateLoop.start();

    return () => {
      pulseLoop.stop();
      glowLoop.stop();
      rotateLoop.stop();
    };
  }, []);

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["-5deg", "5deg"],
  });

  return (
    <View style={styles.container}>
      {/* Glow effect */}
      <Animated.View style={[styles.glow, { opacity: glowAnim }]} />

      {/* Main card */}
      <Animated.View
        style={[
          styles.card,
          {
            transform: [{ scale: pulseAnim }, { rotate }],
          },
        ]}
      >
        <View style={styles.cardInner}>
          <MaterialCommunityIcons name="dice-multiple" size={50} color="rgba(255,255,255,0.8)" />
          <View style={styles.questionMarks}>
            <MaterialCommunityIcons name="help" size={24} color="rgba(255,255,255,0.3)" style={styles.q1} />
            <MaterialCommunityIcons name="help" size={20} color="rgba(255,255,255,0.2)" style={styles.q2} />
            <MaterialCommunityIcons name="help" size={18} color="rgba(255,255,255,0.25)" style={styles.q3} />
          </View>
        </View>
      </Animated.View>

      {/* Decorative elements */}
      <View style={styles.sparkle1}>
        <MaterialCommunityIcons name="star-four-points" size={16} color="#FFD700" />
      </View>
      <View style={styles.sparkle2}>
        <MaterialCommunityIcons name="star-four-points" size={12} color="#FFD700" />
      </View>
      <View style={styles.sparkle3}>
        <MaterialCommunityIcons name="star-four-points" size={14} color="#FFD700" />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#1A1A1A",
  },
  glow: {
    position: "absolute",
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: MD2DarkTheme.colors.primary,
  },
  card: {
    width: 120,
    height: 160,
    borderRadius: 12,
    backgroundColor: MD2DarkTheme.colors.primary,
    shadowColor: MD2DarkTheme.colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  cardInner: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 12,
    borderWidth: 3,
    borderColor: "rgba(255,255,255,0.3)",
  },
  questionMarks: {
    position: "absolute",
    width: "100%",
    height: "100%",
  },
  q1: {
    position: "absolute",
    top: 15,
    right: 15,
  },
  q2: {
    position: "absolute",
    bottom: 20,
    left: 15,
  },
  q3: {
    position: "absolute",
    top: 40,
    left: 20,
  },
  sparkle1: {
    position: "absolute",
    top: "25%",
    right: "20%",
  },
  sparkle2: {
    position: "absolute",
    bottom: "30%",
    left: "22%",
  },
  sparkle3: {
    position: "absolute",
    top: "45%",
    left: "18%",
  },
});

export default RandomMovieAnimation;
