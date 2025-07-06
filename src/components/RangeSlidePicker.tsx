import React from "react";
import { View } from "react-native";
import Animated, { useSharedValue, useAnimatedStyle, withSpring, runOnJS } from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";

interface StepSliderProps {
  steps?: number;
  width: number;
  barHeight?: number;
  barStyle?: any;
  handleSize?: number;
  handleStyle?: any;
  onChange?(value: number): void;
  value: number;
}

function StepSlider({
  steps = 5,
  width,
  barHeight = 10,
  barStyle = {},
  handleSize = 20,
  handleStyle = {},
  onChange = () => {},
  value = 0,
}: StepSliderProps) {
  const position = useSharedValue(0);
  const startPosition = useSharedValue(0);
  const maxX = width - handleSize;

  const snapToStep = (x: number) => {
    "worklet";
    const stepWidth = maxX / (steps - 1);
    const clampedX = Math.max(0, Math.min(x, maxX));
    const snappedStep = Math.round(clampedX / stepWidth);
    return snappedStep * stepWidth;
  };

  const getValue = (pos: number) => {
    "worklet";
    const stepWidth = maxX / (steps - 1);
    return Math.round(pos / stepWidth);
  };

  // Update position when value changes from outside
  React.useEffect(() => {
    const stepWidth = maxX / (steps - 1);
    position.value = withSpring(value * stepWidth, {
      damping: 15,
      stiffness: 150,
    });
  }, [value, steps, maxX]);

  const panGesture = Gesture.Pan()
    .onStart(() => {
      startPosition.value = position.value;
    })
    .onUpdate((e) => {
      const newPosition = startPosition.value + e.translationX;
      position.value = Math.max(0, Math.min(newPosition, maxX));
    })
    .onEnd(() => {
      const snappedPosition = snapToStep(position.value);
      position.value = withSpring(snappedPosition, {
        damping: 15,
        stiffness: 150,
      });

      const currentStepValue = getValue(snappedPosition);
      runOnJS(onChange)(currentStepValue);
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: position.value }],
  }));

  return (
    <View style={{ width }}>
      <View
        style={[
          {
            backgroundColor: "#E5E7EB",
            height: barHeight,
            borderRadius: barHeight / 2,
            width: "100%",
          },
          barStyle,
        ]}
      >
        <GestureDetector gesture={panGesture}>
          <Animated.View
            style={[
              {
                width: handleSize,
                height: handleSize,
                borderRadius: handleSize / 2,
                backgroundColor: "white",
                position: "absolute",
                top: -((handleSize - barHeight) / 2),
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.25,
                shadowRadius: 3.84,
                elevation: 5,
              },
              handleStyle,
              animatedStyle,
            ]}
          />
        </GestureDetector>
      </View>
    </View>
  );
}

export default StepSlider;
