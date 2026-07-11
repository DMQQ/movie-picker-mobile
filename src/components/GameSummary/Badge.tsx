import { memo } from "react";
import { Platform, View } from "react-native";
import { MD2DarkTheme } from "react-native-paper";
import { LiquidGlassView } from "@callstack/liquid-glass";
import ThumbsUp from "../../assets/ThumbsUp";

const Badge = memo(() => (
  <View
    style={{
      position: "absolute",
      top: 5,
      left: 5,
      borderRadius: 100,
      overflow: "hidden",
      zIndex: 10,
    }}
  >
    <LiquidGlassView
      effect="regular"
      tintColor={MD2DarkTheme.colors.primary + "aa"}
      style={[
        {
          borderRadius: 100,
          padding: 5,
          borderWidth: 1,
          borderColor: MD2DarkTheme.colors.primary,
        },
        Platform.OS === "android" && {
          backgroundColor: MD2DarkTheme.colors.primary + "cc",
        },
      ]}
    >
      <ThumbsUp width={18} height={18} />
    </LiquidGlassView>
  </View>
));

export default Badge;
