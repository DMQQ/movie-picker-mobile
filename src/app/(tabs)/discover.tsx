import { memo, useCallback, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { useGetChipCategoriesQuery } from "../../redux/movie/movieApi";
import LandingHeader from "../../components/LandingHeader";
import CategoryPage from "../../components/Landing/CategoryPage";
import CategoryPagerIndicator from "../../components/Landing/CategoryPagerIndicator";
import LoadingSkeleton from "../../components/Landing/LoadingSkeleton";
import useIsMounted from "../../hooks/useIsMounted";
import { FeaturedSectionSkeleton } from "../../components/Landing/FeaturedSection";
import SafeIOSContainer from "../../components/SafeIOSContainer";
import Text from "../../components/Text";
import Icon from "../../components/Icon";
import { colors, fontSize, fontWeight, spacing } from "../../constants/design";
import useTranslation from "../../service/useTranslation";

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

  const handleChipPress = useCallback((chip: string) => {
    setSelectedChip(chip);
  }, []);

  const isMounted = useIsMounted();

  if (!isMounted) {
    return (
      <View style={{ flex: 1 }}>
        <FeaturedSectionSkeleton />
        <LoadingSkeleton />
      </View>
    );
  }

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
    <SafeIOSContainer style={{ flex: 1, paddingBottom: 0 }}>
      {isLoading || chipCategoriesData?.length === 0 ? (
        <View style={StyleSheet.absoluteFill}>
          <LoadingSkeleton />
        </View>
      ) : (
        <>
          <CategoryPage key={selectedChip} categoryId={selectedChip} />

          <CategoryPagerIndicator
            chipCategories={chipCategoriesData ?? []}
            selectedChip={selectedChip}
            onChipPress={handleChipPress}
          />
        </>
      )}
    </SafeIOSContainer>
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
