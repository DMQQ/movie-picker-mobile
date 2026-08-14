import { Platform, StyleSheet, View, Dimensions } from "react-native";
import Text from "./Text";

import Button from "./Button";
import {
  colors,
  fontWeight,
  fontSize,
  radius,
  spacing,
  typography,
} from "../constants/design";
import PrimaryButton from "./PrimaryButton";
import type { TourStepRenderProps } from "./Tour/TourContext";
import PlatformBlurView from "./PlatformBlurView";
import useTranslation from "../service/useTranslation";

interface Props extends TourStepRenderProps {
  title: string;
  description: string;
}

const PRIMARY = colors.primary;
const dimensions = Dimensions.get("window");

export default function TutorialTooltip({
  title,
  description,
  next,
  stop,
  isLast,
  current,
  total,
}: Props) {
  const t = useTranslation();
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
                  {t("onboarding.features.skip")}
                </Button>
              )}
              <PrimaryButton onPress={next} style={styles.nextButton}>
                {isLast ? t("onboarding.features.done") : t("onboarding.features.next")}
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
    width: dimensions.width * 0.85,
    borderRadius: spacing.xl,
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
    padding: spacing.lg,
  },
  title: {
    fontFamily: "Bebas",
    fontSize: fontSize.title,
    color: colors.text,
    letterSpacing: typography.bebasLetterSpacing,
    marginBottom: spacing.sm,
  },
  description: {
    color: "rgba(255,255,255,0.62)",
    fontSize: fontSize.md,
    lineHeight: fontSize.md + 7,
    marginBottom: spacing.sm,
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
    width: spacing.xs + 2,
    height: spacing.xs + 2,
    borderRadius: radius.xs - 1,
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  dotActive: {
    width: spacing.lg + 2,
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
