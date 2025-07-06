import { ReactNode } from "react";
import { Platform, StyleProp, View, ViewStyle } from "react-native";

export default function SafeIOSContainer({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[{ flex: 1, paddingVertical: Platform.OS === "web" ? 20 : 0 }, style]}>{children}</View>;
}
