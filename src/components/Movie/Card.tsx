import { StyleProp, ViewStyle, useWindowDimensions } from "react-native";
import { Button, Card as CardComponent, useTheme } from "react-native-paper";
import Animated, {
  SlideOutDown,
  ZoomInDown,
  JumpingTransition,
} from "react-native-reanimated";

export default function Card({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  const { width, height } = useWindowDimensions();
  const theme = useTheme();

  return (
    <Animated.View
      layout={JumpingTransition}
      entering={ZoomInDown.duration(200)}
      exiting={SlideOutDown.duration(100)}
    >
      <CardComponent
        style={[
          {
            width: width * 0.9,
            height: height * 0.7,
            backgroundColor: theme.colors.surface,
            borderRadius: 25,
            padding: 10,
            borderWidth: 1,
            borderColor: "#1F1F1F",
          },
          style,
        ]}
      >
        {children}
      </CardComponent>
    </Animated.View>
  );
}
