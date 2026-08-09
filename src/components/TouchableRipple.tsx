import type { ReactNode } from "react";
import {
  Pressable,
  StyleSheet,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { colors } from "../constants/design";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface TouchableRippleProps {
  onPress?: () => void;
  rippleColor?: string;
  style?: StyleProp<ViewStyle>;
  disabled?: boolean;
  /** paper compat — our press feedback is opacity-based, not a ripple shape */
  borderless?: boolean;
  children?: ReactNode;
}

export default function TouchableRipple({
  onPress,
  rippleColor,
  style,
  disabled,
  borderless,
  children,
}: TouchableRippleProps) {
  const opacity = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <AnimatedPressable
      onPressIn={() => {
        opacity.value = withTiming(0.6, { duration: 100 });
      }}
      onPressOut={() => {
        opacity.value = withTiming(1, { duration: 150 });
      }}
      onPress={onPress}
      disabled={disabled}
      android_ripple={
        rippleColor
          ? { color: rippleColor }
          : { color: colors.border }
      }
      style={[animStyle, style]}
    >
      {children}
    </AnimatedPressable>
  );
}
