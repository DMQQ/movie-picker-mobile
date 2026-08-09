import { StyleSheet, View, type StyleProp, type TextStyle, type ViewStyle } from "react-native";
import Touch from "./Touch";
import Text from "./Text";
import { colors, fontSize, fontWeight } from "../constants/design";

interface SegmentedButton {
  value: string;
  label: string;
  icon?: string;
  style?: StyleProp<ViewStyle>;
  labelStyle?: StyleProp<TextStyle>;
  disabled?: boolean;
}

interface SegmentedButtonsProps {
  value: string;
  onValueChange: (value: string) => void;
  buttons: SegmentedButton[];
  style?: StyleProp<ViewStyle>;
}

export default function SegmentedButtons({ value, onValueChange, buttons, style }: SegmentedButtonsProps) {
  return (
    <View style={[styles.container, style]}>
      {buttons.map((button) => {
        const selected = button.value === value;
        return (
          <Touch
            key={button.value}
            onPress={() => onValueChange(button.value)}
            disabled={button.disabled || selected}
            style={[styles.segment, selected && styles.segmentSelected, button.style]}
          >
            <Text
              style={[
                styles.label,
                selected && styles.labelSelected,
                button.labelStyle,
              ]}
            >
              {button.label}
            </Text>
          </Touch>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    backgroundColor: colors.input,
  },
  segment: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    height: 40,
  },
  segmentSelected: {
    backgroundColor: colors.primary,
  },
  label: {
    fontSize: fontSize.md,
    color: "#999",
  },
  labelSelected: {
    color: colors.appBackground,
    fontWeight: fontWeight.semibold,
  },
});
