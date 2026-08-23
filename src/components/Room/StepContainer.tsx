import React, { useCallback, useEffect } from "react";
import IconButton from "../IconButton";
import { View, StyleSheet } from "react-native";

import PrimaryButton from "../PrimaryButton";
import Text from "../Text";
import SetupStepShell from "../Setup/SetupStepShell";
import useTranslation from "../../service/useTranslation";
import { useAppDispatch, useAppSelector } from "../../redux/store";
import { router } from "expo-router";
import {
  goNext,
  goToStep,
  setCustomMovies,
  setQuickStartMode,
} from "../../redux/roomBuilder/roomBuilderSlice";
import { moviePickerActions } from "../../redux/moviePicker/moviePickerSlice";
import { useBuilderPreferences } from "../../hooks/useBuilderPreferences";
import { radius, spacing, colors, fontSize, fontWeight } from "../../constants/design";
import { posthog } from "../../constants/posthog";

const MIN_CUSTOM_MOVIES = 20;

interface StepContainerProps {
  currentStep: number;
  isLastStep?: boolean;
  nextButtonText?: string;
  children: React.ReactNode;
}

const StepContainer: React.FC<StepContainerProps> = ({
  currentStep,
  isLastStep = false,
  nextButtonText,
  children,
}) => {
  const dispatch = useAppDispatch();
  const t = useTranslation();
  const category = useAppSelector((state) => state.builder.category);
  const state = useAppSelector((state) => state.builder);
  const { preferences: savedProviders, isLoading: providersLoading } =
    useBuilderPreferences();
  const hasProviders =
    savedProviders?.providers && savedProviders.providers.length > 0;

  const isPickerConfirmed = useAppSelector((s) => s.moviePicker.confirmed);
  const pickedMovies = useAppSelector((s) => s.moviePicker.selected);

  useEffect(() => {
    if (!isPickerConfirmed) return;
    dispatch(moviePickerActions.clearConfirmed());
    if (pickedMovies.length > 0) {
      dispatch(setCustomMovies(pickedMovies));
    }
  }, [isPickerConfirmed]);

  const canGoNext = () => {
    switch (currentStep) {
      case 1:
        return !!category || state.customMovies.length >= MIN_CUSTOM_MOVIES;
      case 2:
      case 3:
      case 4:
        return true;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (currentStep === 4 || (currentStep === 3 && state.quickStartMode)) {
      handleCreateRoom();
    } else {
      dispatch(goNext());
    }
  };

  const handleCreateRoom = () => {
    posthog?.capture("room_setup_completed", {
      category: state.category,
      game_type: state.gameType,
      is_quick_start: state.quickStartMode,
      selected_genre_count: state.genres.length,
      selected_provider_count: state.providers.length,
      selected_special_category_count: state.specialCategories.length,
    });
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

  const handleQuickStart = useCallback(() => {
    if (state.customMovies.length >= MIN_CUSTOM_MOVIES) {
      posthog?.capture("room_setup_completed", { custom_movies_count: state.customMovies.length, is_quick_start: false });
      router.push({
        pathname: "/room/qr-code",
        params: {
          roomSetup: JSON.stringify({
            category: "movies/discover",
            customMovies: state.customMovies,
            maxRounds: 0,
            genre: [],
            providers: [],
            specialCategories: [],
          }),
        },
      });
      return;
    }
    if (hasProviders) {
      posthog?.capture("room_setup_completed", {
        category: state.category,
        game_type: state.gameType,
        is_quick_start: true,
        selected_genre_count: 0,
        selected_provider_count: savedProviders?.providers.length ?? 0,
        selected_special_category_count: 0,
      });
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
  }, [hasProviders, state.category, state.gameType, state.customMovies, savedProviders, dispatch]);

  const handleFilters = useCallback(() => {
    dispatch(goNext());
  }, [dispatch]);

  const footerActions =
    currentStep === 1 ? (
      state.customMovies.length > 0 ? (
        <PrimaryButton
          style={styles.nextButton}
          disabled={state.customMovies.length < MIN_CUSTOM_MOVIES}
          onPress={handleQuickStart}
        >
          {state.customMovies.length >= MIN_CUSTOM_MOVIES
            ? t("room.builder.createRoom")
            : `${t("eitherOr.setup.custom")} (${state.customMovies.length}/${MIN_CUSTOM_MOVIES})`}
        </PrimaryButton>
      ) : (
        <View style={styles.step1NavigationRow}>
          <PrimaryButton
            style={styles.quickStartButton}
            disabled={!canGoNext() || providersLoading}
            onPress={handleQuickStart}
          >
            {t("room.builder.quickStart")}
          </PrimaryButton>
          <IconButton
            icon="tune-variant"
            size={24}
            onPress={handleFilters}
            mode="contained"
            disabled={!canGoNext()}
          />
        </View>
      )
    ) : (
      <PrimaryButton
        style={styles.nextButton}
        disabled={!canGoNext()}
        onPress={handleNext}
      >
        {nextButtonText ||
          (isLastStep || (currentStep === 3 && state.quickStartMode)
            ? t("room.builder.createRoom")
            : t("room.builder.next"))}
      </PrimaryButton>
    );

  return (
    <SetupStepShell stepKey={currentStep} footerActions={footerActions}>
      {children}
    </SetupStepShell>
  );
};

const styles = StyleSheet.create({
  nextButton: {
    borderRadius: radius.pill,
  },
  step1NavigationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  quickStartButton: {
    flex: 1,
    borderRadius: radius.pill,
  },
});

export default StepContainer;
