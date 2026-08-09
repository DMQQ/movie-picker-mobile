import React from "react";
import Text from "../../Text";
import { useTheme } from "../../../hooks/useTheme";
import { View, StyleSheet, Pressable, Dimensions } from "react-native";

import { colors, radius, spacing, typography } from "../../../constants/design";
import Animated, { FadeIn, useAnimatedStyle, useSharedValue, withSpring, interpolate, Extrapolate } from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import Thumbnail from "../../Thumbnail";

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
          {posterUrl ? (
            <>
              <Animated.View style={[styles.background, imageParallaxStyle]}>
                <Thumbnail path={posterUrl} size={780} priority="high" container={styles.backgroundImage} contentFit="cover" />
              </Animated.View>
              <LinearGradient colors={["rgba(0,0,0,0.1)", "rgba(0,0,0,0.3)", "rgba(0,0,0,0.9)"]} style={styles.gradient}>
                <Text style={vertical ? styles.genreNameVertical : styles.genreName}>{genreName}</Text>
                {isSelected && (
                  <View style={[styles.checkmark, { backgroundColor: theme.colors.primary }]}>
                    <MaterialCommunityIcons name="check" size={24} color={colors.text} />
                  </View>
                )}
              </LinearGradient>
            </>
          ) : (
            <View style={[styles.background, styles.placeholder]}>
              <LinearGradient colors={["rgba(0,0,0,0.1)", "rgba(0,0,0,0.3)", "rgba(0,0,0,0.9)"]} style={styles.gradient}>
                <Text style={vertical ? styles.genreNameVertical : styles.genreName}>{genreName}</Text>
                {isSelected && (
                  <View style={[styles.checkmark, { backgroundColor: theme.colors.primary }]}>
                    <MaterialCommunityIcons name="check" size={24} color={colors.text} />
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
    marginRight: spacing.lg,
  },
  containerVertical: {
    marginBottom: spacing.lg,
    width: "100%",
  },
  card: {
    width: Dimensions.get("window").width * 0.75,
    height: Dimensions.get("window").height * 0.65,
    borderRadius: radius.card,
    overflow: "hidden",
    backgroundColor: colors.input,
    borderWidth: 3,
    borderColor: "transparent",
  },
  cardVertical: {
    width: "100%",
    height: 200,
    borderRadius: radius.card,
    overflow: "hidden",
    backgroundColor: colors.input,
    borderWidth: 3,
    borderColor: "transparent",
  },
  background: {
    position: "absolute",
    width: "120%",
    height: "100%",
    left: "-10%",
    overflow: "hidden",
  },
  backgroundImage: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    borderRadius: radius.card,
  },
  placeholder: {
    backgroundColor: colors.surfaceElevated,
  },
  gradient: {
    position: "absolute",
    bottom: -3,
    left: -3,
    right: -3,
    top: 0,
    justifyContent: "flex-end",
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxl,
    borderRadius: radius.card,
  },
  genreName: {
    color: colors.text,
    fontSize: typography.bebasSize.auth,
    fontFamily: "Bebas",
    textShadowColor: "rgba(0, 0, 0, 0.75)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  genreNameVertical: {
    color: colors.text,
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
    borderRadius: radius.card + 2,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default SwipeableGenreCard;
