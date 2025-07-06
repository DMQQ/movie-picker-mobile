import { Dimensions, Platform } from "react-native";

export const getConstrainedDimensions = (type: "window" | "screen") => {
  const dims = Dimensions.get(type);

  if (Platform.OS === "web") {
    return {
      ...dims,
      width: Math.min(dims.width, 550),
    };
  }

  return dims;
};
