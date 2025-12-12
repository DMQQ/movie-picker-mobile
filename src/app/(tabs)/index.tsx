import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { View } from "react-native";
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

const PagerCategoryScreen = memo(() => {
  const [currentPage, setCurrentPage] = useState(0);
  const [selectedChip, setSelectedChip] = useState("all");

  const { data: chipCategories = [] } = useGetChipCategoriesQuery();

  const handleChipPress = useCallback((chip: string) => {
    setSelectedChip(chip);
  }, []);

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

  const categories = useMemo(
    () =>
      chipCategories.map((category, index) =>
        Math.abs(currentPage - index) <= 1 ? (
          <CategoryPage key={category.id} categoryId={category.id} />
        ) : (
          <View key={category.id} style={{ flex: 1 }} />
        )
      ),
    [chipCategories?.length, currentPage]
  );

  return (
    <View style={{ flex: 1 }}>
      {chipCategories.length > 0 ? (
        <PagerView
          offscreenPageLimit={0}
          pageMargin={25}
          ref={pagerRef}
          style={{ flex: 1 }}
          initialPage={0}
          onPageSelected={handlePageSelected}
        >
          {categories}
        </PagerView>
      ) : (
        <LoadingSkeleton />
      )}

      <CategoryPagerIndicator chipCategories={chipCategories} selectedChip={selectedChip} onChipPress={handleChipPress} />
    </View>
  );
});
