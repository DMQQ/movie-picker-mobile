import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { View } from "react-native";
import PagerView from "react-native-pager-view";
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
      {/* <AppLoadingOverlay /> */}
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
      pagerRef.current?.setPageWithoutAnimation(categoryIndex);
    }
  }, [selectedChip, chipCategories, currentPage]);

  const handlePageSelected = useCallback(
    (e: any) => {
      const pageIndex = e.nativeEvent.position;
      setCurrentPage(pageIndex);

      const category = chipCategories[pageIndex];
      if (category && category.id !== selectedChip) {
        setSelectedChip(category.id);
      }
    },
    [chipCategories, selectedChip],
  );

  const categories = useMemo(
    () =>
      chipCategories.map((category, index) =>
        Math.abs(currentPage - index) <= 1 ? (
          <CategoryPage key={category.id} categoryId={category.id} />
        ) : (
          <View key={category.id} style={{ flex: 1 }} />
        ),
      ),
    [chipCategories?.length, currentPage],
  );

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
        <PagerView
          offscreenPageLimit={2}
          pageMargin={0}
          ref={pagerRef}
          style={{ flex: 1 }}
          initialPage={0}
          onPageSelected={handlePageSelected}
          orientation={"horizontal"}
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
