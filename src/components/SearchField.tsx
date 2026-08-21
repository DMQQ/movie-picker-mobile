import { useEffect, useRef, useState, type ComponentProps } from "react";
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
  /** Debounce delay in ms. When set, the component owns display state internally. */
  debounceMs?: number;
  style?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<TextStyle>;
  autoFocus?: boolean;
  autoCorrect?: boolean;
  returnKeyType?: ComponentProps<typeof TextInput>["returnKeyType"];
}

export default function SearchField({
  placeholder,
  value,
  onChangeText,
  debounceMs,
  style,
  inputStyle,
  autoFocus,
  autoCorrect = false,
  returnKeyType,
}: SearchFieldProps) {
  const [localValue, setLocalValue] = useState(value);
  const debounceTimer = useRef<ReturnType<typeof setTimeout>>(null);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleChange = (text: string) => {
    setLocalValue(text);
    if (debounceMs) {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
      debounceTimer.current = setTimeout(() => onChangeText(text), debounceMs);
    } else {
      onChangeText(text);
    }
  };

  const handleClear = () => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    setLocalValue("");
    onChangeText("");
  };

  return (
    <View style={[styles.bar, style]}>
      <MaterialCommunityIcons name="magnify" size={20} color={colors.placeholder} />
      <TextInput
        value={localValue}
        onChangeText={handleChange}
        placeholder={placeholder}
        placeholderTextColor={colors.placeholder}
        selectionColor={colors.primary}
        autoFocus={autoFocus}
        autoCorrect={autoCorrect}
        returnKeyType={returnKeyType}
        style={[styles.input, inputStyle]}
      />
      {localValue.length > 0 && (
        <Touch onPress={handleClear} hitSlop={8}>
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
    backgroundColor: colors.overlay,
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
