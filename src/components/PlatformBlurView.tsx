import { BlurView } from "expo-blur";
import { Platform, View } from "react-native";
import { LiquidGlassView, isLiquidGlassSupported, LiquidGlassViewProps } from "@callstack/liquid-glass";
import { PropsWithChildren } from "react";

const isIOS26 = isLiquidGlassSupported;

const LiquidGlassViewWrapper = ({ children, ...rest }: PropsWithChildren<LiquidGlassViewProps>) => {
  return (
    <LiquidGlassView style={[rest.style, { overflow: "hidden" }]} effect="clear" tintColor="rgba(0,0,0,0.5)" {...rest}>
      {children}
    </LiquidGlassView>
  );
};

export const BlurViewWrapper = ({ children, ...rest }: PropsWithChildren<React.ComponentProps<typeof BlurView>>) => {
  if (Platform.OS === "android") {
    return <View {...rest}>{children}</View>;
  }
  return (
    <BlurView
      {...rest}
      intensity={rest.intensity || 50}
      tint="dark"
      style={[{ overflow: "hidden", borderWidth: 2, borderColor: "rgba(255,255,255,0.1)" }, rest.style]}
    >
      {children}
    </BlurView>
  );
};

const PlatformBlurView = Platform.OS === "android" ? View : isIOS26 ? LiquidGlassViewWrapper : BlurViewWrapper;

export default PlatformBlurView;
