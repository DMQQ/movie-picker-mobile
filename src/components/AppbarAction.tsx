import type { ReactNode } from "react";
import type { StyleProp, ViewStyle } from "react-native";
import IconButton from "./IconButton";

interface AppbarActionProps {
  icon: string | ((props: { color: string; size: number }) => ReactNode);
  color?: string;
  size?: number;
  onPress?: () => void;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}

export default function AppbarAction(props: AppbarActionProps) {
  return <IconButton {...props} />;
}
