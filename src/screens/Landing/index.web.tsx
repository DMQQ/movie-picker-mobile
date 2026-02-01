import { memo, useCallback, useState } from "react";
import { View } from "react-native";
import { useGetChipCategoriesQuery } from "../../redux/movie/movieApi";
import AppLoadingOverlay from "../../components/AppLoadingOverlay";
import LandingHeader from "../../components/LandingHeader";
import NoConnectionError from "../../components/NoConnectionError";
import CategoryPage from "../../components/Landing/CategoryPage";
import CategoryPagerIndicator from "../../components/Landing/CategoryPagerIndicator";
import LoadingSkeleton from "../../components/Landing/LoadingSkeleton";

export default function Landing() {
  return (
    <View style={{ flex: 1, backgroundColor: "#000" }}>
      <AppLoadingOverlay />
      <NoConnectionError />

      <CategoryScreen />

      <LandingHeader />
    </View>
  );
}

const CategoryScreen = memo(() => {
  const [selectedChip, setSelectedChip] = useState("all");

  const { data: chipCategories = [] } = useGetChipCategoriesQuery();

  const handleChipPress = useCallback((chip: string) => {
    setSelectedChip(chip);
  }, []);

  return (
    <View style={{ flex: 1 }}>
      {chipCategories.length > 0 ? (
        <View style={{ flex: 1 }}>
          <CategoryPage categoryId={selectedChip} />
        </View>
      ) : (
        <LoadingSkeleton />
      )}

      <CategoryPagerIndicator chipCategories={chipCategories} selectedChip={selectedChip} onChipPress={handleChipPress} />
    </View>
  );
});
