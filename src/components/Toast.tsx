import { useCallback, useEffect, useRef } from "react";
import { Pressable, StyleSheet } from "react-native";
import Animated, {
  FadeInUp,
  FadeOutUp,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Portal from "./Portal";
import Text from "./Text";
import {
  colors,
  fontSize,
  fontWeight,
  radius,
  spacing,
} from "../constants/design";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useAppDispatch, useAppSelector } from "../redux/store";
import {
  addToast,
  removeToast,
  type ToastType,
} from "../redux/toast/toastSlice";

const ICON: Record<ToastType, keyof typeof MaterialCommunityIcons.glyphMap> = {
  info: "information-outline",
  success: "check-circle-outline",
  error: "alert-circle-outline",
};

const TYPE_COLOR: Record<ToastType, string> = {
  info: colors.primary,
  success: "#4CAF50",
  error: colors.error,
};

const DEFAULT_DURATION = 3_000;

const actionCallbacks = new Map<string, () => void>();
const dismissCallbacks = new Map<string, () => void>();

export function ToastContainer() {
  const toasts = useAppSelector((s) => s.toast);
  const dispatch = useAppDispatch();
  const insets = useSafeAreaInsets();
  const timers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  useEffect(() => {
    const currentIds = new Set(toasts.map((t) => t.id));

    // Start timers for new toasts
    for (const t of toasts) {
      if (!timers.current.has(t.id) && t.duration > 0) {
        const timer = setTimeout(() => {
          actionCallbacks.delete(t.id);
          dismissCallbacks.delete(t.id);
          dispatch(removeToast(t.id));
          timers.current.delete(t.id);
        }, t.duration);
        timers.current.set(t.id, timer);
      }
    }

    // Clear timers for removed toasts
    for (const [id, timer] of timers.current) {
      if (!currentIds.has(id)) {
        clearTimeout(timer);
        timers.current.delete(id);
      }
    }
  }, [toasts, dispatch]);

  useEffect(() => {
    return () => {
      timers.current.forEach((t) => clearTimeout(t));
    };
  }, []);

  if (toasts.length === 0) return null;

  return (
    <Portal>
      <Animated.View
        pointerEvents="box-none"
        style={[
          StyleSheet.absoluteFill,
          {
            justifyContent: "flex-start",
            paddingTop: insets.top + spacing.sm,
          },
        ]}
      >
        {toasts.map((t) => (
          <ToastItem
            key={t.id}
            config={t}
            onDismiss={() => {
              const cb = dismissCallbacks.get(t.id);
              actionCallbacks.delete(t.id);
              dismissCallbacks.delete(t.id);
              dispatch(removeToast(t.id));
              if (cb) cb();
            }}
            onPress={() => {
              const cb = actionCallbacks.get(t.id);
              if (cb) {
                actionCallbacks.delete(t.id);
                dismissCallbacks.delete(t.id);
                dispatch(removeToast(t.id));
                cb();
              }
            }}
          />
        ))}
      </Animated.View>
    </Portal>
  );
}

function ToastItem({
  config,
  onDismiss,
  onPress,
}: {
  config: { id: string; message: string; type: ToastType; duration: number };
  onDismiss: () => void;
  onPress: () => void;
}) {
  const progress = useSharedValue(1);
  const color = TYPE_COLOR[config.type];

  useEffect(() => {
    if (config.duration > 0) {
      progress.value = 1;
      progress.value = withTiming(0, { duration: config.duration });
    }
  }, [config.duration, progress]);

  const barStyle = useAnimatedStyle(() => ({
    width: `${progress.value * 100}%`,
  }));

  return (
    <Animated.View
      entering={FadeInUp.duration(250)}
      exiting={FadeOutUp.duration(150)}
      style={styles.toast}
    >
      <Pressable
        style={({ pressed }) => [
          styles.toastInner,
          pressed && { opacity: 0.7 },
        ]}
        onPress={onPress}
      >
        <MaterialCommunityIcons
          name={ICON[config.type]}
          size={18}
          color={color}
        />
        <Text style={styles.message} numberOfLines={2}>
          {config.message}
        </Text>
      </Pressable>
      <Pressable style={styles.dismissBtn} onPress={onDismiss}>
        <MaterialCommunityIcons
          name="close"
          size={14}
          color="rgba(255,255,255,0.35)"
        />
      </Pressable>
      {config.duration > 0 && (
        <Animated.View style={[styles.progressBar, { backgroundColor: color }, barStyle]} />
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  toast: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    marginHorizontal: spacing.lg,
    marginTop: spacing.xs,
    overflow: "hidden",
    flexDirection: "row",
    alignItems: "center",
  },
  toastInner: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingVertical: spacing.md,
    paddingLeft: spacing.lg,
  },
  message: {
    flex: 1,
    color: colors.text,
    fontSize: fontSize.md - 1,
    fontWeight: fontWeight.medium,
  },
  dismissBtn: {
    padding: spacing.sm,
  },
  progressBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 2,
    borderRadius: 1,
  },
});

export function useToast() {
  const dispatch = useAppDispatch();

  const show = useCallback(
    (message: string, opts?: { type?: ToastType; duration?: number; onPress?: () => void; onDismiss?: () => void }) => {
      if (!message) {
        console.warn("[Toast] show() called with empty message, ignoring");
        return "";
      }
      const id = String(Math.random());
      if (opts?.onPress) actionCallbacks.set(id, opts.onPress);
      if (opts?.onDismiss) dismissCallbacks.set(id, opts.onDismiss);
      dispatch(
        addToast({
          id,
          message,
          type: opts?.type ?? "info",
          duration: opts?.duration ?? DEFAULT_DURATION,
        }),
      );
      return id;
    },
    [dispatch],
  );

  const dismiss = useCallback(
    (id: string) => {
      dispatch(removeToast(id));
    },
    [dispatch],
  );

  const replace = useCallback(
    (id: string | null, message: string, opts?: { type?: ToastType; duration?: number; onPress?: () => void; onDismiss?: () => void }) => {
      if (id) dismiss(id);
      return show(message, opts);
    },
    [show, dismiss],
  );

  return { show, dismiss, replace };
}

