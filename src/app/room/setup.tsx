import { useCallback, useEffect, useMemo } from "react";
import { View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import PageHeading from "../../components/PageHeading";
import StepContainer from "../../components/Room/StepContainer";
import Step1GameType from "../../components/Room/BuilderSteps/Step1GameType";
import Step2Genres from "../../components/Room/BuilderSteps/Step2Genres";
import Step3Providers from "../../components/Room/BuilderSteps/Step3Providers";
import Step4SpecialCategories from "../../components/Room/BuilderSteps/Step4SpecialCategories";
import CircularStepProgress from "../../components/Room/BuilderSteps/CircularStepProgress";
import useTranslation from "../../service/useTranslation";
import { useAppDispatch, useAppSelector } from "../../redux/store";
import {
  goBack,
  goToStep,
  reset,
} from "../../redux/roomBuilder/roomBuilderSlice";

export default function RoomSetup() {
  const t = useTranslation();
  const dispatch = useAppDispatch();
  const { step } = useLocalSearchParams<{ step?: string }>();

  useEffect(() => {
    if (step) {
      const parsed = parseInt(step, 10);
      if (!isNaN(parsed)) dispatch(goToStep(parsed));
    }
    return () => {
      dispatch(reset());
    };
  }, []);

  const currentStep = useAppSelector((state) => state.builder.currentStep);

  const getStepTitle = useCallback(() => {
    if (currentStep >= 1 && currentStep <= 4) {
      return t(`room.builder.step${currentStep}.title`) as string;
    }
    return t("room.movie") as string;
  }, [currentStep, t]);

  const getStepSubtitle = useCallback(() => {
    if (currentStep >= 1 && currentStep <= 4) {
      return t(`room.builder.step${currentStep}.subtitle`);
    }
    return "";
  }, [currentStep, t]);

  const renderStep = useMemo(() => {
    switch (currentStep) {
      case 1:
        return <Step1GameType key="step1" />;
      case 2:
        return <Step2Genres key="step2" />;
      case 3:
        return <Step3Providers key="step3" />;
      case 4:
        return <Step4SpecialCategories key="step4" />;
      default:
        return null;
    }
  }, [currentStep]);

  const handleBackPress = useCallback(() => {
    if (currentStep > 1) {
      dispatch(goBack());
    } else if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/(tabs)");
    }
  }, [currentStep, dispatch]);

  return (
    <View style={{ flex: 1, backgroundColor: "#000" }}>
      <PageHeading
        onPress={handleBackPress}
        showBackButton
        gradientHeight={100}
        showGradientBackground={false}
        useSafeArea={false}
        title={getStepTitle()}
      >
        <CircularStepProgress currentStep={currentStep} totalSteps={4} />
      </PageHeading>

      <StepContainer
        currentStep={currentStep}
        isLastStep={currentStep === 4}
        footerSubtitle={getStepSubtitle()}
      >
        {renderStep}
      </StepContainer>
    </View>
  );
}
