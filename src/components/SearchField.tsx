import type { ComponentProps } from "react";
import {
  StyleSheet,
  TextInput,
  View,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import Touch from "./Touch";
import { colors, fontSize, spacing } from "../constants/design";

interface SearchFieldProps {
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  style?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<TextStyle>;
}

export default function SearchField({ placeholder, value, onChangeText, style, inputStyle }: SearchFieldProps) {
  return (
    <View style={[styles.bar, style]}>
      <MaterialCommunityIcons name="magnify" size={20} color={colors.placeholder} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.placeholder}
        selectionColor={colors.primary}
        style={[styles.input, inputStyle]}
      />
      {value.length > 0 && (
        <Touch onPress={() => onChangeText("")} hitSlop={8}>
          <MaterialCommunityIcons
            name="close-circle"
            size={18}
            color={colors.placeholder}
          />
        </Touch>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    height: 48,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.input,
    borderRadius: 100,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  input: {
    flex: 1,
    color: colors.text,
    fontSize: fontSize.md,
    paddingVertical: 0,
  },
});
