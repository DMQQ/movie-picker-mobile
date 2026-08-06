import { Button } from "react-native-paper";
import type { ReactNode } from "react";
import type { StyleProp, ViewStyle } from "react-native";
import { common, fontSize, fontWeight } from "../constants/design";

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
      style={[style, common.pillButton]}
      contentStyle={common.pillButton}
      labelStyle={{ fontSize: fontSize.md, fontWeight: fontWeight.semibold, letterSpacing: 0.8 }}
    >
      {children}
    </Button>
  );
}
