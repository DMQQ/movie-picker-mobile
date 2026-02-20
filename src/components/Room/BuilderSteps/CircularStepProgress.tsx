import React from "react";
import { View, StyleSheet } from "react-native";
import { useTheme } from "react-native-paper";
import Svg, { Circle, G } from "react-native-svg";
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withSequence, withTiming } from "react-native-reanimated";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useAppSelector } from "../../../redux/store";

interface CircularStepProgressProps {
  currentStep: number;
  totalSteps: number;
  size?: number;
}

const CircularStepProgress: React.FC<CircularStepProgressProps> = ({ currentStep, totalSteps, size = 36 }) => {
  const theme = useTheme();
  const isRoomCreated = useAppSelector((state) => state.room.isCreated);
  const qrCode = useAppSelector((state) => state.room.qrCode);
  const isRoomReady = isRoomCreated && qrCode;

  const strokeWidth = 3;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const gapAngle = 8;
  const totalGapDegrees = gapAngle * totalSteps;
  const availableDegrees = 360 - totalGapDegrees;
  const segmentDegrees = availableDegrees / totalSteps;
  const segmentLength = (segmentDegrees / 360) * circumference;

  const pulseScale = useSharedValue(1);

  React.useEffect(() => {
    if (isRoomReady) {
      pulseScale.value = withRepeat(withSequence(withTiming(1.15, { duration: 600 }), withTiming(1, { duration: 600 })), -1, false);
    } else {
      pulseScale.value = 1;
    }
  }, [isRoomReady]);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }));

  const renderSegments = () => {
    const segments = [];
    let currentRotation = -90;

    for (let i = 0; i < totalSteps; i++) {
      const stepNumber = i + 1;
      const isCompleted = stepNumber < currentStep;
      const strokeColor = isCompleted ? theme.colors.primary : "#333";
      const opacity = isCompleted ? 1 : 0.4;

      segments.push(
        <Circle
          key={i}
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={`${segmentLength} ${circumference}`}
          strokeDashoffset={0}
          strokeLinecap="round"
          opacity={opacity}
          rotation={currentRotation}
          origin={`${size / 2}, ${size / 2}`}
        />,
      );

      currentRotation += segmentDegrees + gapAngle;
    }

    return segments;
  };

  return (
    <View style={styles.container}>
      <Svg width={size} height={size}>
        <G>{renderSegments()}</G>
      </Svg>
      <Animated.View style={[styles.centerIcon, pulseStyle]}>
        {isRoomReady ? (
          <MaterialCommunityIcons name="check-circle" size={size * 0.45} color={theme.colors.primary} />
        ) : (
          <MaterialCommunityIcons name="movie-open" size={size * 0.4} color="#666" />
        )}
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },
  centerIcon: {
    position: "absolute",
  },
});

export default CircularStepProgress;
