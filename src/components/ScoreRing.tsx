import { memo } from "react";
import { Text, View } from "react-native";
import Svg, { Circle } from "react-native-svg";
import FrostedGlass from "./FrostedGlass";

const getColor = (score: number) => {
  if (score >= 7) return "#21d07a"; // Green
  if (score >= 4) return "#d2d531"; // Yellow
  return "#db2360"; // Red
};

const size = 40;
const strokeWidth = 3;
const radius = (size - strokeWidth) / 2;
const circumference = radius * 2 * Math.PI;

const absoluteContainer = {
  position: "absolute",
  width: "100%",
  height: "100%",
  justifyContent: "center",
  alignItems: "center",
} as any;

const container = { width: size, height: size } as any;

const ScoreRing = memo(({ score }: { score: number }) => {
  const progress = (score / 10) * circumference;

  return (
    <FrostedGlass style={container} container={{ borderRadius: 100 }}>
      <Svg width={size} height={size}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={getColor(score)}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={`${progress} ${circumference}`}
          rotation="-90"
          origin={`${size / 2}, ${size / 2}`}
        />
      </Svg>
      <View style={absoluteContainer}>
        <Text style={{ color: "white", fontWeight: "700", fontSize: 10 }}>{(score * 10).toFixed(0)}%</Text>
      </View>
    </FrostedGlass>
  );
});

export default ScoreRing;
