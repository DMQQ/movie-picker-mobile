// src/screens/Room/RoomSetup/components/SelectionCard.tsx
import React from "react";
import Text from "../Text";
import { useTheme } from "../../hooks/useTheme";
import { StyleSheet, View, Pressable } from "react-native";

import { colors, fontWeight, fontSize, radius, spacing, typography } from "../../constants/design";
import Animated, { FadeIn, useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";
import { MaterialCommunityIcons } from "@expo/vector-icons";
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
                  <View style={styles.background}>
                    <Thumbnail path={posterUrl} size={780} priority="high" container={styles.backgroundImage} contentFit="cover" />
                  </View>
                  <LinearGradient colors={["rgba(0,0,0,0.1)", "rgba(0,0,0,0.3)", "rgba(0,0,0,0.9)"]} style={styles.gradient}>
                    <IconComponent name={iconData.name} size={40} color={color} />
                    <Text style={[styles.labelTextVertical, { color: isSelected ? theme.colors.primary : colors.text }]}>{label}</Text>
                    {isSelected && (
                      <View style={[styles.checkmark, { backgroundColor: theme.colors.primary }]}>
                        <MaterialCommunityIcons name="check" size={24} color={colors.text} />
                      </View>
                    )}
                  </LinearGradient>
                </>
              ) : (
                <View style={styles.placeholderContainer}>
                  <LinearGradient colors={["rgba(0,0,0,0.1)", "rgba(0,0,0,0.3)", "rgba(0,0,0,0.9)"]} style={styles.placeholderGradient}>
                    <IconComponent name={iconData.name} size={40} color={color} />
                    <Text style={[styles.labelTextVertical, { color: isSelected ? theme.colors.primary : colors.text }]}>{label}</Text>
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
    }

    return (
      <View style={styles.cardContainer}>
        <Pressable onPress={onPress}>
          <View
            style={[
              styles.innerContainer,
              {
                borderColor: isSelected ? `${theme.colors.primary}40` : theme.colors.surface,
                borderRadius: radius.sm + 2,
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
    marginRight: spacing.screen,
    marginBottom: spacing.sm + 2,
  },
  cardContainerVertical: {
    marginRight: spacing.lg,
  },
  innerContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.xs + 3.5,
    paddingHorizontal: spacing.screen,
    height: 60,
    gap: spacing.sm + 2,
  },
  cardVertical: {
    borderRadius: radius.card,
    overflow: "hidden",
    backgroundColor: colors.input,
    borderWidth: 3,
    borderColor: "transparent",
  },
  background: {
    position: "absolute",
    width: "100%",
    height: "100%",
    overflow: "hidden",
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
    gap: spacing.md,
    borderRadius: radius.card,
  },
  placeholder: {
    backgroundColor: colors.surfaceElevated,
  },
  placeholderContainer: {
    position: "absolute",
    width: "100%",
    height: "100%",
    backgroundColor: colors.surfaceElevated,
    borderRadius: radius.card,
    overflow: "hidden",
  },
  placeholderGradient: {
    flex: 1,
    justifyContent: "flex-end",
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxl,
    gap: spacing.md,
  },
  labelText: {
    marginLeft: spacing.sm + 2,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    fontFamily: "Bebas",
    flex: 1,
  },
  labelTextVertical: {
    fontSize: typography.bebasSize.auth,
    fontWeight: fontWeight.bold,
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
  backgroundImage: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    borderRadius: radius.card,
  },
});

export default SelectionCard;
