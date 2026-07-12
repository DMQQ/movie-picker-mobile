import { LinearGradient } from "expo-linear-gradient";

const LandingHeader = () => {
  return (
    <LinearGradient
      colors={["#000", "rgba(0,0,0,0.6)", "transparent"]}
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
