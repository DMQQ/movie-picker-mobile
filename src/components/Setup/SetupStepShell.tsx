import { Platform, StyleSheet, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import Text from "../Text";
import { colors, fontSize, spacing } from "../../constants/design";

interface Props {
  stepKey: string | number;
  footerSubtitle?: string;
  footerActions: React.ReactNode;
  children: React.ReactNode;
}

export default function SetupStepShell({ stepKey, footerSubtitle, footerActions, children }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.scrollContent}>
        <Animated.View key={`step-${stepKey}`} entering={FadeIn.duration(300)} exiting={FadeOut.duration(200)} style={styles.stepContent}>
          {children}
        </Animated.View>
      </View>

      <LinearGradient style={styles.buttonContainer} colors={["transparent", "rgba(0,0,0,0.5)", "rgba(0,0,0,0.9)"]}>
        {!!footerSubtitle && <Text style={styles.footerSubtitle}>{footerSubtitle}</Text>}
        {footerActions}
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.appBackground,
  },
  scrollContent: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingBottom: 90,
    paddingTop: spacing.xxl + 24,
  },
  stepContent: {
    flex: 1,
  },
  buttonContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    ...Platform.select({
      android: { paddingBottom: spacing.screen },
    }),
  },
  footerSubtitle: {
    fontSize: fontSize.md,
    color: "#999",
    textAlign: "center",
    marginBottom: spacing.sm,
  },
});
