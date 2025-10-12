import { BlurView } from "expo-blur";
import { Platform, View } from "react-native";
import { GlassView, isLiquidGlassAvailable, GlassViewProps } from "expo-glass-effect";
import { PropsWithChildren } from "react";

const isIOS26 = isLiquidGlassAvailable();

const GlassViewWrapper = ({ children, ...rest }: PropsWithChildren<GlassViewProps>) => {
  return (
    <GlassView {...rest} style={[rest.style, { overflow: "hidden" }]} glassEffectStyle="clear" tintColor="rgba(0,0,0,0.5)">
      {children}
    </GlassView>
  );
};

export const BlurViewWrapper = ({ children, ...rest }: PropsWithChildren<React.ComponentProps<typeof BlurView>>) => {
  if (Platform.OS === "android") {
    return <View {...rest}>{children}</View>;
  }
  return (
    <BlurView
      {...rest}
      intensity={50}
      tint="dark"
      style={[rest.style, { overflow: "hidden", borderWidth: 2, borderColor: "rgba(255,255,255,0.1)" }]}
    >
      {children}
    </BlurView>
  );
};

const PlatformBlurView = Platform.OS === "android" ? View : isIOS26 ? GlassViewWrapper : BlurViewWrapper;

export default PlatformBlurView;
