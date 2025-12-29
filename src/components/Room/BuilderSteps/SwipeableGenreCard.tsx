import React from "react";
import { View, StyleSheet, Pressable, Dimensions } from "react-native";
import { Text, useTheme } from "react-native-paper";
import Animated, { FadeIn, useAnimatedStyle, useSharedValue, withSpring, interpolate, Extrapolate } from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";

interface SwipeableGenreCardProps {
  genreName: string;
  posterUrl: string;
  isSelected: boolean;
  onPress: () => void;
  delay?: number;
  vertical?: boolean;
  scrollX?: Animated.SharedValue<number>;
  index?: number;
}

const SwipeableGenreCard: React.FC<SwipeableGenreCardProps> = ({
  genreName,
  posterUrl,
  isSelected,
  onPress,
  delay = 0,
  vertical = false,
  scrollX,
  index = 0,
}) => {
  const theme = useTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: withSpring(scale.value) }],
  }));

  const cardWidth = Dimensions.get("window").width * 0.75;
  const imageParallaxStyle = useAnimatedStyle(() => {
    if (!scrollX) return {};

    const inputRange = [(index - 1) * (cardWidth + 16), index * (cardWidth + 16), (index + 1) * (cardWidth + 16)];

    const translateX = interpolate(scrollX.value, inputRange, [-50, 0, 50], Extrapolate.CLAMP);

    return {
      transform: [{ translateX }],
    };
  });

  const handlePressIn = () => {
    scale.value = 0.97;
  };

  const handlePressOut = () => {
    scale.value = 1;
  };

  const fullPosterUrl = posterUrl ? `https://image.tmdb.org/t/p/w780${posterUrl}` : "";

  return (
    <Animated.View entering={FadeIn.duration(400).delay(delay)} style={vertical ? styles.containerVertical : styles.container}>
      <Pressable onPress={onPress} onPressIn={handlePressIn} onPressOut={handlePressOut}>
        <Animated.View
          style={[
            vertical ? styles.cardVertical : styles.card,
            animatedStyle,
            isSelected && { borderColor: theme.colors.primary, borderWidth: 3 },
          ]}
        >
          {fullPosterUrl ? (
            <View style={styles.background}>
              <Animated.Image source={{ uri: fullPosterUrl }} style={[styles.backgroundImage, imageParallaxStyle]} resizeMode="cover" />
              <LinearGradient colors={["rgba(0,0,0,0.1)", "rgba(0,0,0,0.3)", "rgba(0,0,0,0.9)"]} style={styles.gradient}>
                <Text style={vertical ? styles.genreNameVertical : styles.genreName}>{genreName}</Text>
                {isSelected && (
                  <View style={[styles.checkmark, { backgroundColor: theme.colors.primary }]}>
                    <MaterialIcons name="check" size={24} color="#fff" />
                  </View>
                )}
              </LinearGradient>
            </View>
          ) : (
            <View style={[styles.background, styles.placeholder]}>
              <LinearGradient colors={["rgba(0,0,0,0.1)", "rgba(0,0,0,0.3)", "rgba(0,0,0,0.9)"]} style={styles.gradient}>
                <Text style={vertical ? styles.genreNameVertical : styles.genreName}>{genreName}</Text>
                {isSelected && (
                  <View style={[styles.checkmark, { backgroundColor: theme.colors.primary }]}>
                    <MaterialIcons name="check" size={24} color="#fff" />
                  </View>
                )}
              </LinearGradient>
            </View>
          )}
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginRight: 16,
  },
  containerVertical: {
    marginBottom: 16,
    width: "100%",
  },
  card: {
    width: Dimensions.get("window").width * 0.75,
    height: Dimensions.get("window").height * 0.65,
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "#1a1a1a",
    borderWidth: 3,
    borderColor: "transparent",
  },
  cardVertical: {
    width: "100%",
    height: 200,
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "#1a1a1a",
    borderWidth: 3,
    borderColor: "transparent",
  },
  background: {
    width: "100%",
    height: "100%",
    overflow: "hidden",
  },
  backgroundImage: {
    position: "absolute",
    width: "120%",
    height: "100%",
    left: "-10%",
    borderRadius: 16,
  },
  placeholder: {
    backgroundColor: "#2a2a2a",
  },
  gradient: {
    flex: 1,
    justifyContent: "flex-end",
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  genreName: {
    color: "#fff",
    fontSize: 38,
    fontFamily: "Bebas",
    textShadowColor: "rgba(0, 0, 0, 0.75)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  genreNameVertical: {
    color: "#fff",
    fontSize: 32,
    fontFamily: "Bebas",
    textShadowColor: "rgba(0, 0, 0, 0.75)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  checkmark: {
    position: "absolute",
    top: 16,
    right: 16,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default SwipeableGenreCard;
