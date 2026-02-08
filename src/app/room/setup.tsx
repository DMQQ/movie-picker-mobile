import { useCallback, useEffect, useMemo } from "react";
import { View, Alert } from "react-native";
import { router } from "expo-router";
import PageHeading from "../../components/PageHeading";
import StepContainer from "../../components/Room/StepContainer";
import Step1GameType from "../../components/Room/BuilderSteps/Step1GameType";
import Step2Genres from "../../components/Room/BuilderSteps/Step2Genres";
import Step3Providers from "../../components/Room/BuilderSteps/Step3Providers";
import Step4SpecialCategories from "../../components/Room/BuilderSteps/Step4SpecialCategories";
import Step5Duration from "../../components/Room/BuilderSteps/Step5Duration";
import useTranslation from "../../service/useTranslation";
import { useAppDispatch, useAppSelector } from "../../redux/store";
import { reset } from "../../redux/roomBuilder/roomBuilderSlice";

export default function RoomSetup() {
  const t = useTranslation();
  const dispatch = useAppDispatch();

  useEffect(() => {
    return () => {
      dispatch(reset());
    };
  }, []);

  const currentStep = useAppSelector((state) => state.builder.currentStep);

  const getStepTitle = useCallback(() => {
    if (currentStep >= 1 && currentStep <= 5) {
      return t(`room.builder.step${currentStep}.title`);
    }
    return t("room.movie");
  }, [currentStep, t]);

  const getStepSubtitle = useCallback(() => {
    if (currentStep >= 1 && currentStep <= 5) {
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
      case 5:
        return <Step5Duration key="step5" />;
      default:
        return null;
    }
  }, [currentStep]);

  const handleBackPress = useCallback(() => {
    if (currentStep > 1) {
      Alert.alert(
        t("common.confirmation"),
        t("room.builder.leaveStepConfirmation"),
        [
          {
            text: t("common.cancel"),
            style: "cancel",
          },
          {
            text: t("common.yes"),
            style: "destructive",
            onPress: () => {
              router.back();
            },
          },
        ],
        { cancelable: true },
      );
    } else {
      router.back();
    }
  }, [currentStep]);

  return (
    <View style={{ flex: 1, backgroundColor: "#000" }}>
      <PageHeading
        onPress={handleBackPress}
        showBackButton={currentStep === 1}
        gradientHeight={100}
        showGradientBackground={false}
        useSafeArea={false}
        title={getStepTitle()}
      />

      <StepContainer currentStep={currentStep} totalSteps={5} isLastStep={currentStep === 5} footerSubtitle={getStepSubtitle()}>
        {renderStep}
      </StepContainer>
    </View>
  );
}
