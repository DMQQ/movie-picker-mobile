import React, { useEffect, useRef } from "react";
import { Animated, Easing, StyleSheet, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { colors, radius } from "../../constants/design";

const EitherOrAnimation = () => {
  const leftX = useRef(new Animated.Value(-40)).current;
  const rightX = useRef(new Animated.Value(40)).current;
  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(leftX, { toValue: -6, duration: 900, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
          Animated.timing(rightX, { toValue: 6, duration: 900, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
        ]),
        Animated.sequence([
          Animated.timing(pulse, { toValue: 1.15, duration: 200, useNativeDriver: true }),
          Animated.timing(pulse, { toValue: 1, duration: 200, useNativeDriver: true }),
        ]),
        Animated.delay(600),
        Animated.parallel([
          Animated.timing(leftX, { toValue: -40, duration: 700, easing: Easing.in(Easing.cubic), useNativeDriver: true }),
          Animated.timing(rightX, { toValue: 40, duration: 700, easing: Easing.in(Easing.cubic), useNativeDriver: true }),
        ]),
        Animated.delay(300),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, []);

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.card, styles.cardLeft, { transform: [{ translateX: leftX }] }]}>
        <MaterialCommunityIcons name="movie-open-outline" size={40} color="rgba(255,255,255,0.5)" />
      </Animated.View>

      <Animated.View style={[styles.badge, { transform: [{ scale: pulse }] }]}>
        <MaterialCommunityIcons name="sword-cross" size={22} color={colors.text} />
      </Animated.View>

      <Animated.View style={[styles.card, styles.cardRight, { transform: [{ translateX: rightX }] }]}>
        <MaterialCommunityIcons name="movie-open-outline" size={40} color="rgba(255,255,255,0.5)" />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.input,
    gap: 14,
  },
  card: {
    width: 100,
    height: 150,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  cardLeft: {},
  cardRight: {},
  badge: {
    position: "absolute",
    width: 44,
    height: 44,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },
});

export default EitherOrAnimation;
