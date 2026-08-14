import { useRef, type ComponentProps, type ReactNode } from "react";
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
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import Touch from "./Touch";
import { colors, fontSize, fontWeight, radius, spacing } from "../constants/design";

const AnimatedView = Animated.createAnimatedComponent(View);
const AnimatedText = Animated.createAnimatedComponent(Text);

const FIELD_HEIGHT_LABEL = 56;
const LABEL_INACTIVE_TOP = 20; // (56 - ~17px natural text height) / 2, with includeFontPadding:false
const LABEL_ACTIVE_TOP = 6;
const LABEL_ACTIVE_SIZE = 11;

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
  onChangeText,
  value,
  ...rest
}: TextInputProps) {
  const hasContent = useRef(!!value);
  const active = useSharedValue(value ? 1 : 0);
  const focused = useSharedValue(0);

  const borderAnim = useAnimatedStyle(() => ({
    borderColor: error
      ? colors.error
      : focused.value
        ? colors.primary
        : colors.border,
  }));

  const labelAnim = useAnimatedStyle(() => ({
    top: interpolate(active.value, [0, 1], [LABEL_INACTIVE_TOP, LABEL_ACTIVE_TOP]),
    fontSize: interpolate(active.value, [0, 1], [fontSize.md, LABEL_ACTIVE_SIZE]),
    color: error ? colors.error : focused.value ? colors.primary : colors.placeholder,
  }));

  return (
    <View style={style as ViewStyle}>
      <AnimatedView
        style={[
          styles.field,
          label && styles.fieldWithLabel,
          multiline && styles.fieldMultiline,
          borderAnim,
          outlineStyle as ViewStyle,
        ]}
      >
        {label ? (
          <>
            <View pointerEvents="none" style={styles.floatingLabelWrapper}>
              <AnimatedText
                style={[styles.floatingLabel, labelAnim, labelStyle]}
                numberOfLines={1}
              >
                {label}
              </AnimatedText>
            </View>
            <View style={[styles.inputRow, right && styles.inputRowWithRight]}>
              <RNTextInput
                {...rest}
                value={value}
                multiline={multiline}
                placeholderTextColor="transparent"
                selectionColor={selectionColor}
                onFocus={(e) => {
                  focused.value = withTiming(1, { duration: 150 });
                  active.value = withTiming(1, { duration: 150 });
                  onFocus?.(e);
                }}
                onBlur={(e) => {
                  focused.value = withTiming(0, { duration: 150 });
                  if (!hasContent.current) active.value = withTiming(0, { duration: 150 });
                  onBlur?.(e);
                }}
                onChangeText={(text) => {
                  hasContent.current = text.length > 0;
                  if (text.length > 0) active.value = withTiming(1, { duration: 150 });
                  onChangeText?.(text);
                }}
                style={[styles.input, styles.inputWithLabel, multiline && styles.inputMultiline, contentStyle]}
              />
            </View>
            {right && <View style={styles.rightAbsolute}>{right}</View>}
          </>
        ) : (
          <>
            <RNTextInput
              {...rest}
              value={value}
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
              onChangeText={onChangeText}
              style={[styles.input, multiline && styles.inputMultiline, contentStyle, style as TextStyle]}
            />
            {right}
          </>
        )}
      </AnimatedView>
    </View>
  );
}

const styles = StyleSheet.create({
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
  fieldWithLabel: {
    height: FIELD_HEIGHT_LABEL,
    flexDirection: "column",
    alignItems: "stretch",
    paddingHorizontal: 0,
  },
  fieldMultiline: {
    height: "auto",
    minHeight: 100,
    alignItems: "flex-start",
  },
  floatingLabelWrapper: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  floatingLabel: {
    position: "absolute",
    left: spacing.lg,
    right: spacing.lg,
    includeFontPadding: false,
    fontWeight: fontWeight.medium,
    color: colors.placeholder,
  },
  inputRow: {
    flex: 1,
    flexDirection: "row",
    alignItems: "stretch",
    paddingHorizontal: spacing.lg,
  },
  inputRowWithRight: {
    paddingRight: spacing.lg + 28,
  },
  rightAbsolute: {
    position: "absolute",
    right: spacing.sm,
    top: 0,
    bottom: 0,
    justifyContent: "center",
  },
  input: {
    flex: 1,
    color: colors.text,
    fontSize: fontSize.md,
    paddingVertical: 0,
  },
  inputWithLabel: {
    paddingTop: 18,
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
