import { ActivityIndicator, Pressable, StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";
import { MD2DarkTheme } from "react-native-paper";
import type { ReactNode } from "react";
import type { StyleProp, ViewStyle } from "react-native";

const H = 50;
const D = 4; // equal x and y shadow offset
const RADIUS = 10;
const SPRING = { damping: 18, stiffness: 500 };

function darken(hex: string): string {
  const n = parseInt(hex.replace(/^#/, ""), 16);
  return `rgb(${Math.floor(((n >> 16) & 0xff) * 0.38)},${Math.floor(((n >> 8) & 0xff) * 0.38)},${Math.floor((n & 0xff) * 0.38)})`;
}

interface Props {
  onPress?: () => void;
  children: ReactNode;
  disabled?: boolean;
  loading?: boolean;
  buttonColor?: string;
  textColor?: string;
  style?: StyleProp<ViewStyle>;
  icon?: (props: { color: string }) => ReactNode;
}

export default function PrimaryButton({
  onPress,
  children,
  disabled,
  loading,
  buttonColor = MD2DarkTheme.colors.primary,
  textColor = "#fff",
  style,
  icon,
}: Props) {
  const progress = useSharedValue(0);

  const faceAnim = useAnimatedStyle(() => ({
    transform: [
      { translateX: -progress.value * D },
      { translateY: progress.value * D },
    ],
  }));

  const inactive = disabled || loading;

  function handlePressIn() {
    progress.value = withSpring(1, SPRING);
  }

  function handlePressOut() {
    progress.value = withSpring(0, SPRING);
  }

  const faceColor = inactive ? "#2e2e2e" : buttonColor;
  const shadowColor = inactive ? "#1a1a1a" : darken(buttonColor);
  const labelColor = inactive ? "rgba(255,255,255,0.3)" : textColor;

  return (
    <View style={[{ height: H + D }, style]}>
      {/* shadow tile: offset left+down from face */}
      <View
        style={{
          position: "absolute",
          top: D,
          left: -D,
          right: D,
          bottom: 0,
          borderRadius: RADIUS,
          backgroundColor: shadowColor,
        }}
      />
      {/* face tile */}
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={inactive}
        style={StyleSheet.absoluteFill}
      >
        <Animated.View
          style={[
            faceAnim,
            {
              position: "absolute",
              top: 0,
              left: 0,
              right: D,
              height: H,
              borderRadius: RADIUS,
              backgroundColor: faceColor,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
            },
          ]}
        >
          {loading ? (
            <ActivityIndicator size={16} color={labelColor} />
          ) : icon ? (
            icon({ color: labelColor })
          ) : null}
          <Text style={[styles.label, { color: labelColor }]}>{children}</Text>
        </Animated.View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    fontSize: 14,
    fontWeight: "600",
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
});
