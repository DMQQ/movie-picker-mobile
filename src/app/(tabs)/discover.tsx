import { memo, useCallback, useState } from "react";
import { StyleSheet, View } from "react-native";
import { useGetChipCategoriesQuery } from "../../redux/movie/movieApi";
import LandingHeader from "../../components/LandingHeader";
import CategoryPage from "../../components/Landing/CategoryPage";
import CategoryPagerIndicator from "../../components/Landing/CategoryPagerIndicator";
import LoadingSkeleton from "../../components/Landing/LoadingSkeleton";
import useIsMounted from "../../hooks/useIsMounted";
import { FeaturedSectionSkeleton } from "../../components/Landing/FeaturedSection";
import SafeIOSContainer from "../../components/SafeIOSContainer";

export default function Landing() {
  return (
    <View style={{ flex: 1, backgroundColor: "#000" }}>
      <PagerCategoryScreen />
      <LandingHeader />
    </View>
  );
}

const PagerCategoryScreen = memo(() => {
  const [selectedChip, setSelectedChip] = useState("all");

  const { data: chipCategoriesData } = useGetChipCategoriesQuery();
  const chipCategories = chipCategoriesData ?? [];

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

  return (
    <SafeIOSContainer style={{ flex: 1, paddingBottom: 0 }}>
      {chipCategories.length === 0 && (
        <View style={StyleSheet.absoluteFill}>
          <LoadingSkeleton />
        </View>
      )}
      <CategoryPage key={selectedChip} categoryId={selectedChip} />

      <CategoryPagerIndicator
        chipCategories={chipCategories}
        selectedChip={selectedChip}
        onChipPress={handleChipPress}
      />
    </SafeIOSContainer>
  );
});
