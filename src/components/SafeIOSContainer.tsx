import { ReactNode } from "react";
import { StyleProp, View, ViewStyle } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function SafeIOSContainer({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[{ flex: 1, backgroundColor: "#000", paddingTop: insets.top, paddingBottom: insets.bottom }, style]}>{children}</View>
  );
}
