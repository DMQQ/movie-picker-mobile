import { Platform, StyleSheet, View } from "react-native";
import Text from "./Text";

import Button from "./Button";
import { colors, fontWeight, fontSize, radius, spacing } from "../constants/design";
import PrimaryButton from "./PrimaryButton";
import type { TourStepRenderProps } from "./Tour/TourContext";
import PlatformBlurView from "./PlatformBlurView";

interface Props extends TourStepRenderProps {
  title: string;
  description: string;
  total?: number;
}

const PRIMARY = colors.primary;

export default function TutorialTooltip({
  title,
  description,
  next,
  stop,
  isLast,
  current,
  total = 5,
}: Props) {
  return (
    <PlatformBlurView
      style={[styles.container, Platform.OS === "android" && styles.androidBg]}
      intensity={95}
    >
      <View style={styles.darkOverlay}>
        <View style={styles.inner}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.description}>{description}</Text>

          <View style={styles.footer}>
            <View style={styles.dots}>
              {Array.from({ length: total }).map((_, i) => (
                <View
                  key={i}
                  style={[styles.dot, i === current && styles.dotActive]}
                />
              ))}
            </View>

            <View style={styles.actions}>
              {!isLast && (
                <Button
                  onPress={stop}
                  textColor="rgba(255,255,255,0.35)"
                  compact
                  labelStyle={styles.skipLabel}
                >
                  Skip
                </Button>
              )}
              <PrimaryButton onPress={next} style={styles.nextButton}>
                {isLast ? "Done" : "Next"}
              </PrimaryButton>
            </View>
          </View>
        </View>
      </View>
    </PlatformBlurView>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 300,
    borderRadius: 32,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: `${PRIMARY}33`,
    ...Platform.select({
      android: {
        borderColor: colors.border,
      },
    }),
  },
  androidBg: {
    backgroundColor: colors.input,
  },
  darkOverlay: {
    backgroundColor: "rgba(8,8,8,0.88)",
  },
  inner: {
    padding: spacing.xxl,
  },
  title: {
    fontFamily: "Bebas",
    fontSize: 28,
    color: colors.text,
    letterSpacing: 1,
    marginBottom: spacing.sm,
  },
  description: {
    color: "rgba(255,255,255,0.62)",
    fontSize: fontSize.md,
    lineHeight: 21,
    marginBottom: spacing.xl,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  dots: {
    flexDirection: "row",
    gap: spacing.sm - 2,
    alignItems: "center",
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: radius.xs - 1,
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  dotActive: {
    width: 18,
    borderRadius: radius.xs - 1,
    backgroundColor: PRIMARY,
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  skipLabel: {
    fontSize: fontSize.md - 1,
  },
  nextButton: {
    borderRadius: radius.pill,
  },
  nextButtonContent: {
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs - 2,
  },
  nextLabel: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    letterSpacing: 0.3,
  },
});
