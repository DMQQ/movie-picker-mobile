import { ReactNode } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { View } from "react-native";

export default function SafeIOSContainer({ children }: { children: ReactNode }) {
  const insets = useSafeAreaInsets();

  return <View style={{ flex: 1, marginTop: insets.top, marginBottom: insets.bottom }}>{children}</View>;
}
