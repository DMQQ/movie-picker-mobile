import { LinearGradient } from "expo-linear-gradient";
import { colors } from "../constants/design";

const LandingHeader = () => {
  return (
    <LinearGradient
      colors={["transparent", "rgba(0,0,0,0.6)", colors.appBackground]}
      style={{
        position: "absolute",
        bottom:0,
        left: 0,
        right: 0,
        height: 100,
        zIndex: 90,
      }}
      pointerEvents="none"
    />
  );
};

export default LandingHeader;
