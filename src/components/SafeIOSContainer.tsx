import { ReactNode } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StyleProp, View, ViewStyle } from "react-native";

export default function SafeIOSContainer({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  const insets = useSafeAreaInsets();

  return <View style={[{ flex: 1, marginTop: insets.top, marginBottom: insets.bottom }, style]}>{children}</View>;
}
