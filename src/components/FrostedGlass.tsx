import { BlurView } from "expo-blur";
import React from "react";
import { Platform, StyleProp, StyleSheet, View, ViewStyle } from "react-native";
import { colors } from "../constants/design";

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
      <BlurView
        style={[
          StyleSheet.absoluteFill,
          Platform.OS === "android"
            ? {
                backgroundColor: "rgba(0, 0, 0, 0.5)",
              }
            : {},
          { borderRadius },
        ]}
        tint="dark"
        intensity={blurAmount}
      />
      <View style={[styles.overlay, { borderRadius, opacity }]} />
      <View style={[styles.content, style]}>{children}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.border,
  },
  overlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
  },
  content: {
    flex: 1,
  },
});

export default FrostedGlass;
