import { useCallback, useEffect, useMemo, useState } from "react";
import { StyleSheet, View } from "react-native";
import { router } from "expo-router";
import SetupHeader from "../../components/Setup/SetupHeader";
import SetupStepShell from "../../components/Setup/SetupStepShell";
import PrimaryButton from "../../components/PrimaryButton";
import IconButton from "../../components/IconButton";
import Step1Type, { type EitherOrType } from "../../components/EitherOr/Setup/Step1Type";
import StepCustomMovies from "../../components/EitherOr/Setup/StepCustomMovies";
import GenreSwipeStep from "../../components/Setup/GenreSwipeStep";
import Step3BracketSize from "../../components/EitherOr/Setup/Step3BracketSize";
import ProviderSearchStep from "../../components/Setup/ProviderSearchStep";
import useTranslation from "../../service/useTranslation";
import useEitherOrContext from "../../context/EitherOrContext";
import { useAppDispatch, useAppSelector } from "../../redux/store";
import { selectProviders } from "../../redux/filterPreferences/filterPreferencesSlice";
import { useBuilderPreferences } from "../../hooks/useBuilderPreferences";
import { moviePickerActions, type PickedMovie } from "../../redux/moviePicker/moviePickerSlice";
import { colors, radius, spacing } from "../../constants/design";
import { posthog } from "../../constants/posthog";

const STANDARD_STEPS = 4;
const CUSTOM_STEPS = 2; // type → pick movies
const BRACKET_SIZE = 16;

export default function EitherOrSetup() {
  const t = useTranslation();
  const dispatch = useAppDispatch();
  const { createRoom } = useEitherOrContext();
  const savedProviders = useAppSelector(selectProviders);
  const pickerConfirmed = useAppSelector((s) => s.moviePicker.confirmed);
  const pickerSelected = useAppSelector((s) => s.moviePicker.selected);

  const existingRoomId = useAppSelector((s) => s.eitherOr.roomId);
  const isCustomRoom = useAppSelector((s) => s.eitherOr.isCustomRoom);

  const [step, setStep] = useState(1);
  const [type, setType] = useState<EitherOrType>("movie");
  const [genres, setGenres] = useState<number[]>([]);
  const [providers, setProviders] = useState<number[]>(savedProviders);
  const [customMovies, setCustomMovies] = useState<PickedMovie[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const { preferences: savedPrefs, isLoading: prefsLoading } = useBuilderPreferences();
  const hasSavedProviders = savedPrefs && savedPrefs.providers.length > 0;

  const isCustom = type === "custom";
  const totalSteps = isCustom ? CUSTOM_STEPS : STANDARD_STEPS;

  // Sync picker selection back — setup stays mounted under the picker in the stack
  useEffect(() => {
    if (pickerConfirmed) {
      setCustomMovies(pickerSelected);
      dispatch(moviePickerActions.clearConfirmed());
    }
  }, [pickerConfirmed]);

  // Sync changes to picker selection (e.g., removing movies in the grid)
  useEffect(() => {
    if (isCustom && step === 2) {
      setCustomMovies(pickerSelected);
    }
  }, [pickerSelected, isCustom, step]);

  const onSelectType = useCallback((next: EitherOrType) => {
    setType((prev) => {
      if (prev !== next) setGenres([]);
      return next;
    });
  }, []);

  const handlePickCustom = useCallback(() => {
    dispatch(moviePickerActions.init({ initial: customMovies }));
    router.push("/movie-picker");
  }, [dispatch, customMovies]);

  const onToggleGenre = useCallback((id: number) => {
    setGenres((prev) => (prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id]));
  }, []);

  const onCreate = useCallback(async () => {
    setIsCreating(true);
    posthog?.capture("either_or_create_tapped", { type, bracketSize, is_custom: isCustom });

    const config = isCustom
      ? { bracketSize: BRACKET_SIZE, movies: customMovies }
      : { type: type as "movie" | "tv", genre: genres, providers, bracketSize: BRACKET_SIZE };

    const roomId = await createRoom(config);
    setIsCreating(false);

    if (roomId) router.push(`/either-or/${roomId}`);
  }, [createRoom, type, genres, providers, isCustom, customMovies]);

  const handleQuickStart = useCallback(async () => {
    if (isCustom) {
      setStep(2);
      return;
    }
    if (hasSavedProviders) {
      setIsCreating(true);
      posthog?.capture("either_or_create_tapped", { type, bracketSize: BRACKET_SIZE, quick_start: true });
      const roomId = await createRoom({ type: type as "movie" | "tv", genre: [], providers: savedPrefs!.providers, bracketSize: BRACKET_SIZE });
      setIsCreating(false);
      if (roomId) router.push(`/either-or/${roomId}`);
    } else {
      setStep(totalSteps);
    }
  }, [hasSavedProviders, savedPrefs, createRoom, type, isCustom, totalSteps]);

  const handleNext = useCallback(() => {
    if (step === totalSteps) {
      onCreate();
    } else {
      setStep((s) => Math.min(totalSteps, s + 1));
    }
  }, [step, totalSteps, onCreate]);

  const handleBackPress = useCallback(() => {
    if (step > 1) {
      setStep((s) => s - 1);
    } else if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/(tabs)");
    }
  }, [step]);

  // Step labels vary by mode
  const getStepTitle = useCallback(() => {
    if (step === 1) return t("room.builder.step1.title") as string;
    if (isCustom && step === 2) return t("eitherOr.setup.custom") as string || "Pick Movies";
    if (step === 2) return t("room.builder.step2.title") as string;
    if (step === 3) return t("eitherOr.setup.bracketSize") as string;
    return t("room.builder.step3.title") as string;
  }, [step, isCustom, t]);

  // Map logical step → which standard step index for bracket/providers
  const standardStep = isCustom ? -1 : step;

  const renderStep = useMemo(() => {
    const lockedTypes: EitherOrType[] | undefined = existingRoomId && isCustomRoom !== null
      ? isCustomRoom ? ["custom"] : ["movie", "tv"]
      : undefined;
    if (step === 1) return <Step1Type key="step1" type={type} onSelect={onSelectType} visibleTypes={lockedTypes} customMovies={customMovies} onPickCustom={handlePickCustom} />;
    if (isCustom && step === 2) return <StepCustomMovies key="step-custom" movies={customMovies} />;
    if (!isCustom && step === 2) return <GenreSwipeStep key="step2" type={type as "movie" | "tv"} genres={genres} onToggleGenre={onToggleGenre} />;
    if (!isCustom && step === 3) return <Step3BracketSize key="step3" bracketSize={BRACKET_SIZE} onSelect={() => {}} />;
    if (!isCustom && step === 4) return <ProviderSearchStep key="step4" providers={providers} onChangeProviders={setProviders} />;
    return null;
  }, [step, type, isCustom, customMovies, genres, providers, onSelectType, onToggleGenre]);

  const isLastStep = step === totalSteps;
  const canProceedCustomMovies = !isCustom || customMovies.length >= 4;
  const canCreate = !isCustom || customMovies.length >= BRACKET_SIZE;

  return (
    <View style={{ flex: 1, backgroundColor: colors.appBackground }}>
      <SetupHeader title={getStepTitle()} currentStep={step} totalSteps={totalSteps} onBackPress={handleBackPress} />

      <SetupStepShell
        stepKey={step}
        footerActions={
          step === 1 ? (
            <View style={styles.step1Row}>
              <PrimaryButton
                style={styles.quickStartButton}
                onPress={handleQuickStart}
                loading={isCreating}
                disabled={isCreating || (!isCustom && prefsLoading)}
              >
                {isCustom ? t("eitherOr.setup.custom") ?? "Pick Movies" : t("room.builder.quickStart")}
              </PrimaryButton>
              {!isCustom && (
                <IconButton
                  icon="tune-variant"
                  size={24}
                  onPress={() => setStep(2)}
                  mode="contained"
                  disabled={isCreating}
                />
              )}
            </View>
          ) : (
            <PrimaryButton
              style={styles.nextButton}
              onPress={handleNext}
              loading={isCreating}
              disabled={isCreating || (isLastStep && !canCreate) || !canProceedCustomMovies}
            >
              {isLastStep ? t("eitherOr.setup.create") : t("room.builder.next")}
            </PrimaryButton>
          )
        }
      >
        {renderStep}
      </SetupStepShell>
    </View>
  );
}

const styles = StyleSheet.create({
  nextButton: {
    borderRadius: radius.pill,
  },
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
