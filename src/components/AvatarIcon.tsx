import type { ComponentProps } from "react";
import { StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { colors } from "../constants/design";

interface AvatarIconProps {
  icon: string;
  size?: number;
  color?: string;
  style?: StyleProp<ViewStyle>;
}

export default function AvatarIcon({ icon, size = 48, color = colors.text, style }: AvatarIconProps) {
  return (
    <View
      style={[
        styles.circle,
        { width: size, height: size, borderRadius: size / 2 },
        style,
      ]}
    >
      <MaterialCommunityIcons
        name={icon as ComponentProps<typeof MaterialCommunityIcons>["name"]}
        size={size * 0.55}
        color={color}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  circle: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surfaceElevated,
  },
});
