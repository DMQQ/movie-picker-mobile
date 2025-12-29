import React from "react";
import { View, StyleSheet } from "react-native";
import { Button, IconButton, Text } from "react-native-paper";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import BuilderProgress from "./BuilderSteps/BuilderProgress";
import useTranslation from "../../service/useTranslation";
import { useAppDispatch, useAppSelector } from "../../redux/store";
import { router } from "expo-router";
import { goBack, goNext } from "../../redux/roomBuilder/roomBuilderSlice";

interface StepContainerProps {
  currentStep: number;
  totalSteps: number;
  isLastStep?: boolean;
  nextButtonText?: string;
  footerSubtitle?: string;
  children: React.ReactNode;
}

const StepContainer: React.FC<StepContainerProps> = ({
  currentStep,
  totalSteps,
  isLastStep = false,
  nextButtonText,
  children,

  footerSubtitle,
}) => {
  const dispatch = useAppDispatch();
  const t = useTranslation();
  const category = useAppSelector((state) => state.builder.category);
  const state = useAppSelector((state) => state.builder);
  const showBackButton = currentStep > 1;

  const canGoNext = () => {
    switch (currentStep) {
      case 1:
        return !!category;
      case 2:
      case 3:
      case 4:
      case 5:
        return true;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (currentStep === 5) {
      handleCreateRoom();
    } else {
      dispatch(goNext());
    }
  };

  const handleCreateRoom = () => {
    router.push({
      pathname: "/room/qr-code",
      params: {
        roomSetup: JSON.stringify({
          category: state.category,
          maxRounds: state.maxRounds,
          genre: state.genres,
          providers: state.providers,
          specialCategories: state.specialCategories,
        }),
      },
    });
  };

  const memoChildren = React.useMemo(() => children, [children]);

  return (
    <View style={styles.container}>
      <View style={[styles.scrollView, styles.scrollContent]}>
        <Animated.View
          key={`step-${currentStep}`}
          entering={FadeIn.duration(300)}
          exiting={FadeOut.duration(200)}
          style={[styles.stepContent]}
        >
          {memoChildren}
        </Animated.View>
      </View>

      <LinearGradient style={styles.buttonContainer} colors={["transparent", "rgba(0,0,0,0.5)", "rgba(0,0,0,0.9)"]}>
        {footerSubtitle && <Text style={styles.footerSubtitle}>{footerSubtitle}</Text>}

        <View style={styles.navigationRow}>
          {showBackButton && (
            <IconButton icon="arrow-left" size={24} onPress={() => dispatch(goBack())} mode="contained" style={styles.backButton} />
          )}

          <Button
            mode="contained"
            style={[styles.nextButton, !showBackButton && styles.nextButtonFullWidth]}
            contentStyle={styles.nextButtonContent}
            disabled={!canGoNext}
            onPress={handleNext}
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
