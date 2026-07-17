import { Button } from "react-native-paper";
import type { ReactNode } from "react";
import type { StyleProp, ViewStyle } from "react-native";

interface Props {
  onPress?: () => void;
  children: ReactNode;
  disabled?: boolean;
  loading?: boolean;
  buttonColor?: string;
  textColor?: string;
  style?: StyleProp<ViewStyle>;
  icon?: (props: { color: string; size: number }) => ReactNode;
}

export default function PrimaryButton({
  onPress,
  children,
  disabled,
  loading,
  buttonColor,
  textColor,
  style,
  icon,
}: Props) {
  return (
    <Button
      mode="contained"
      onPress={onPress}
      disabled={disabled}
      loading={loading}
      buttonColor={buttonColor}
      textColor={textColor}
      icon={icon}
      style={style}
      contentStyle={{ height: 50, borderRadius: 100 }}
      labelStyle={{ fontSize: 14, fontWeight: "600", letterSpacing: 0.8 }}
    >
      {children}
    </Button>
  );
}
