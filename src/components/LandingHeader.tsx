import { LinearGradient } from "expo-linear-gradient";
import { colors } from "../constants/design";

const LandingHeader = () => {
  return (
    <LinearGradient
      colors={[colors.appBackground, "rgba(0,0,0,0.6)", "transparent"]}
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        height: 220,
        zIndex: 90,
      }}
      pointerEvents="none"
    />
  );
};

export default LandingHeader;
