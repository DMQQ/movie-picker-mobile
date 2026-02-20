import React, { useCallback } from "react";
import { View, StyleSheet } from "react-native";
import { Button, IconButton, Text } from "react-native-paper";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import useTranslation from "../../service/useTranslation";
import { useAppDispatch, useAppSelector } from "../../redux/store";
import { router } from "expo-router";
import { goNext, goToStep, setQuickStartMode } from "../../redux/roomBuilder/roomBuilderSlice";
import { useBuilderPreferences } from "../../hooks/useBuilderPreferences";

interface StepContainerProps {
  currentStep: number;
  isLastStep?: boolean;
  nextButtonText?: string;
  footerSubtitle?: string;
  children: React.ReactNode;
}

const StepContainer: React.FC<StepContainerProps> = ({ currentStep, isLastStep = false, nextButtonText, children, footerSubtitle }) => {
  const dispatch = useAppDispatch();
  const t = useTranslation();
  const category = useAppSelector((state) => state.builder.category);
  const state = useAppSelector((state) => state.builder);
  const { preferences: savedProviders, isLoading: providersLoading } = useBuilderPreferences();
  const hasProviders = savedProviders?.providers && savedProviders.providers.length > 0;

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
    if (currentStep === 5 || (currentStep === 3 && state.quickStartMode)) {
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

  const handleQuickStart = useCallback(() => {
    if (hasProviders) {
      router.push({
        pathname: "/room/qr-code",
        params: {
          roomSetup: JSON.stringify({
            category: state.category,
            maxRounds: 3,
            genre: [],
            providers: savedProviders?.providers || [],
            specialCategories: [],
          }),
        },
      });
    } else {
      dispatch(setQuickStartMode(true));
      dispatch(goToStep(3));
    }
  }, [hasProviders, state.category, savedProviders, dispatch]);

  const handleFilters = useCallback(() => {
    dispatch(goNext());
  }, [dispatch]);

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

        {currentStep === 1 ? (
          <View style={styles.step1NavigationRow}>
            <Button
              mode="contained"
              style={styles.quickStartButton}
              contentStyle={styles.quickStartButtonContent}
              disabled={!canGoNext() || providersLoading}
              onPress={handleQuickStart}
            >
              {t("room.builder.quickStart")}
            </Button>
            <IconButton
              icon="tune-variant"
              size={24}
              onPress={handleFilters}
              mode="contained"
              style={styles.filtersIconButton}
              disabled={!canGoNext()}
            />
          </View>
        ) : (
          <Button
            mode="contained"
            style={styles.nextButton}
            contentStyle={styles.nextButtonContent}
            disabled={!canGoNext()}
            onPress={handleNext}
          >
            {nextButtonText ||
              (isLastStep || (currentStep === 3 && state.quickStartMode) ? t("room.builder.createRoom") : t("room.builder.next"))}
          </Button>
        )}
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
    paddingBottom: 90,
    paddingTop: 60,
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
    paddingTop: 8,
  },
  footerSubtitle: {
    fontSize: 14,
    color: "#999",
    textAlign: "center",
    marginBottom: 8,
  },
  nextButton: {
    borderRadius: 100,
  },
  nextButtonContent: {
    paddingVertical: 8,
  },
  step1NavigationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  filtersIconButton: {},
  quickStartButton: {
    flex: 1,
    borderRadius: 100,
  },
  quickStartButtonContent: {
    paddingVertical: 8,
  },
});

export default StepContainer;
