import React from "react";
import { View, StyleSheet, Pressable } from "react-native";
import { Text, useTheme } from "react-native-paper";
import Animated, { FadeIn, useAnimatedStyle, useSharedValue, withSpring, interpolate, Extrapolate } from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import Thumbnail from "../../Thumbnail";

interface PosterCardProps {
  posterUrl: string;
  label: string;
  isSelected: boolean;
  onPress: () => void;
  delay?: number;
  large?: boolean;
  scrollX?: Animated.SharedValue<number>;
  index?: number;
  cardWidth?: number;
}

const PosterCard: React.FC<PosterCardProps> = ({
  posterUrl,
  label,
  isSelected,
  onPress,
  delay = 0,
  large = false,
  scrollX,
  index = 0,
  cardWidth = 200,
}) => {
  const theme = useTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: withSpring(scale.value) }],
  }));

  const imageParallaxStyle = useAnimatedStyle(() => {
    if (!scrollX) return {};

    const inputRange = [(index - 1) * (cardWidth + 12), index * (cardWidth + 12), (index + 1) * (cardWidth + 12)];

    const translateX = interpolate(scrollX.value, inputRange, [-30, 0, 30], Extrapolate.CLAMP);

    return {
      transform: [{ translateX }],
    };
  });

  const handlePressIn = () => {
    scale.value = 0.95;
  };

  const handlePressOut = () => {
    scale.value = 1;
  };

  const size = large ? 500 : 300;

  return (
    <Animated.View entering={FadeIn.duration(400).delay(delay)} style={styles.container}>
      <Pressable onPress={onPress} onPressIn={handlePressIn} onPressOut={handlePressOut}>
        <Animated.View
          style={[
            large ? styles.cardLarge : styles.card,
            animatedStyle,
            isSelected && { borderColor: theme.colors.primary, borderWidth: 3 },
          ]}
        >
          <Animated.View style={[styles.imageContainer, imageParallaxStyle]}>
            <Thumbnail path={posterUrl} size={size} priority="high" container={styles.posterImage} contentFit="cover" />
          </Animated.View>

          <LinearGradient colors={["rgba(0,0,0,0.1)", "rgba(0,0,0,0.3)", "rgba(0,0,0,0.9)"]} style={styles.gradient}>
            <Text style={styles.label} numberOfLines={2}>
              {label}
            </Text>
          </LinearGradient>

          {isSelected && (
            <View style={[styles.checkmark, { backgroundColor: theme.colors.primary }]}>
              <Text style={styles.checkmarkText}>✓</Text>
            </View>
          )}
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginRight: 12,
  },
  card: {
    width: 150,
    height: 225,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#1a1a1a",
    borderWidth: 2,
    borderColor: "transparent",
  },
  cardLarge: {
    width: 200,
    height: 300,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#1a1a1a",
    borderWidth: 2,
    borderColor: "transparent",
  },
  imageContainer: {
    position: "absolute",
    width: "125%",
    height: "105%",
    left: "-10%",
    overflow: "hidden",
  },
  posterImage: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    borderRadius: 12,
  },
  gradient: {
    position: "absolute",
    bottom: -2,
    left: -2,
    right: -2,
    height: 92,
    justifyContent: "flex-end",
    padding: 10,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  label: {
    color: "#fff",
    fontSize: 28,
    fontFamily: "Bebas",
    letterSpacing: 0.5,
  },
  checkmark: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  checkmarkText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default PosterCard;
