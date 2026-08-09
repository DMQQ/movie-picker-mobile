import type { ComponentProps, ReactNode } from "react";
import {
  StyleSheet,
  Text,
  TextInput as RNTextInput,
  View,
  type StyleProp,
  type TextInputProps as RNTextInputProps,
  type TextStyle,
  type ViewStyle,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import Touch from "./Touch";
import { colors, fontSize, fontWeight, radius, spacing } from "../constants/design";

const AnimatedView = Animated.createAnimatedComponent(View);

interface TextInputProps extends Omit<RNTextInputProps, "style"> {
  label?: string;
  error?: boolean;
  right?: ReactNode;
  /** applied to the container and the input, so both layout and text styles work */
  style?: StyleProp<TextStyle>;
  /** text styles applied to the input itself */
  contentStyle?: StyleProp<TextStyle>;
  /** text-style typing like paper; applied to the field border (text props ignored) */
  outlineStyle?: StyleProp<TextStyle>;
  labelStyle?: StyleProp<TextStyle>;
}

function TextInputIcon({
  icon,
  onPress,
  color = colors.placeholder,
  size = 20,
}: {
  icon: string;
  onPress?: () => void;
  color?: string;
  size?: number;
}) {
  return (
    <Touch onPress={onPress} hitSlop={8} style={styles.rightIcon}>
      <MaterialCommunityIcons
        name={icon as ComponentProps<typeof MaterialCommunityIcons>["name"]}
        size={size}
        color={color}
      />
    </Touch>
  );
}

function TextInputBase({
  label,
  error,
  right,
  style,
  contentStyle,
  outlineStyle,
  labelStyle,
  multiline,
  placeholderTextColor = colors.placeholder,
  selectionColor = colors.primary,
  onFocus,
  onBlur,
  ...rest
}: TextInputProps) {
  const focused = useSharedValue(0);

  const animStyle = useAnimatedStyle(() => ({
    borderColor: error
      ? colors.error
      : focused.value
        ? colors.primary
        : colors.border,
  }));

  return (
    <View style={style as StyleProp<ViewStyle>}>
      {label ? (
        <Text style={[styles.label, error && { color: colors.error }, labelStyle]}>
          {label}
        </Text>
      ) : null}
      <AnimatedView
        style={[
          styles.field,
          multiline && styles.fieldMultiline,
          animStyle,
          outlineStyle as StyleProp<ViewStyle>,
        ]}
      >
        <RNTextInput
          {...rest}
          multiline={multiline}
          placeholderTextColor={placeholderTextColor}
          selectionColor={selectionColor}
          onFocus={(e) => {
            focused.value = withTiming(1, { duration: 150 });
            onFocus?.(e);
          }}
          onBlur={(e) => {
            focused.value = withTiming(0, { duration: 150 });
            onBlur?.(e);
          }}
          style={[styles.input, multiline && styles.inputMultiline, contentStyle, style as StyleProp<TextStyle>]}
        />
        {right}
      </AnimatedView>
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    fontSize: fontSize.sm,
    color: colors.placeholder,
    marginBottom: spacing.xs,
    fontWeight: fontWeight.medium,
  },
  field: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.input,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    height: 50,
    paddingHorizontal: spacing.lg,
  },
  fieldMultiline: {
    height: "auto",
    minHeight: 100,
    alignItems: "flex-start",
  },
  input: {
    flex: 1,
    color: colors.text,
    fontSize: fontSize.md,
    paddingVertical: 0,
  },
  inputMultiline: {
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
    textAlignVertical: "top",
  },
  rightIcon: {
    paddingLeft: spacing.sm,
  },
});

const TextInput = Object.assign(TextInputBase, { Icon: TextInputIcon });
export default TextInput;
