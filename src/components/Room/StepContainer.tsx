import React, { useEffect } from "react";
import { View, StyleSheet } from "react-native";
import { Button, IconButton, Text } from "react-native-paper";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  FadeIn,
  FadeOut,
  useAnimatedScrollHandler,
  useSharedValue,
  useAnimatedStyle,
  interpolate,
} from "react-native-reanimated";
import BuilderProgress from "./BuilderSteps/BuilderProgress";
import { AnimatedScrollView } from "react-native-reanimated/lib/typescript/component/ScrollView";
import useTranslation from "../../service/useTranslation";

interface StepContainerProps {
  currentStep: number;
  totalSteps: number;
  onBack: () => void;
  onNext: () => void;
  canGoNext: boolean;
  isLastStep?: boolean;
  nextButtonText?: string;
  footerSubtitle?: string;
  children: React.ReactNode;
}

const StepContainer: React.FC<StepContainerProps> = ({
  currentStep,
  totalSteps,
  onBack,
  onNext,
  canGoNext,
  isLastStep = false,
  nextButtonText,
  children,

  footerSubtitle,
}) => {
  const t = useTranslation();
  const scrollViewRef = React.useRef<AnimatedScrollView>(null);
  const showBackButton = currentStep > 1;
  const scrollY = useSharedValue(0);

  useEffect(() => {
    scrollViewRef.current?.scrollTo({ y: 0, animated: false });
  }, [currentStep]);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  const parallaxStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateY: interpolate(scrollY.value, [0, 300], [0, -50], "clamp"),
        },
      ],
    };
  });

  return (
    <View style={styles.container}>
      <Animated.ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
      >
        <Animated.View
          key={`step-${currentStep}`}
          entering={FadeIn.duration(300)}
          exiting={FadeOut.duration(200)}
          style={[styles.stepContent, parallaxStyle]}
        >
          {children}
        </Animated.View>
      </Animated.ScrollView>

      <LinearGradient style={styles.buttonContainer} colors={["transparent", "rgba(0,0,0,0.5)", "rgba(0,0,0,0.9)"]}>
        {footerSubtitle && <Text style={styles.footerSubtitle}>{footerSubtitle}</Text>}

        <View style={styles.navigationRow}>
          {showBackButton && <IconButton icon="arrow-left" size={24} onPress={onBack} mode="contained" style={styles.backButton} />}

          <Button
            mode="contained"
            style={[styles.nextButton, !showBackButton && styles.nextButtonFullWidth]}
            contentStyle={styles.nextButtonContent}
            disabled={!canGoNext}
            onPress={onNext}
          >
            {nextButtonText || (isLastStep ? t("room.builder.createRoom") : t("room.builder.next"))}
          </Button>
        </View>
        <BuilderProgress currentStep={currentStep} totalSteps={totalSteps} />
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 120,
    paddingTop: 48,
  },
  stepContent: {
    flex: 1,
  },
  buttonContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    backgroundColor: "#000",
    paddingTop: 12,
  },
  footerSubtitle: {
    fontSize: 14,
    color: "#999",
    textAlign: "center",
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  navigationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
  },
  backButton: {
    margin: 0,
  },
  nextButton: {
    flex: 1,
    borderRadius: 100,
  },
  nextButtonFullWidth: {
    flex: 1,
  },
  nextButtonContent: {
    paddingVertical: 8,
  },
});

export default StepContainer;
