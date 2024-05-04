import { StyleProp, ViewStyle } from "react-native";
import { Card as CardComponent } from "react-native-paper";

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
  );
}
