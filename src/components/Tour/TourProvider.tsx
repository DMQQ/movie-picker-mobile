import { BlurMask, Canvas, Path, Skia } from "@shopify/react-native-skia";
import { MD2DarkTheme } from "react-native-paper";
import {
  forwardRef,
  ReactNode,
  useCallback,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import { Dimensions, LayoutRectangle, Modal, Platform, Pressable, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { TourContext, TourRef, TourStep, TourStableContext } from "./TourContext";

const { width: W, height: H } = Dimensions.get("screen");
const SPOTLIGHT_PADDING = 10;
const OVERLAY_OPACITY = 0.92;
const ACCENT = MD2DarkTheme.colors.primary;
const FADE_IN_MS = 220;
const FADE_OUT_MS = 180;

interface Props {
  steps: TourStep[];
  children: ReactNode;
  onStop?: () => void;
}

const EMPTY_SPOT: LayoutRectangle = { x: 0, y: 0, width: 0, height: 0 };

export const TourProvider = forwardRef<TourRef, Props>(function TourProvider(
  { steps, children, onStop },
  ref,
) {
  const insets = useSafeAreaInsets();
  const [current, setCurrent] = useState<number | undefined>(undefined);
  const [spot, setSpot] = useState<LayoutRectangle>(EMPTY_SPOT);
  const [spotRadius, setSpotRadius] = useState(16);
  const measurers = useRef<Record<number, () => Promise<LayoutRectangle>>>({});
  const fade = useSharedValue(0);
  // Tracks the latest requested step — if it changes mid-flight, earlier async calls abort
  const pendingStep = useRef<number | undefined>(undefined);

  const measureStep = useCallback(async (index: number): Promise<LayoutRectangle> => {
    const fn = measurers.current[index];
    if (!fn) return EMPTY_SPOT;
    return fn();
  }, []);

  const showStep = useCallback(
    async (index: number) => {
      pendingStep.current = index;

      const step = steps[index];
      if (!step) return;

      await step.before?.();

      // A newer tap arrived while we were waiting — bail out
      if (pendingStep.current !== index) return;

      const rect = await measureStep(index);
      if (pendingStep.current !== index) return;

      const yOffset = Platform.OS === "android" ? insets.top : 0;
      setSpot({ ...rect, y: rect.y + yOffset });
      setCurrent(index);
      setSpotRadius(step.spotRadius ?? 16);

      // Two frames so React + Skia commit the new path before we fade in
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          if (pendingStep.current !== index) return;
          fade.value = withTiming(1, { duration: FADE_IN_MS });
        });
      });
    },
    [steps, measureStep, fade],
  );

  const stop = useCallback(() => {
    pendingStep.current = undefined;
    fade.value = withTiming(0, { duration: FADE_OUT_MS }, finished => {
      if (finished) {
        runOnJS(setCurrent)(undefined);
        runOnJS(setSpot)(EMPTY_SPOT);
      }
    });
    onStop?.();
  }, [fade, onStop]);

  const next = useCallback(() => {
    if (current === undefined) return;
    if (current >= steps.length - 1) {
      stop();
      return;
    }
    const nextIndex = current + 1;
    fade.value = withTiming(0, { duration: FADE_OUT_MS }, finished => {
      if (finished) runOnJS(showStep)(nextIndex);
    });
  }, [current, steps.length, fade, stop, showStep]);

  const registerMeasurer = useCallback(
    (index: number, fn: () => Promise<LayoutRectangle>) => {
      measurers.current[index] = fn;
    },
    [],
  );

  useImperativeHandle(ref, () => ({
    start: () => showStep(0),
    stop,
  }));

  const overlayStyle = useAnimatedStyle(() => ({ opacity: fade.value }));

  const skPath = useMemo(() => {
    const builder = Skia.PathBuilder.Make();
    builder.addRect(Skia.XYWHRect(0, 0, W, H));
    if (spot.width > 0 && spot.height > 0) {
      builder.addRRect(
        Skia.RRectXY(
          Skia.XYWHRect(
            spot.x - SPOTLIGHT_PADDING,
            spot.y - SPOTLIGHT_PADDING,
            spot.width + SPOTLIGHT_PADDING * 2,
            spot.height + SPOTLIGHT_PADDING * 2,
          ),
          spotRadius,
          spotRadius,
        ),
      );
    }
    return builder.detach();
  }, [spot, spotRadius]);

  const skBorderPath = useMemo(() => {
    if (spot.width === 0 && spot.height === 0) return null;
    return Skia.Path.RRect(
      Skia.RRectXY(
        Skia.XYWHRect(
          spot.x - SPOTLIGHT_PADDING,
          spot.y - SPOTLIGHT_PADDING,
          spot.width + SPOTLIGHT_PADDING * 2,
          spot.height + SPOTLIGHT_PADDING * 2,
        ),
        spotRadius,
        spotRadius,
      ),
    );
  }, [spot, spotRadius]);

  const tooltipTop = useMemo(() => {
    const belowY = spot.y + spot.height + SPOTLIGHT_PADDING + 20;
    return belowY + 200 < H ? belowY : spot.y - SPOTLIGHT_PADDING - 220;
  }, [spot]);

  const ctx = useMemo(
    () => ({ current, spot, steps, next, stop }),
    [current, spot, steps, next, stop],
  );

  const stableCtx = useMemo(() => ({ registerMeasurer }), [registerMeasurer]);

  return (
    <TourStableContext.Provider value={stableCtx}>
    <TourContext.Provider value={ctx}>
      {children}

      <Modal
        visible={current !== undefined}
        transparent
        animationType="none"
        statusBarTranslucent
        presentationStyle="overFullScreen"
      >
        <Animated.View style={[StyleSheet.absoluteFill, overlayStyle]} pointerEvents="box-none">
          <Canvas style={StyleSheet.absoluteFill} pointerEvents="none">
            <Path
              path={skPath}
              color={`rgba(0,0,0,${OVERLAY_OPACITY})`}
              style="fill"
              fillType="evenOdd"
            />
            {skBorderPath && (
              <Path
                path={skBorderPath}
                color={ACCENT}
                style="stroke"
                strokeWidth={2}
              >
                <BlurMask blur={10} style="solid" />
              </Path>
            )}
          </Canvas>

          <Pressable style={StyleSheet.absoluteFill} onPress={next} />

          {current !== undefined && (
            <View style={[styles.tooltip, { top: tooltipTop }]} pointerEvents="box-none">
              {steps[current]?.render({
                current,
                isFirst: current === 0,
                isLast: current === steps.length - 1,
                next,
                stop,
              })}
            </View>
          )}
        </Animated.View>
      </Modal>
    </TourContext.Provider>
    </TourStableContext.Provider>
  );
});

const styles = StyleSheet.create({
  tooltip: {
    position: "absolute",
    left: 16,
    right: 16,
    alignItems: "center",
  },
});
