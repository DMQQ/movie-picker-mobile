import React, { memo, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Dimensions, LayoutChangeEvent, StyleProp, StyleSheet, Vibration, View, ViewStyle } from "react-native";
import { Canvas, Group, Skia, Path, Mask, Rect, Image, useImage, SkPath } from "@shopify/react-native-skia";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { svgPathProperties } from "svg-path-properties";

import { Image as RNImage } from "react-native";
import { getConstrainedDimensions } from "../utils/getConstrainedDimensions";

interface ILayersProps {
  width: number;
  height: number;
  imageUrl: string;
}

const Offer = ({ width, height, imageUrl }: ILayersProps) => {
  const offerImage = useImage(imageUrl);
  return offerImage ? <Image image={offerImage} fit="contain" width={width} height={height} /> : null;
};

interface ScratchCardProps {
  imageUrl: string;
  style?: StyleProp<ViewStyle>;
}

const ScratchPattern = ({ width, height }: { width: number; height: number }) => {
  const scratchPatternImage = useImage(require("../../assets/images/low-poly-grid-haikei.png"));
  return scratchPatternImage ? <Image image={scratchPatternImage} fit="cover" width={width} height={height} /> : null;
};

interface ScratchCardProps {
  imageUrl: string;

  style?: StyleProp<ViewStyle>;
}

export const ScratchCard = ({ imageUrl, style }: ScratchCardProps) => {
  const [canvasLayoutMeta, setCanvasLayoutMeta] = useState({
    width: 0,
    height: 0,
  });

  const STROKE_WIDTH = useRef<number>(40);
  const totalAreaScratched = useRef<number>(0);
  const [isScratched, setIsScratched] = useState(false);
  const [paths, setPaths] = useState<SkPath[]>([]);

  useEffect(() => {
    RNImage.prefetch(imageUrl);
  }, [imageUrl]);

  const pan = Gesture.Pan()
    .runOnJS(true)
    .onStart((g) => {
      const path = Skia.Path.Make();
      path?.moveTo?.(g.x, g.y);
      setPaths((prev) => [...prev, path]);
    })
    .onUpdate((g) => {
      setPaths((prev) => {
        const newPaths = [...prev];
        const path = newPaths[newPaths.length - 1];
        if (path) {
          path.lineTo?.(g.x, g.y);
        }
        return newPaths;
      });
    })
    .onEnd(() => {
      const lastPath = paths[paths.length - 1];
      if (lastPath) {
        const pathProperties = new svgPathProperties(lastPath.toSVGString());
        const pathArea = pathProperties.getTotalLength() * STROKE_WIDTH.current;
        totalAreaScratched.current += pathArea;

        const { width, height } = canvasLayoutMeta;
        const areaScratched = (totalAreaScratched.current / (width * height)) * 100;

        if (areaScratched > 85) {
          setIsScratched(true);
          Vibration.vibrate(5);
        }
      }
    })
    .minDistance(1)
    .enabled(!isScratched);

  const handleCanvasLayout = useCallback((e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setCanvasLayoutMeta({ width, height });
  }, []);

  const { width, height } = useMemo(() => canvasLayoutMeta, [canvasLayoutMeta]);

  useLayoutEffect(() => {
    setIsScratched(false);
    setPaths([]);
    totalAreaScratched.current = 0;
  }, [imageUrl]);

  return (
    <GestureDetector gesture={pan}>
      <View style={[styles.container, style]}>
        <Canvas onLayout={handleCanvasLayout} style={styles.canvas}>
          <Offer imageUrl={imageUrl} width={width} height={height} />
          {!isScratched ? (
            <Mask
              clip
              mode="luminance"
              mask={
                <Group>
                  <Rect x={0} y={0} width={width} height={height} color="#fff" />
                  {paths.map((p, index) => (
                    <Path
                      key={p?.toSVGString() || index}
                      path={p}
                      strokeWidth={STROKE_WIDTH.current}
                      style="stroke"
                      strokeJoin="round"
                      strokeCap="round"
                      antiAlias
                      color="black"
                    />
                  ))}
                </Group>
              }
            >
              <ScratchPattern width={width} height={height} />
            </Mask>
          ) : (
            <Offer imageUrl={imageUrl} width={width} height={height} />
          )}
        </Canvas>
      </View>
    </GestureDetector>
  );
};

const styles = StyleSheet.create({
  container: {
    width: getConstrainedDimensions("screen").width - 30,
    height: 350,
    backgroundColor: "#fff",
    borderRadius: 15,
    overflow: "hidden",
  },
  canvas: {
    width: "100%",
    height: "100%",
    borderRadius: 10,
  },
});

export default memo(ScratchCard, (prev, next) => prev.imageUrl === next.imageUrl);
