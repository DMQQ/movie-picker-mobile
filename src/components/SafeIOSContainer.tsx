import { ReactNode } from "react";
import { StyleProp, View, ViewStyle } from "react-native";

export default function SafeIOSContainer({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[{ flex: 1 }, style]}>{children}</View>;
}
