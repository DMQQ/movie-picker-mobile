// src/screens/Room/RoomSetup/components/SelectionCard.tsx
import React from "react";
import { StyleSheet, View, Pressable } from "react-native";
import { Text, useTheme } from "react-native-paper";
import Animated, { FadeIn, useAnimatedStyle, useSharedValue, withSpring, interpolate, Extrapolate } from "react-native-reanimated";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { LinearGradient } from "expo-linear-gradient";
import Thumbnail from "../Thumbnail";

type IconData = { component: any; name: string; color: string };

type SelectionCardProps = {
  label: string;
  iconData: IconData;
  isSelected: boolean;
  onPress: () => void;
  vertical?: boolean;
  delay?: number;
  posterUrl?: string;
  scrollX?: Animated.SharedValue<number>;
  scrollY?: Animated.SharedValue<number>;
  index?: number;
  cardHeight?: number;
  cardWidth?: number;
};

const SelectionCard = React.memo(
  ({
    label,
    iconData,
    isSelected,
    onPress,
    vertical = false,
    delay = 0,
    posterUrl,
    scrollX,
    scrollY,
    index = 0,
    cardHeight = 140,
    cardWidth = 200,
  }: SelectionCardProps) => {
    const theme = useTheme();
    const scale = useSharedValue(1);
    const IconComponent = iconData.component;
    const color = isSelected ? theme.colors.primary : iconData.color;

    const animatedStyle = useAnimatedStyle(() => ({
      transform: [{ scale: withSpring(scale.value) }],
    }));

    const imageParallaxStyle = useAnimatedStyle(() => {
      if (!posterUrl) return {};

      // Horizontal scrolling parallax
      if (scrollX) {
        const cardMargin = 16;
        const inputRange = [
          (index - 1) * (cardWidth + cardMargin),
          index * (cardWidth + cardMargin),
          (index + 1) * (cardWidth + cardMargin),
        ];

        const translateX = interpolate(scrollX.value, inputRange, [-50, 0, 50], Extrapolate.CLAMP);

        return { transform: [{ translateX }] };
      }

      // Vertical scrolling parallax
      if (scrollY) {
        const cardMargin = 16;
        const inputRange = [
          (index - 1) * (cardHeight + cardMargin),
          index * (cardHeight + cardMargin),
          (index + 1) * (cardHeight + cardMargin),
        ];

        const translateY = interpolate(scrollY.value, inputRange, [-50, 0, 50], Extrapolate.CLAMP);

        return { transform: [{ translateY }] };
      }

      return {};
    });

    const handlePressIn = () => {
      scale.value = 0.97;
    };

    const handlePressOut = () => {
      scale.value = 1;
    };

    if (vertical) {
      return (
        <Animated.View entering={FadeIn.duration(400).delay(delay)} style={styles.cardContainerVertical}>
          <Pressable onPress={onPress} onPressIn={handlePressIn} onPressOut={handlePressOut}>
            <Animated.View
              style={[
                styles.cardVertical,
                { width: cardWidth, height: cardHeight },
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
                    <IconComponent name={iconData.name} size={40} color={color} />
                    <Text style={[styles.labelTextVertical, { color: isSelected ? theme.colors.primary : "#fff" }]}>{label}</Text>
                    {isSelected && (
                      <View style={[styles.checkmark, { backgroundColor: theme.colors.primary }]}>
                        <MaterialIcons name="check" size={24} color="#fff" />
                      </View>
                    )}
                  </LinearGradient>
                </>
              ) : (
                <View style={styles.placeholderContainer}>
                  <LinearGradient colors={["rgba(0,0,0,0.1)", "rgba(0,0,0,0.3)", "rgba(0,0,0,0.9)"]} style={styles.placeholderGradient}>
                    <IconComponent name={iconData.name} size={40} color={color} />
                    <Text style={[styles.labelTextVertical, { color: isSelected ? theme.colors.primary : "#fff" }]}>{label}</Text>
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
    }

    return (
      <View style={styles.cardContainer}>
        <Pressable onPress={onPress}>
          <View
            style={[
              styles.innerContainer,
              {
                borderColor: isSelected ? `${theme.colors.primary}40` : theme.colors.surface,
                borderRadius: 10,
                borderWidth: 1,
                backgroundColor: isSelected ? `${theme.colors.primary}20` : "transparent",
              },
            ]}
          >
            <IconComponent name={iconData.name} size={24} color={color} />
            <Text numberOfLines={2} style={[styles.labelText, { color: isSelected ? theme.colors.primary : theme.colors.onSurface }]}>
              {label}
            </Text>
          </View>
        </Pressable>
      </View>
    );
  }
);

SelectionCard.displayName = "SelectionCard";

const styles = StyleSheet.create({
  cardContainer: {
    marginRight: 15,
    marginBottom: 10,
  },
  cardContainerVertical: {
    marginRight: 16,
  },
  innerContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 7.5,
    paddingHorizontal: 15,
    height: 60,
    gap: 10,
  },
  cardVertical: {
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "#1a1a1a",
    borderWidth: 3,
    borderColor: "transparent",
  },
  background: {
    position: "absolute",
    width: "120%",
    height: "105%",
    left: "-10%",
    overflow: "hidden",
  },
  gradient: {
    position: "absolute",
    bottom: -3,
    left: -3,
    right: -3,
    top: 0,
    justifyContent: "flex-end",
    paddingHorizontal: 20,
    paddingBottom: 24,
    gap: 12,
    borderRadius: 16,
  },
  placeholder: {
    backgroundColor: "#2a2a2a",
  },
  placeholderContainer: {
    position: "absolute",
    width: "100%",
    height: "100%",
    backgroundColor: "#2a2a2a",
    borderRadius: 16,
    overflow: "hidden",
  },
  placeholderGradient: {
    flex: 1,
    justifyContent: "flex-end",
    paddingHorizontal: 20,
    paddingBottom: 24,
    gap: 12,
  },
  labelText: {
    marginLeft: 10,
    fontSize: 16,
    fontWeight: "700",
    fontFamily: "Bebas",
    flex: 1,
  },
  labelTextVertical: {
    fontSize: 38,
    fontWeight: "700",
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
  backgroundImage: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    borderRadius: 16,
  },
});

export default SelectionCard;
