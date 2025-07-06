import { Dimensions, PixelRatio } from "react-native";
import { getConstrainedDimensions } from "./getConstrainedDimensions";

const d = getConstrainedDimensions("window");
const s = getConstrainedDimensions("screen");

const pxToDp = (px: number) => {
  const screenScale = PixelRatio.get();

  return px / screenScale;
};

const responsivePxToDp = (px: number) => {
  const { width: screenWidth, height: screenHeight } = getConstrainedDimensions("window");

  const baseWidth = 390;
  const scaleFactor = Math.min(screenWidth, screenHeight) / baseWidth;

  return pxToDp(px) * scaleFactor;
};

export default {
  window: {
    width: d.width,
    height: d.height,
  },
  screen: {
    width: s.width,
    height: s.height,
  },
  isSmallDevice: d.width < 375,

  pxToDp,

  responsivePxToDp,
};
