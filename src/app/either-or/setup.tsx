import { useCallback, useEffect, useMemo, useState } from "react";
import { StyleSheet, View } from "react-native";
import { router } from "expo-router";
import SetupHeader from "../../components/Setup/SetupHeader";
import SetupStepShell from "../../components/Setup/SetupStepShell";
import PrimaryButton from "../../components/PrimaryButton";
import IconButton from "../../components/IconButton";
import Step1Type, { type EitherOrType } from "../../components/EitherOr/Setup/Step1Type";
import GenreSwipeStep from "../../components/Setup/GenreSwipeStep";
import ProviderSearchStep from "../../components/Setup/ProviderSearchStep";
import useTranslation from "../../service/useTranslation";
import useEitherOrContext from "../../context/EitherOrContext";
import { useAppDispatch, useAppSelector } from "../../redux/store";
import { selectProviders } from "../../redux/filterPreferences/filterPreferencesSlice";
import { usePartySocket } from "../../context/PartySocketContext";
import { useBuilderPreferences } from "../../hooks/useBuilderPreferences";
import { moviePickerActions, type PickedMovie } from "../../redux/moviePicker/moviePickerSlice";
import { colors, radius, spacing, fontSize, fontWeight } from "../../constants/design";
import { posthog } from "../../constants/posthog";

const STANDARD_STEPS = 3;
const BRACKET_SIZE = 16;

export default function EitherOrSetup() {
  const t = useTranslation();
  const dispatch = useAppDispatch();
  const { createRoom } = useEitherOrContext();
  const partySocket = usePartySocket();
  const partyId = useAppSelector((s) => s.party.partyId);
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
    router.push({ pathname: "/movie-picker", params: { requiredCount: BRACKET_SIZE } } as any);
  }, [dispatch, customMovies]);

  const onToggleGenre = useCallback((id: number) => {
    setGenres((prev) => (prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id]));
  }, []);

  const onCreate = useCallback(async () => {
    setIsCreating(true);
    posthog?.capture("either_or_create_tapped", { type, bracketSize: BRACKET_SIZE, is_custom: isCustom });

    const config = isCustom
      ? { bracketSize: BRACKET_SIZE, movies: customMovies }
      : { type: type as "movie" | "tv", genre: genres, providers, bracketSize: BRACKET_SIZE };

    const roomId = await createRoom(config);
    setIsCreating(false);

    if (roomId) {
      if (partyId && partySocket) {
        partySocket.emit("party:ready", { partyId, roomId, gameMode: "either-or" });
      }
      router.push(`/either-or/${roomId}`);
    }
  }, [createRoom, type, genres, providers, isCustom, customMovies, partyId, partySocket]);

  const handleQuickStart = useCallback(async () => {
    if (isCustom) {
      if (customMovies.length >= BRACKET_SIZE) {
        await onCreate();
      }
      return;
    }
    if (hasSavedProviders) {
      setIsCreating(true);
      posthog?.capture("either_or_create_tapped", { type, bracketSize: BRACKET_SIZE, quick_start: true });
      const roomId = await createRoom({ type: type as "movie" | "tv", genre: [], providers: savedPrefs!.providers, bracketSize: BRACKET_SIZE });
      setIsCreating(false);
      if (roomId) {
        if (partyId && partySocket) {
          partySocket.emit("party:ready", { partyId, roomId, gameMode: "either-or" });
        }
        router.push(`/either-or/${roomId}`);
      }
    } else {
      setStep(STANDARD_STEPS);
    }
  }, [hasSavedProviders, savedPrefs, createRoom, type, isCustom, customMovies, onCreate, partyId, partySocket]);

  const totalSteps = isCustom ? 1 : STANDARD_STEPS;

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
    if (step === 2) return t("room.builder.step2.title") as string;
    return t("room.builder.step3.title") as string;
  }, [step, t]);

  const renderStep = useMemo(() => {
    const lockedTypes: EitherOrType[] | undefined = existingRoomId && isCustomRoom !== null
      ? isCustomRoom ? ["custom"] : ["movie", "tv"]
      : undefined;
    if (step === 1) return <Step1Type key="step1" type={type} onSelect={onSelectType} visibleTypes={lockedTypes} customMovies={customMovies} onPickCustom={handlePickCustom} />;
    if (!isCustom && step === 2) return <GenreSwipeStep key="step2" type={type as "movie" | "tv"} genres={genres} onToggleGenre={onToggleGenre} />;
    if (!isCustom && step === 3) return <ProviderSearchStep key="step3" providers={providers} onChangeProviders={setProviders} />;
    return null;
  }, [step, type, isCustom, genres, providers, onSelectType, onToggleGenre]);

  const isLastStep = step === totalSteps;
  const canCreate = !isCustom || customMovies.length >= BRACKET_SIZE;

  return (
    <View style={{ flex: 1, backgroundColor: colors.appBackground }}>
      <SetupHeader title={getStepTitle()} currentStep={step} totalSteps={totalSteps} onBackPress={handleBackPress} />

      <SetupStepShell
        stepKey={step}
        footerActions={
          step === 1 ? (
            <View style={styles.step1Column}>
              <View style={styles.step1Row}>
                <PrimaryButton
                  style={styles.quickStartButton}
                  onPress={handleQuickStart}
                  loading={isCreating}
                  disabled={isCreating || (!isCustom && prefsLoading) || !canCreate}
                >
                  {isCustom
                    ? customMovies.length >= BRACKET_SIZE
                      ? (t("eitherOr.setup.create") as string) ?? "Create bracket"
                      : `${t("eitherOr.setup.custom") as string} (${customMovies.length}/${BRACKET_SIZE})`
                    : t("room.builder.quickStart")
                  }
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
            </View>
          ) : (
            <PrimaryButton
              style={styles.nextButton}
              onPress={handleNext}
              loading={isCreating}
              disabled={isCreating || (isLastStep && !canCreate)}
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
  step1Column: {
    gap: spacing.md,
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
