import { Platform, StyleSheet, View } from "react-native";
import { Button, MD2DarkTheme, Text } from "react-native-paper";
import PrimaryButton from "./PrimaryButton";
import type { TourStepRenderProps } from "./Tour/TourContext";
import PlatformBlurView from "./PlatformBlurView";

interface Props extends TourStepRenderProps {
  title: string;
  description: string;
  total?: number;
}

const PRIMARY = MD2DarkTheme.colors.primary;

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
        borderColor: "rgba(255,255,255,0.1)",
      },
    }),
  },
  androidBg: {
    backgroundColor: "#1a1a1a",
  },
  darkOverlay: {
    backgroundColor: "rgba(8,8,8,0.88)",
  },
  inner: {
    padding: 24,
  },
  title: {
    fontFamily: "Bebas",
    fontSize: 28,
    color: "#fff",
    letterSpacing: 1,
    marginBottom: 8,
  },
  description: {
    color: "rgba(255,255,255,0.62)",
    fontSize: 14,
    lineHeight: 21,
    marginBottom: 20,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  dots: {
    flexDirection: "row",
    gap: 6,
    alignItems: "center",
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  dotActive: {
    width: 18,
    borderRadius: 3,
    backgroundColor: PRIMARY,
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  skipLabel: {
    fontSize: 13,
  },
  nextButton: {
    borderRadius: 100,
  },
  nextButtonContent: {
    paddingHorizontal: 10,
    paddingVertical: 2,
  },
  nextLabel: {
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
});
