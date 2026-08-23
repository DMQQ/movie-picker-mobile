import { useCallback, useEffect, useMemo, useState } from "react";

import PrimaryButton from "../../components/PrimaryButton";
import IconButton from "../../components/IconButton";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import PickCategory from "../../components/Voter/PickCategory";
import GenreSwipeStep from "../../components/Setup/GenreSwipeStep";
import ProviderSearchStep from "../../components/Setup/ProviderSearchStep";
import SetupHeader from "../../components/Setup/SetupHeader";
import SetupStepShell from "../../components/Setup/SetupStepShell";
import useTranslation from "../../service/useTranslation";
import { useBuilderPreferences } from "../../hooks/useBuilderPreferences";
import { StyleSheet, View } from "react-native";
import { radius, spacing } from "../../constants/design";
import { router } from "expo-router";
import { useAppDispatch, useAppSelector } from "../../redux/store";
import { moviePickerActions, type PickedMovie } from "../../redux/moviePicker/moviePickerSlice";

const TOTAL_STEPS = 3;

interface Props {
  sessionSettings: any;
  actions: any;
  onGoBack: () => void;
}

export default function InitialState({
  sessionSettings,
  actions,
  onGoBack,
}: Props) {
  const t = useTranslation();
  const dispatch = useAppDispatch();
  const [step, setStep] = useState(1);
  const [customMovies, setCustomMovies] = useState<PickedMovie[]>([]);
  const pickerConfirmed = useAppSelector((s) => s.moviePicker.confirmed);
  const pickerSelected = useAppSelector((s) => s.moviePicker.selected);
  const { preferences: savedPrefs, isLoading: prefsLoading } = useBuilderPreferences();
  const hasSavedProviders = savedPrefs && savedPrefs.providers.length > 0;

  useEffect(() => {
    if (pickerConfirmed) {
      setCustomMovies(pickerSelected);
      dispatch(moviePickerActions.clearConfirmed());
    }
  }, [pickerConfirmed]);

  const handlePickCustom = useCallback(() => {
    dispatch(moviePickerActions.init({ initial: customMovies }));
    router.push("/movie-picker");
  }, [dispatch, customMovies]);

  const handleNext = useCallback(() => {
    if (step === TOTAL_STEPS) {
      actions.createSession();
    } else {
      setStep((s) => Math.min(TOTAL_STEPS, s + 1));
    }
  }, [step, actions]);

  const handleQuickStart = useCallback(() => {
    if (hasSavedProviders) {
      actions.createSession({ providers: savedPrefs!.providers, genres: [] });
    } else {
      setStep(TOTAL_STEPS);
    }
  }, [hasSavedProviders, savedPrefs, actions]);

  const handleBackPress = useCallback(() => {
    if (step > 1) {
      setStep((s) => s - 1);
    } else {
      onGoBack();
    }
  }, [step, onGoBack]);

  const stepTitle = useMemo(() => {
    if (step === 1) return t("filters.categories") as string;
    if (step === 2) return t("filters.genres") as string;
    return t("filters.providers") as string;
  }, [step, t]);

  const renderStep = useMemo(() => {
    switch (step) {
      case 1:
        return (
          <PickCategory
            category={sessionSettings.category}
            setCategory={(category: string) => {
              actions.setSessionSettings((p: any) => ({ ...p, category }));
            }}
            customMovies={customMovies}
            onPickCustom={handlePickCustom}
          />
        );
      case 2:
        return (
          <GenreSwipeStep
            type={sessionSettings.category === "Series" ? "tv" : "movie"}
            genres={sessionSettings.genres}
            onToggleGenre={(id: number) => {
              actions.setSessionSettings((p: any) => ({
                ...p,
                genres: p.genres.includes(id) ? p.genres.filter((g: number) => g !== id) : [...p.genres, id],
              }));
            }}
          />
        );
      case 3:
        return (
          <ProviderSearchStep
            providers={sessionSettings.providers}
            onChangeProviders={(providers: number[]) => {
              actions.setSessionSettings((p: any) => ({ ...p, providers }));
            }}
          />
        );
      default:
        return null;
    }
  }, [step, sessionSettings, actions]);

  const footerActions =
    step === 1 ? (
      <View style={styles.step1Row}>
        <PrimaryButton style={styles.quickStartButton} onPress={handleQuickStart} disabled={prefsLoading}>
          {t("room.builder.quickStart")}
        </PrimaryButton>
        <IconButton icon="tune-variant" size={24} onPress={() => setStep(2)} mode="contained" />
      </View>
    ) : (
      <PrimaryButton onPress={handleNext}>
        {step === TOTAL_STEPS ? t("voter.home.create") : t("room.builder.next")}
      </PrimaryButton>
    );

  return (
    <Animated.View
      style={{ flex: 1 }}
      entering={FadeIn.duration(300)}
      exiting={FadeOut.duration(300)}
    >
      <SetupHeader title={stepTitle} currentStep={step} totalSteps={TOTAL_STEPS} onBackPress={handleBackPress} />

      <SetupStepShell stepKey={step} footerActions={footerActions}>
        {renderStep}
      </SetupStepShell>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  step1Row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  quickStartButton: {
    flex: 1,
    borderRadius: radius.pill,
  },
});
