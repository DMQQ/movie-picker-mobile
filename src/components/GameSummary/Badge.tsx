import { memo } from "react";
import { colors, radius, spacing } from "../../constants/design";
import { Platform, View } from "react-native";
import { LiquidGlassView } from "@callstack/liquid-glass";
import ThumbsUp from "../../assets/ThumbsUp";

const Badge = memo(() => (
  <View
    style={{
      position: "absolute",
      top: 5,
      left: 5,
      borderRadius: radius.pill,
      overflow: "hidden",
      zIndex: 10,
    }}
  >
    <LiquidGlassView
      effect="regular"
      tintColor={colors.primary + "aa"}
      style={[
        {
          borderRadius: radius.pill,
          padding: spacing.xs + 1,
          borderWidth: 1,
          borderColor: colors.primary,
        },
        Platform.OS === "android" && {
          backgroundColor: colors.primary + "cc",
        },
      ]}
    >
      <ThumbsUp width={18} height={18} />
    </LiquidGlassView>
  </View>
));

export default Badge;
