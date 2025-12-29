import { useEffect, useState } from "react";
import { View, Platform } from "react-native";
import { router } from "expo-router";
import PageHeading from "../../components/PageHeading";
import StepContainer from "../../components/Room/StepContainer";
import Step1GameType from "../../components/Room/BuilderSteps/Step1GameType";
import Step2Genres from "../../components/Room/BuilderSteps/Step2Genres";
import Step3Providers from "../../components/Room/BuilderSteps/Step3Providers";
import Step4SpecialCategories from "../../components/Room/BuilderSteps/Step4SpecialCategories";
import Step5Duration from "../../components/Room/BuilderSteps/Step5Duration";
import { useRoomBuilder } from "../../hooks/useRoomBuilder";
import { useBuilderPreferences } from "../../hooks/useBuilderPreferences";
import useTranslation from "../../service/useTranslation";

export default function RoomSetup() {
  const t = useTranslation();
  const { state, actions } = useRoomBuilder();
  const { preferences, savePreferences, clearPreferences } = useBuilderPreferences();
  const [rememberProviders, setRememberProviders] = useState(false);

  // Load saved preferences on mount
  useEffect(() => {
    if (preferences?.providers && preferences.providers.length > 0) {
      actions.setProviders(preferences.providers);
      setRememberProviders(true);
    }
  }, [preferences]);

  // Save preferences when toggle changes
  useEffect(() => {
    if (rememberProviders && state.providers.length > 0) {
      savePreferences({ providers: state.providers });
    }
  }, [rememberProviders, state.providers]);

  const handleToggleRememberProviders = (remember: boolean) => {
    setRememberProviders(remember);
    if (!remember) {
      // Don't clear immediately, just stop saving
    }
  };

  const handleClearSavedProviders = async () => {
    await clearPreferences();
    setRememberProviders(false);
  };

  const canGoNext = () => {
    switch (state.currentStep) {
      case 1:
        return !!state.category; // Category is required
      case 2:
      case 3:
      case 4:
      case 5:
        return true; // All other steps are optional
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (state.currentStep === 5) {
      // Final step - create room
      handleCreateRoom();
    } else {
      actions.goNext();
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

  const getStepTitle = () => {
    switch (state.currentStep) {
      case 1:
        return t("room.builder.step1.title");
      case 2:
        return t("room.builder.step2.title");
      case 3:
        return t("room.builder.step3.title");
      case 4:
        return t("room.builder.step4.title");
      case 5:
        return t("room.builder.step5.title");
      default:
        return t("room.movie");
    }
  };

  const getStepSubtitle = () => {
    switch (state.currentStep) {
      case 1:
        return t("room.builder.step1.subtitle");
      case 2:
        return t("room.builder.step2.subtitle");
      case 3:
        return t("room.builder.step3.subtitle");
      case 4:
        return t("room.builder.step4.subtitle");
      case 5:
        return t("room.builder.step5.subtitle");
      default:
        return "";
    }
  };

  const renderStep = () => {
    switch (state.currentStep) {
      case 1:
        return <Step1GameType selectedCategory={state.category} onSelectCategory={actions.setCategory} />;
      case 2:
        return <Step2Genres gameType={state.gameType} selectedGenres={state.genres} onToggleGenre={actions.toggleGenre} />;
      case 3:
        return (
          <Step3Providers
            selectedProviders={state.providers}
            onUpdateProviders={actions.setProviders}
            savedProviders={preferences?.providers || null}
            onToggleRememberProviders={handleToggleRememberProviders}
            onClearSavedProviders={handleClearSavedProviders}
            rememberProviders={rememberProviders}
          />
        );
      case 4:
        return (
          <Step4SpecialCategories
            key="step4"
            selectedCategories={state.specialCategories}
            onToggleCategory={actions.toggleSpecialCategory}
            gameType={state.gameType}
          />
        );
      case 5:
        return (
          <Step5Duration
            key="step5"
            selectedDuration={state.maxRounds}
            onSelectDuration={actions.setMaxRounds}
            category={state.category}
            genres={state.genres}
            providers={state.providers}
            specialCategories={state.specialCategories}
          />
        );
      default:
        return null;
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#000" }}>
      <PageHeading gradientHeight={100} showGradientBackground={false} useSafeArea={Platform.OS === "android"} title={getStepTitle()} />

      <StepContainer
        currentStep={state.currentStep}
        totalSteps={5}
        onBack={actions.goBack}
        onNext={handleNext}
        canGoNext={canGoNext()}
        isLastStep={state.currentStep === 5}
        footerSubtitle={getStepSubtitle()}
      >
        {renderStep()}
      </StepContainer>
    </View>
  );
}
