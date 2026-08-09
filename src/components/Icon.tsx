import type { ComponentProps, ReactNode } from "react";
import { View, type StyleProp, type TextStyle, type ViewStyle } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { colors } from "../constants/design";

type IconSource = string | ((props: { color: string; size: number }) => ReactNode);

interface IconProps {
  source: IconSource;
  size?: number;
  color?: string;
  style?: StyleProp<TextStyle>;
}

export default function Icon({ source, size = 24, color = colors.text, style }: IconProps) {
  if (typeof source === "function") {
    return <View style={style as StyleProp<ViewStyle>}>{source({ color, size })}</View>;
  }
  return (
    <MaterialCommunityIcons
      name={source as ComponentProps<typeof MaterialCommunityIcons>["name"]}
      size={size}
      color={color}
      style={style}
    />
  );
}
