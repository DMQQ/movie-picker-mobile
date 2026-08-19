import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useCallback, useEffect, useState } from "react";
import {
  Pressable,
  StyleSheet,
  View,
  type LayoutChangeEvent,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { colors, fontWeight, fontSize, radius } from "../constants/design";
import Text from "./Text";

interface Option {
  value: string;
  label: string;
  icon?: keyof typeof MaterialCommunityIcons.glyphMap;
}

interface SegmentedControlProps {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  duration?: number;
  size?: "sm" | "md";
  style?: StyleProp<ViewStyle>;
}

export default function SegmentedControl({
  options,
  value,
  onChange,
  duration = 220,
  size = "md",
  style,
}: SegmentedControlProps) {
  const [containerWidth, setContainerWidth] = useState(0);
  const translateX = useSharedValue(0);
  const index = options.findIndex((o) => o.value === value);
  const segW = containerWidth > 0 ? containerWidth / options.length : 0;

  const handleLayout = useCallback((e: LayoutChangeEvent) => {
    setContainerWidth(e.nativeEvent.layout.width);
  }, []);

  useEffect(() => {
    if (segW === 0) return;
    translateX.value = withTiming(index * segW, { duration });
  }, [index, segW]);

  const indicatorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value + 4 }],
  }));

  return (
    <View style={[styles.container, style]} onLayout={handleLayout}>
      {segW > 0 && (
        <Animated.View
          style={[
            styles.indicator,
            size === "sm" && styles.indicatorSm,
            { width: segW - 8 },
            indicatorStyle,
          ]}
        />
      )}
      {options.map((option) => {
        const active = option.value === value;
        return (
          <Pressable
            key={option.value}
            onPress={() => onChange(option.value)}
            style={[styles.tab, size === "sm" && styles.tabSm]}
          >
            {option.icon && (
              <MaterialCommunityIcons
                name={option.icon}
                size={size === "sm" ? 14 : 16}
                color={active ? colors.text : colors.placeholder}
                style={styles.icon}
              />
            )}
            <Text
              style={[
                styles.label,
                size === "sm" && styles.labelSm,
                active && styles.labelActive,
              ]}
            >
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    backgroundColor: colors.input,
    borderRadius: radius.pill,
    padding: 4,
  },
  indicator: {
    position: "absolute",
    top: 4,
    bottom: 4,
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
  },
  indicatorSm: {
    top: 3,
    bottom: 3,
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    paddingVertical: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  tabSm: {
    paddingVertical: 5,
  },
  icon: {
    marginRight: 4,
  },
  label: {
    fontSize: fontSize.md,
    color: colors.placeholder,
  },
  labelSm: {
    fontSize: fontSize.sm,
  },
  labelActive: {
    color: colors.text,
    fontWeight: fontWeight.semibold,
  },
});
