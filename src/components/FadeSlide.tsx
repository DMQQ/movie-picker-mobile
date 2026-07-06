import { StyleProp, ViewStyle } from "react-native";
import Animated, { FadeInUp } from "react-native-reanimated";

interface Props {
  delay?: number;
  duration?: number;
  style?: StyleProp<ViewStyle>;
  children: React.ReactNode;
}

export default function FadeSlide({ delay = 0, duration = 380, style, children }: Props) {
  return (
    <Animated.View entering={FadeInUp.delay(delay).duration(duration)} style={style}>
      {children}
    </Animated.View>
  );
}
