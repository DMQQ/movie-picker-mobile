import React, { useCallback } from "react";
import { View, StyleSheet } from "react-native";
import { Button, IconButton, MD2DarkTheme, Text, useTheme } from "react-native-paper";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { FadeIn, FadeOut, useAnimatedStyle, useSharedValue, withRepeat, withSequence, withTiming } from "react-native-reanimated";
import BuilderProgress from "./BuilderSteps/BuilderProgress";
import useTranslation from "../../service/useTranslation";
import { useAppDispatch, useAppSelector } from "../../redux/store";
import { router } from "expo-router";
import { goBack, goNext } from "../../redux/roomBuilder/roomBuilderSlice";
import { MaterialCommunityIcons } from "@expo/vector-icons";

interface DetailsTabProps {
  currentStep: number;
  totalSteps: number;
}

const DetailsTab = ({ currentStep, totalSteps }: DetailsTabProps) => {
  const isRoomCreated = useAppSelector((state) => state.room.isCreated);
  const qrCode = useAppSelector((state) => state.room.qrCode);

  return (
    <View
      style={[
        styles.progressRow,
        {
          justifyContent: isRoomCreated && qrCode ? "space-between" : "center",
        },
      ]}
    >
      {isRoomCreated && qrCode && <RoomActiveIndicator />}
      <BuilderProgress currentStep={currentStep} totalSteps={totalSteps} />
    </View>
  );
};

interface StepContainerProps {
  currentStep: number;
  totalSteps: number;
  isLastStep?: boolean;
  nextButtonText?: string;
  footerSubtitle?: string;
  children: React.ReactNode;
}

const RoomActiveIndicator: React.FC = () => {
  const theme = useTheme();
  const t = useTranslation();
  const opacity = useSharedValue(1);

  React.useEffect(() => {
    opacity.value = withRepeat(withSequence(withTiming(0.5, { duration: 800 }), withTiming(1, { duration: 800 })), -1, false);
  }, []);

  const pulseStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View entering={FadeIn} style={styles.roomActiveContainer}>
      <Animated.View style={[pulseStyle, styles.pulseIconContainer]}>
        <View style={[styles.iconCircle, { backgroundColor: theme.colors.primary + "25" }]}>
          <MaterialCommunityIcons name="account-multiple" size={10} color={theme.colors.primary} />
        </View>
      </Animated.View>
      <Text style={styles.roomActiveText}>{t("room.builder.roomActive")}</Text>
    </Animated.View>
  );
};

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

  const handleQuickStart = useCallback(() => {
    router.push({
      pathname: "/room/qr-code",
      params: { quickStart: "true" },
    });
  }, []);

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
            disabled={!canGoNext()}
            onPress={handleNext}
          >
            {nextButtonText || (isLastStep ? t("room.builder.createRoom") : t("room.builder.next"))}
          </Button>
          {currentStep === 1 && <IconButton onPress={handleQuickStart} icon={"dice-5"} />}
        </View>
        <DetailsTab currentStep={currentStep} totalSteps={totalSteps} />
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
  progressRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 8,
  },
  roomActiveContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  pulseIconContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconCircle: {
    width: 20,
    height: 20,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  roomActiveText: {
    fontSize: 11,
    color: MD2DarkTheme.colors.primary,
    opacity: 0.8,
  },
});

export default StepContainer;
