import React from "react";
import { View, StyleSheet } from "react-native";
import { useTheme } from "react-native-paper";

interface BuilderProgressProps {
  currentStep: number;
  totalSteps: number;
}

const BuilderProgress: React.FC<BuilderProgressProps> = ({ currentStep, totalSteps }) => {
  const theme = useTheme();

  return (
    <View style={styles.container}>
      {Array.from({ length: totalSteps }, (_, index) => {
        const stepNumber = index + 1;
        const isCompleted = stepNumber < currentStep;
        const isCurrent = stepNumber === currentStep;

        return (
          <View
            key={stepNumber}
            style={[
              styles.dot,
              isCompleted && { ...styles.completedDot, backgroundColor: theme.colors.primary },
              isCurrent && { ...styles.currentDot, backgroundColor: theme.colors.primary },
              !isCompleted && !isCurrent && styles.futureDot,
            ]}
          />
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 5,
  },
  completedDot: {
    width: 8,
    height: 8,
  },
  currentDot: {
    width: 12,
    height: 12,
    borderRadius: 7,
  },
  futureDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#444",
  },
});

export default BuilderProgress;
