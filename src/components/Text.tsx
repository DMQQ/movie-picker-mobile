import { Text as RNText, type TextProps } from "react-native";
import { colors } from "../constants/design";

interface CustomTextProps extends TextProps {
  /** paper v3 compat — v2 theme ignored this, so it does nothing here */
  variant?: string;
}

export default function Text({ style, variant, ...rest }: CustomTextProps) {
  return <RNText style={[{ color: colors.text }, style]} {...rest} />;
}
