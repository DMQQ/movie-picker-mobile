import { Dimensions, PixelRatio } from "react-native";

const d = Dimensions.get("window");
const s = Dimensions.get("screen");

const pxToDp = (px: number) => {
  const screenScale = PixelRatio.get();

  return px / screenScale;
};

const responsivePxToDp = (px: number) => {
  const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

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
