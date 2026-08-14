import { ReactNode } from "react";
import { StyleProp, View, ViewStyle } from "react-native";
import { useSafeAreaInsets, initialWindowMetrics } from "react-native-safe-area-context";
import { colors } from "../constants/design";

export default function SafeIOSContainer({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  const insets = useSafeAreaInsets();

  const paddingTop = Math.max(initialWindowMetrics?.insets.top ?? 0, insets.top);
  return (
    <View style={[{ flex: 1, backgroundColor: colors.appBackground, paddingTop, paddingBottom: insets.bottom }, style]}>{children}</View>
  );
}
