import { useCallback, useEffect, useRef, useState } from "react";
import { Dimensions, View } from "react-native";
import PagerView from "react-native-pager-view";
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

      <PagerCategoryScreen />

      <LandingHeader />
    </View>
  );
}

const PagerCategoryScreen = () => {
  const [currentPage, setCurrentPage] = useState(0);
  const [selectedChip, setSelectedChip] = useState("all");

  const { data: chipCategories = [] } = useGetChipCategoriesQuery();

  const handleChipPress = (chip: string) => {
    setSelectedChip(chip);
  };

  const pagerRef = useRef<PagerView>(null);

  useEffect(() => {
    const categoryIndex = chipCategories.findIndex((cat) => cat.id === selectedChip);
    if (categoryIndex !== -1 && categoryIndex !== currentPage) {
      setCurrentPage(categoryIndex);
      pagerRef.current?.setPage(categoryIndex);
    }
  }, [selectedChip, chipCategories]);

  const handlePageSelected = useCallback(
    (e: any) => {
      const pageIndex = e.nativeEvent.position;
      setCurrentPage(pageIndex);

      const category = chipCategories[pageIndex];
      if (category && category.id !== selectedChip) {
        setSelectedChip(category.id);
      }
    },
    [chipCategories, selectedChip]
  );
  return (
    <>
      {chipCategories.length > 0 ? (
        <PagerView
          offscreenPageLimit={2}
          pageMargin={50}
          ref={pagerRef}
          style={{ flex: 1 }}
          initialPage={0}
          onPageSelected={handlePageSelected}
        >
          {chipCategories.map((category, index) => (
            <CategoryPage key={category.id} categoryId={category.id} isBecomingActive={Math.abs(currentPage - index) <= 1} />
          ))}
        </PagerView>
      ) : (
        <LoadingSkeleton />
      )}

      <CategoryPagerIndicator chipCategories={chipCategories} selectedChip={selectedChip} onChipPress={handleChipPress} />
    </>
  );
};
