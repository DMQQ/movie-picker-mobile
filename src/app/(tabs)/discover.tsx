import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import PagerView from "react-native-pager-view";
import { useGetChipCategoriesQuery } from "../../redux/movie/movieApi";
import LandingHeader from "../../components/LandingHeader";
import CategoryPage from "../../components/Landing/CategoryPage";
import CategoryPagerIndicator from "../../components/Landing/CategoryPagerIndicator";
import useIsMounted from "../../hooks/useIsMounted";
import SafeIOSContainer from "../../components/SafeIOSContainer";
import Text from "../../components/Text";
import Icon from "../../components/Icon";
import { colors, fontSize, fontWeight, spacing } from "../../constants/design";
import useTranslation from "../../service/useTranslation";
import { TourAttachStep } from "../../components/Tour/TourAttachStep";
import { TourProvider } from "../../components/Tour/TourProvider";
import { type TourRef, type TourStep } from "../../components/Tour/TourContext";
import TutorialTooltip from "../../components/TutorialTooltip";
import { useTutorialSeen, useMarkAllTutorialsSeen, useStableFocus } from "../../hooks/useTutorial";
import PageHeading from "../../components/PageHeading";

export default function Landing() {
  return (
    <View style={{ flex: 1, backgroundColor: colors.appBackground }}>
      <PagerCategoryScreen />
      <LandingHeader />
    </View>
  );
}

const PagerCategoryScreen = memo(() => {
  const [selectedChip, setSelectedChip] = useState("all");
  const t = useTranslation();

  const { data: chipCategoriesData = [], error, isLoading, refetch } = useGetChipCategoriesQuery();

  const tourRef = useRef<TourRef>(null);
  const startedRef = useRef(false);
  const { seen, markSeen } = useTutorialSeen("tutorial_discover_seen");
  const markAllSeen = useMarkAllTutorialsSeen();
  const isFocused = useStableFocus(100);

  const steps = useMemo<TourStep[]>(
    () => [
      {
        render: (props) => (
          <TutorialTooltip
            {...props}
            title={t("tutorial.discover.chips.title") as string}
            description={t("tutorial.discover.chips.description") as string}
          />
        ),
        spotRadius: 16,
        placement: "bottom",
      },
      {
        render: (props) => (
          <TutorialTooltip
            {...props}
            title={t("tutorial.discover.grid.title") as string}
            description={t("tutorial.discover.grid.description") as string}
          />
        ),
        spotRadius: 16,
        placement: "bottom",
      },
    ],
    [t],
  );

  useEffect(() => {
    if (
      seen === false &&
      isFocused &&
      !isLoading &&
      chipCategoriesData.length > 0 &&
      !startedRef.current
    ) {
      startedRef.current = true;
      const timer = setTimeout(() => tourRef.current?.start(), 300);
      return () => clearTimeout(timer);
    }
  }, [seen, isFocused, isLoading, chipCategoriesData]);

  const pagerRef = useRef<PagerView>(null);

  // Only render CategoryPage for pages the user has visited (lazy load)
  const [visitedChips, setVisitedChips] = useState<Set<string>>(() => new Set<string>());

  useEffect(() => {
    if (chipCategoriesData.length > 0) {
      setVisitedChips((prev) => {
        const firstId = chipCategoriesData[0].id;
        if (prev.has(firstId)) return prev;
        return new Set([...prev, firstId]);
      });
    }
  }, [chipCategoriesData]);

  const onPageSelected = useCallback(
    (e: { nativeEvent: { position: number } }) => {
      const chip = chipCategoriesData[e.nativeEvent.position];
      if (!chip) return;
      setSelectedChip(chip.id);
      setVisitedChips((prev) => {
        if (prev.has(chip.id)) return prev;
        return new Set([...prev, chip.id]);
      });
    },
    [chipCategoriesData],
  );

  const handleChipPress = useCallback(
    (chip: string) => {
      const newIndex = chipCategoriesData.findIndex((c) => c.id === chip);
      if (newIndex === -1) return;
      setSelectedChip(chip);
      setVisitedChips((prev) => {
        if (prev.has(chip)) return prev;
        return new Set([...prev, chip]);
      });
      pagerRef.current?.setPageWithoutAnimation(newIndex);
    },
    [chipCategoriesData],
  );

  const isMounted = useIsMounted();

  const activeCategory = useMemo(
    () => chipCategoriesData.find((c) => c.id === selectedChip),
    [selectedChip, chipCategoriesData],
  );

  if (!isMounted) return null;

  if (error && !chipCategoriesData?.length) {
    return (
      <SafeIOSContainer style={{ flex: 1, paddingBottom: 0 }}>
        <View style={styles.error}>
          <Icon source="cloud-off-outline" size={44} color="rgba(255,255,255,0.12)" />
          <Text style={styles.errorText}>{t("landing.loadError") as string}</Text>
          <Pressable style={styles.retryBtn} onPress={() => refetch()}>
            <Text style={styles.retryText}>{t("status-modal.retry") as string}</Text>
          </Pressable>
        </View>
      </SafeIOSContainer>
    );
  }

  return (
    <TourProvider ref={tourRef} steps={steps} onStop={markSeen} onSkip={markAllSeen}>
      <SafeIOSContainer style={{ flex: 1, paddingBottom: 0, paddingTop: 0 }}>
        <PageHeading
          title={activeCategory?.label ?? selectedChip}
          showBackButton={false}
        />
        <TourAttachStep index={1} fill style={{ flex: 1 }}>
          <PagerView
            ref={pagerRef}
            style={{ flex: 1 }}
            initialPage={0}
            onPageSelected={onPageSelected}
            overdrag
          >
            {chipCategoriesData.map((chip) => (
              <View key={chip.id} style={{ flex: 1 }}>
                {visitedChips.has(chip.id) ? <CategoryPage categoryId={chip.id} /> : null}
              </View>
            ))}
          </PagerView>
        </TourAttachStep>

        {chipCategoriesData.length > 0 && (
          <CategoryPagerIndicator
            chipCategories={chipCategoriesData}
            selectedChip={selectedChip}
            onChipPress={handleChipPress}
            tourStepIndex={0}
          />
        )}
      </SafeIOSContainer>
    </TourProvider>
  );
});

const styles = StyleSheet.create({
  error: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm + 2,
    paddingHorizontal: spacing.xxl + 16,
  },
  errorText: {
    fontSize: fontSize.md + 1,
    color: "rgba(255,255,255,0.25)",
    fontWeight: fontWeight.semibold,
  },
  retryBtn: {
    backgroundColor: colors.overlay,
    borderRadius: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  retryText: {
    fontSize: fontSize.sm + 1,
    fontWeight: fontWeight.bold,
    color: colors.text,
    letterSpacing: 0.8,
  },
});
