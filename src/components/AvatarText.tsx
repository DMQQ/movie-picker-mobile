import { StyleSheet, Text, View, type StyleProp, type TextStyle, type ViewStyle } from "react-native";
import { colors, fontWeight } from "../constants/design";

interface AvatarTextProps {
  label: string;
  size?: number;
  color?: string;
  style?: StyleProp<ViewStyle>;
  labelStyle?: StyleProp<TextStyle>;
}

export default function AvatarText({
  label,
  size = 48,
  color = colors.text,
  style,
  labelStyle,
}: AvatarTextProps) {
  return (
    <View
      style={[
        styles.circle,
        { width: size, height: size, borderRadius: size / 2 },
        style,
      ]}
    >
      <Text
        style={[
          styles.label,
          { fontSize: size * 0.4, color },
          labelStyle,
        ]}
      >
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  circle: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surfaceElevated,
  },
  label: {
    fontWeight: fontWeight.semibold,
  },
});
