import { StyleProp, ViewStyle } from "react-native";
import { Card as CardComponent } from "react-native-paper";
import Animated, {
  SlideInDown,
  SlideOutDown,
  ZoomIn,
} from "react-native-reanimated";

export default function Card({
  children,
  style,
  onPress,
}: {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
}) {
  return (
    <Animated.View
      entering={SlideInDown.duration(100)}
      exiting={SlideOutDown.duration(50)}
    >
      <CardComponent
        onPress={onPress}
        style={[
          {
            width: "auto",
            height: "auto",
            borderRadius: 25,
          },
          style,
        ]}
      >
        {children}
      </CardComponent>
    </Animated.View>
  );
}
