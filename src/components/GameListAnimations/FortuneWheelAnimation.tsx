import React, { useEffect, useRef } from "react";
import { View, StyleSheet, Animated, Easing } from "react-native";
import Svg, { Path, G, Circle } from "react-native-svg";

// Wheel segment colors
const COLORS = [
  "#FF6B6B", // Red
  "#4ECDC4", // Teal
  "#FFD166", // Yellow
  "#6C63FF", // Purple
  "#F72585", // Pink
  "#06D6A0", // Green
  "#FF9F1C", // Orange
  "#118AB2", // Blue
  "#8A2BE2", // Violet
  "#FF5400", // Bright Orange
  "#14213D", // Navy
  "#7B2CBF", // Deep Purple
];

const FortuneWheelAnimation = () => {
  // Use standard Animated API
  const rotationAnim = useRef(new Animated.Value(0)).current;

  // Start animation loop when component mounts
  useEffect(() => {
    const startRotation = () => {
      Animated.timing(rotationAnim, {
        toValue: 360,
        duration: 3000,
        easing: Easing.linear,
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (finished) {
          rotationAnim.setValue(0); // Reset without animation
          startRotation(); // Restart animation
        }
      });
    };

    startRotation();

    return () => {
      rotationAnim.stopAnimation();
    };
  }, []);

  // Calculate spin rotation
  const spin = rotationAnim.interpolate({
    inputRange: [0, 360],
    outputRange: ["0deg", "360deg"],
  });

  // Create SVG pie segments
  const renderWheelSegments = () => {
    const segments = [];
    const numSegments = COLORS.length;
    const anglePerSegment = 360 / numSegments;
    const radius = 90; // slightly smaller than container for border space
    const centerX = 100;
    const centerY = 100;

    for (let i = 0; i < numSegments; i++) {
      const startAngle = i * anglePerSegment;
      const endAngle = (i + 1) * anglePerSegment;

      // Convert angles to radians
      const startRad = ((startAngle - 90) * Math.PI) / 180; // -90 to start at top
      const endRad = ((endAngle - 90) * Math.PI) / 180;

      // Calculate points
      const x1 = centerX + radius * Math.cos(startRad);
      const y1 = centerY + radius * Math.sin(startRad);
      const x2 = centerX + radius * Math.cos(endRad);
      const y2 = centerY + radius * Math.sin(endRad);

      // Create SVG arc path
      const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";

      const pathData = [`M ${centerX},${centerY}`, `L ${x1},${y1}`, `A ${radius},${radius} 0 ${largeArcFlag} 1 ${x2},${y2}`, "Z"].join(" ");

      segments.push(<Path key={i} d={pathData} fill={COLORS[i]} stroke="#333" strokeWidth={0.5} />);
    }

    return segments;
  };

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.wheel, { transform: [{ rotate: spin }] }]}>
        <Svg width={200} height={200} viewBox="0 0 200 200">
          <G>
            {renderWheelSegments()}
            <Circle cx={100} cy={100} r={15} fill="#E0E0E0" stroke="#AAAAAA" />
          </G>
        </Svg>
      </Animated.View>

      {/* Fixed marker */}
      <View style={styles.markerContainer}>
        <View style={styles.marker} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#1A1A1A",
  },
  wheel: {
    width: 200,
    height: 200,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 100,
    borderWidth: 4,
    borderColor: "#444",
    overflow: "hidden",
  },
  markerContainer: {
    position: "absolute",
    top: "50%",
    marginTop: -100,
    zIndex: 20,
    transform: [{ rotate: "180deg" }],
  },
  marker: {
    width: 0,
    height: 0,
    backgroundColor: "transparent",
    borderStyle: "solid",
    borderLeftWidth: 10,
    borderRightWidth: 10,
    borderBottomWidth: 20,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderBottomColor: "#FFFFFF",
  },
});

export default FortuneWheelAnimation;
