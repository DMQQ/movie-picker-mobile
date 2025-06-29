import React from "react";
import { View, StyleSheet, ViewStyle, StyleProp } from "react-native";
import { BlurView } from "expo-blur";

interface FrostedGlassProps {
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  blurAmount?: number;
  borderRadius?: number;
  opacity?: number;

  container?: StyleProp<ViewStyle>;
}

const FrostedGlass: React.FC<FrostedGlassProps> = ({ children, style, blurAmount = 10, borderRadius = 16, opacity = 0.8, container }) => {
  return (
    <View style={[styles.container, { borderRadius }, container]}>
      <BlurView style={[StyleSheet.absoluteFill, { borderRadius }]} tint="dark" intensity={blurAmount} />
      <View style={[styles.overlay, { borderRadius, opacity }]} />
      <View style={[styles.content, style]}>{children}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
  },
  content: {
    flex: 1,
  },
});

export default FrostedGlass;
