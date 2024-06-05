import { SharedTransition, withTiming } from "react-native-reanimated";

export const sharedElementTransition = SharedTransition.custom((values) => {
  "worklet";

  const options = {
    duration: 200,
  };

  return {
    height: withTiming(values.targetHeight, options),
    width: withTiming(values.targetWidth, options),
    originX: withTiming(values.targetOriginX, options),
    originY: withTiming(values.targetOriginY, options),
  };
});
