import { useEffect, useRef } from "react";
import { Accelerometer } from "expo-sensors";

const SHAKE_THRESHOLD = 1.0;
const COOLDOWN_MS = 1500;

export function useShakeDetector(onShake: () => void, enabled = true) {
  const lastShakeTime = useRef(0);
  const lastReading = useRef({ x: 0, y: 0, z: 0 });

  useEffect(() => {
    if (!enabled) return;

    Accelerometer.setUpdateInterval(150);
    const subscription = Accelerometer.addListener(({ x, y, z }) => {
      const { x: lx, y: ly, z: lz } = lastReading.current;
      const magnitude = Math.sqrt((x - lx) ** 2 + (y - ly) ** 2 + (z - lz) ** 2);
      lastReading.current = { x, y, z };

      if (magnitude > SHAKE_THRESHOLD) {
        const now = Date.now();
        if (now - lastShakeTime.current > COOLDOWN_MS) {
          lastShakeTime.current = now;
          onShake();
        }
      }
    });

    return () => subscription.remove();
  }, [enabled, onShake]);
}
