import { StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { colors, radius} from "../constants/design";

interface CheckboxProps {
  status: "checked" | "unchecked" | "indeterminate";
  color?: string;
  uncheckedColor?: string;
  onPress?: () => void;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}

export default function Checkbox({
  status,
  color = colors.text,
  uncheckedColor = "rgba(255,255,255,0.4)",
  onPress,
  disabled,
  style,
}: CheckboxProps) {
  const checked = status === "checked";
  return (
    <View
      onTouchEnd={disabled ? undefined : onPress}
      style={[
        styles.box,
        checked
          ? { backgroundColor: color, borderColor: color }
          : { backgroundColor: "transparent", borderColor: uncheckedColor },
        style,
      ]}
    >
      {checked && (
        <MaterialCommunityIcons name="check" size={14} color={isLight(color) ? colors.appBackground : colors.text} />
      )}
    </View>
  );
}

function isLight(c: string) {
  const hex = c.replace("#", "");
  if (hex.length !== 6) return false;
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.5;
}

const styles = StyleSheet.create({
  box: {
    width: 22,
    height: 22,
    borderRadius: radius.xs + 2,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
});
