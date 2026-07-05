import { memo, useCallback, useState } from "react";
import { View } from "react-native";
import { useGetChipCategoriesQuery } from "../../redux/movie/movieApi";
import LandingHeader from "../../components/LandingHeader";
import NoConnectionError from "../../components/NoConnectionError";
import CategoryPage from "../../components/Landing/CategoryPage";
import CategoryPagerIndicator from "../../components/Landing/CategoryPagerIndicator";
import LoadingSkeleton from "../../components/Landing/LoadingSkeleton";
import useIsMounted from "../../hooks/useIsMounted";
import { FeaturedSectionSkeleton } from "../../components/Landing/FeaturedSection";

export default function Landing() {
  return (
    <View style={{ flex: 1, backgroundColor: "#000", paddingBottom: 15 }}>
      <NoConnectionError />
      <PagerCategoryScreen />
      <LandingHeader />
    </View>
  );
}

const PagerCategoryScreen = memo(() => {
  const [selectedChip, setSelectedChip] = useState("all");

  const { data: chipCategories = [] } = useGetChipCategoriesQuery();

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
    <View style={{ flex: 1 }}>
      {chipCategories.length > 0 ? (
        <CategoryPage key={selectedChip} categoryId={selectedChip} />
      ) : (
        <LoadingSkeleton />
      )}

      <CategoryPagerIndicator
        chipCategories={chipCategories}
        selectedChip={selectedChip}
        onChipPress={handleChipPress}
      />
    </View>
  );
});
