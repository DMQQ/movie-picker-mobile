import { useEffect, useRef, useState } from "react";
import { Accelerometer } from "expo-sensors";

const SHAKE_THRESHOLD = 1.2;
const SHAKE_CHARGE_DURATION_MS = 750;
const SHAKE_DECAY_DURATION_MS = 2000;
const SMOOTH_FACTOR = 0.18;
const POST_TRIGGER_COOLDOWN_MS = 500;

interface ShakeDetectorOptions {
  onShake: () => void;
  onShakeProgress?: (progress: number) => void;
  enabled?: boolean;
}

export function useShakeDetector(options: ShakeDetectorOptions) {
  const { enabled = true } = options;
  const onShakeRef = useRef(options.onShake);
  const onProgressRef = useRef(options.onShakeProgress);
  onShakeRef.current = options.onShake;
  onProgressRef.current = options.onShakeProgress;

  const [isShaking, setIsShaking] = useState(false);

  const chargeRef = useRef(0);
  const smoothedRef = useRef(0);
  const triggeredRef = useRef(false);
  const shakingRef = useRef(false);
  const triggerTimeRef = useRef(0);
  const lastReadingRef = useRef({ x: 0, y: 0, z: 0 });
  const lastUpdateRef = useRef(Date.now());

  useEffect(() => {
    if (!enabled) {
      setIsShaking(false);
      chargeRef.current = 0;
      smoothedRef.current = 0;
      shakingRef.current = false;
      onProgressRef.current?.(0);
      return;
    }

    triggeredRef.current = true;
    triggerTimeRef.current = Date.now();

    Accelerometer.setUpdateInterval(50);

    const subscription = Accelerometer.addListener(({ x, y, z }) => {
      const now = Date.now();
      const dt = Math.min(now - lastUpdateRef.current, 200);
      lastUpdateRef.current = now;

      const { x: lx, y: ly, z: lz } = lastReadingRef.current;
      const magnitude = Math.sqrt((x - lx) ** 2 + (y - ly) ** 2 + (z - lz) ** 2);
      lastReadingRef.current = { x, y, z };

      if (triggeredRef.current) {
        if (now - triggerTimeRef.current > POST_TRIGGER_COOLDOWN_MS) {
          triggeredRef.current = false;
        } else {
          return;
        }
      }

      if (magnitude > SHAKE_THRESHOLD) {
        const intensity = Math.min((magnitude - SHAKE_THRESHOLD) / 0.7, 1);
        const rate = (1 + intensity * 2) / SHAKE_CHARGE_DURATION_MS;
        chargeRef.current += dt * rate;
        if (chargeRef.current > 1) chargeRef.current = 1;
      } else {
        chargeRef.current -= dt / SHAKE_DECAY_DURATION_MS;
        if (chargeRef.current < 0) chargeRef.current = 0;
      }

      smoothedRef.current = smoothedRef.current + (chargeRef.current - smoothedRef.current) * SMOOTH_FACTOR;

      const wasShaking = shakingRef.current;
      shakingRef.current = smoothedRef.current > 0.08;
      if (wasShaking !== shakingRef.current) {
        setIsShaking(shakingRef.current);
      }

      onProgressRef.current?.(smoothedRef.current);

      if (chargeRef.current >= 1) {
        chargeRef.current = 0;
        smoothedRef.current = 0;
        shakingRef.current = false;
        setIsShaking(false);
        triggeredRef.current = true;
        triggerTimeRef.current = now;
        onShakeRef.current();
      }
    });

    return () => subscription.remove();
  }, [enabled]);

  return { isShaking };
}
